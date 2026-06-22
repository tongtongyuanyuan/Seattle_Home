'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchOpenHouses, OpenHouse } from '@/lib/api';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  homes?: OpenHouse[];
}

const QUICK_SUGGESTIONS = [
  'Homes under $900k',
  'Eastside open houses',
  'Saturday tours',
  'Good for families',
  'Near downtown Seattle',
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your Seattle home finder. Tell me your budget, preferred area, or timing and I'll find the best matches!"
    }
  ]);
  const [input, setInput] = useState('');
  const [openHouses, setOpenHouses] = useState<OpenHouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Short delay before showing button
  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch all open houses on mount
  useEffect(() => {
    async function loadData() {
      const data = await fetchOpenHouses();
      setOpenHouses(data);
    }
    loadData();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Parse user query and filter homes
  const filterHomes = (query: string): { homes: OpenHouse[]; explanation: string } => {
    const lowerQuery = query.toLowerCase();
    let filtered = [...openHouses];
    const filters: string[] = [];

    // Budget filter - support various formats
    const budgetPatterns = [
      /under\s*\$?(\d+)k?/i,
      /below\s*\$?(\d+)k?/i,
      /less than\s*\$?(\d+)k?/i,
      /max\s*\$?(\d+)k?/i,
      /budget\s*\$?(\d+)k?/i,
      /\$(\d+)k?\s*(or less|max)?/i,
    ];

    for (const pattern of budgetPatterns) {
      const match = lowerQuery.match(pattern);
      if (match) {
        let maxBudget = parseInt(match[1]);
        if (maxBudget < 10000) maxBudget *= 1000; // Handle "900" as "900k"
        filtered = filtered.filter(h => h.price && h.price <= maxBudget);
        filters.push(`under $${(maxBudget / 1000).toFixed(0)}k`);
        break;
      }
    }

    // Day filter
    if (lowerQuery.includes('saturday') || lowerQuery.includes('sat')) {
      filtered = filtered.filter(h => h.open_house_time.toLowerCase().includes('sat'));
      filters.push('Saturday');
    }
    if (lowerQuery.includes('sunday') || lowerQuery.includes('sun')) {
      filtered = filtered.filter(h => h.open_house_time.toLowerCase().includes('sun'));
      filters.push('Sunday');
    }
    if (lowerQuery.includes('weekend')) {
      filtered = filtered.filter(h =>
        h.open_house_time.toLowerCase().includes('sat') ||
        h.open_house_time.toLowerCase().includes('sun')
      );
      filters.push('weekend');
    }

    // Area filter
    const areas = [
      { keywords: ['bellevue'], name: 'Bellevue' },
      { keywords: ['seattle', 'downtown'], name: 'Seattle' },
      { keywords: ['kirkland'], name: 'Kirkland' },
      { keywords: ['redmond'], name: 'Redmond' },
      { keywords: ['issaquah'], name: 'Issaquah' },
      { keywords: ['renton'], name: 'Renton' },
      { keywords: ['mercer island', 'mercer'], name: 'Mercer Island' },
      { keywords: ['eastside', 'east side'], name: 'Eastside' },
      { keywords: ['north seattle', 'northgate'], name: 'North Seattle' },
    ];

    for (const area of areas) {
      if (area.keywords.some(k => lowerQuery.includes(k))) {
        // Area is a hard constraint: always apply it, even when it yields no
        // matches — otherwise we'd silently fall back to showing every home.
        filtered = filtered.filter(h =>
          h.area.toLowerCase().includes(area.name.toLowerCase()) ||
          h.address.toLowerCase().includes(area.name.toLowerCase())
        );
        filters.push(area.name);
        break;
      }
    }

    // Preference keywords (check notes/tags/why_pick)
    const preferences = [
      { keywords: ['school', 'family', 'families', 'kids'], name: 'good schools' },
      { keywords: ['commute', 'work', 'office'], name: 'commute-friendly' },
      { keywords: ['value', 'deal', 'affordable'], name: 'good value' },
      { keywords: ['transit', 'light rail', 'bus'], name: 'transit access' },
      { keywords: ['view', 'views', 'water'], name: 'great views' },
      { keywords: ['new', 'modern', 'updated', 'renovated'], name: 'modern/updated' },
    ];

    for (const pref of preferences) {
      if (pref.keywords.some(k => lowerQuery.includes(k))) {
        const prefFiltered = filtered.filter(h =>
          h.notes?.toLowerCase().includes(pref.keywords[0]) ||
          h.tags?.toLowerCase().includes(pref.keywords[0]) ||
          h.why_pick_1?.toLowerCase().includes(pref.keywords[0]) ||
          h.why_pick_2?.toLowerCase().includes(pref.keywords[0]) ||
          h.why_pick_3?.toLowerCase().includes(pref.keywords[0])
        );
        if (prefFiltered.length > 0) {
          filtered = prefFiltered;
          filters.push(pref.name);
        }
      }
    }

    // Limit to 10 results
    const results = filtered.slice(0, 10);

    // Generate response
    if (results.length === 0) {
      const forWhat = filters.length > 0 ? ` for ${filters.join(', ')}` : '';
      return {
        homes: openHouses.slice(0, 3),
        explanation: `I don't have an exact match${forWhat} right now. Here are a few other picks you might like:`
      };
    }

    const explanation = filters.length > 0
      ? `Found ${results.length} home${results.length !== 1 ? 's' : ''} for ${filters.join(', ')}:`
      : `Here are ${results.length} picks for you:`;

    return { homes: results, explanation };
  };

  const handleSubmit = async (query: string) => {
    if (!query.trim() || openHouses.length === 0) return;

    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setInput('');

    // Simulate thinking
    await new Promise(resolve => setTimeout(resolve, 600));

    // Filter and respond
    const { homes, explanation } = filterHomes(query);

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: explanation,
      homes: homes,
    }]);

    setIsLoading(false);
  };

  const getWhyBullet = (home: OpenHouse): string => {
    if (home.why_pick_1) return home.why_pick_1;
    if (home.notes) {
      const sentences = home.notes.split(/[.,;]/).filter(s => s.trim().length > 5);
      return sentences[0]?.trim() || home.notes;
    }
    return 'Curated by our team';
  };

  // Don't render anything until button should show
  if (!showButton && !isOpen) return null;

  return (
    <>
      {/* Chat Toggle Button - visible and inviting */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 z-50 ${
          isOpen
            ? 'w-14 h-14 rounded-full justify-center'
            : 'px-5 py-3 rounded-full animate-bounce-gentle'
        }`}
        aria-label="Chat with us"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium text-sm whitespace-nowrap">Find Your Home</span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 w-[360px] max-w-[calc(100vw-40px)] h-[480px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Seattle Home Finder</p>
              <p className="text-xs text-blue-100">Ask about areas, budget, or timing</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.role === 'user' ? 'flex justify-end' : ''}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>

                {/* Home recommendations */}
                {msg.homes && msg.homes.length > 0 && (
                  <div className="mt-2 space-y-2 w-full">
                    {msg.homes.map((home) => (
                      <div key={home.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-gray-900 text-sm leading-tight">{home.address}</p>
                        </div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-green-600 font-bold text-sm">
                            ${home.price?.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{home.area}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{home.open_house_time}</p>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                          <span className="text-blue-500">•</span> {getWhyBullet(home)}
                        </p>
                        <div className="flex gap-2">
                          <Link
                            href={`/open-houses#home-${home.id}`}
                            onClick={() => setIsOpen(false)}
                            className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700"
                          >
                            View
                          </Link>
                          <a
                            href={home.redfin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-200"
                          >
                            Redfin
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-1 px-4 py-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-400 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubmit(suggestion)}
                    disabled={isLoading}
                    className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit(input); }}
            className="p-3 border-t border-gray-200 bg-white flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about homes..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
