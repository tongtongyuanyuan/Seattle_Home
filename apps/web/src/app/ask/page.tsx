'use client';

import { useState, useEffect } from 'react';
import { fetchOpenHouses, OpenHouse } from '@/lib/api';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  homes?: OpenHouse[];
}

const QUICK_PROMPTS = [
  { label: 'Best value under $900k', query: 'Best value homes under $900k' },
  { label: 'Good commute to Bellevue', query: 'Good commute to Bellevue' },
  { label: 'Near light rail', query: 'Near light rail / transit friendly' },
  { label: 'Good schools focus', query: 'Good schools focus' },
  { label: 'Saturday open houses', query: 'Show me Saturday open houses' },
  { label: 'Sunday open houses', query: 'Show me Sunday open houses' },
];

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [openHouses, setOpenHouses] = useState<OpenHouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all open houses on mount
  useEffect(() => {
    async function loadData() {
      const data = await fetchOpenHouses();
      setOpenHouses(data);
    }
    loadData();
  }, []);

  // Parse user query and filter homes
  const filterHomes = (query: string): { homes: OpenHouse[]; explanation: string } => {
    const lowerQuery = query.toLowerCase();
    let filtered = [...openHouses];
    const filters: string[] = [];

    // Budget filter
    const budgetMatch = lowerQuery.match(/under\s*\$?(\d+)k?/i);
    if (budgetMatch) {
      const maxBudget = parseInt(budgetMatch[1]) * (budgetMatch[1].length <= 3 ? 1000 : 1);
      filtered = filtered.filter(h => h.price && h.price <= maxBudget);
      filters.push(`under $${(maxBudget / 1000).toFixed(0)}k`);
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

    // Area filter
    const areas = ['bellevue', 'seattle', 'kirkland', 'redmond', 'issaquah', 'renton', 'mercer island', 'eastside', 'downtown'];
    for (const area of areas) {
      if (lowerQuery.includes(area)) {
        filtered = filtered.filter(h =>
          h.area.toLowerCase().includes(area) ||
          h.address.toLowerCase().includes(area)
        );
        filters.push(area.charAt(0).toUpperCase() + area.slice(1));
        break;
      }
    }

    // Preference keywords (check notes/tags)
    const preferences = ['schools', 'commute', 'value', 'transit', 'views', 'light rail'];
    for (const pref of preferences) {
      if (lowerQuery.includes(pref)) {
        const prefFiltered = filtered.filter(h =>
          h.notes?.toLowerCase().includes(pref) ||
          h.tags?.toLowerCase().includes(pref) ||
          h.why_pick_1?.toLowerCase().includes(pref) ||
          h.why_pick_2?.toLowerCase().includes(pref) ||
          h.why_pick_3?.toLowerCase().includes(pref)
        );
        if (prefFiltered.length > 0) {
          filtered = prefFiltered;
          filters.push(pref);
        }
      }
    }

    // If no matches, return closest picks
    if (filtered.length === 0) {
      filtered = openHouses.slice(0, 3);
      return {
        homes: filtered,
        explanation: `No exact matches found. Here are some great picks you might like:`
      };
    }

    const explanation = filters.length > 0
      ? `Found ${filtered.length} home${filtered.length !== 1 ? 's' : ''} matching: ${filters.join(', ')}`
      : `Here are ${Math.min(filtered.length, 3)} picks for you:`;

    return { homes: filtered.slice(0, 3), explanation };
  };

  const handleSubmit = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);

    // Add user message
    const userMessage: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 400));

    // No listings loaded -> respond gracefully instead of doing nothing
    if (openHouses.length === 0) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble loading our listings right now. Please try again in a moment, or browse the Open Houses page directly.",
      }]);
      setIsLoading(false);
      return;
    }

    // Filter homes based on query
    const { homes, explanation } = filterHomes(query);

    // Add assistant response
    const assistantMessage: Message = {
      role: 'assistant',
      content: explanation,
      homes: homes,
    };
    setMessages(prev => [...prev, assistantMessage]);
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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask About Our Picks</h1>
        <p className="text-gray-600 mb-6">
          Find the perfect home from our curated listings. Try a quick prompt or ask your own question.
        </p>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2 mb-6">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(prompt.query)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
            >
              {prompt.label}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 min-h-[300px] max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>Click a quick prompt or type your question below</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block max-w-[85%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p>{msg.content}</p>
                  </div>

                  {/* Home recommendations */}
                  {msg.homes && msg.homes.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {msg.homes.map((home) => (
                        <div key={home.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-left">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-gray-900 text-sm">{home.address}</p>
                            <span className="text-green-600 font-bold text-sm">
                              ${home.price?.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            {home.area} • {home.open_house_time}
                          </p>
                          <p className="text-xs text-gray-600 mb-2">
                            <span className="text-blue-500">•</span> {getWhyBullet(home)}
                          </p>
                          <div className="flex gap-2">
                            <Link
                              href={`/open-houses#home-${home.id}`}
                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                            >
                              View Details
                            </Link>
                            <a
                              href={home.redfin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
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
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="animate-bounce">•</div>
                  <div className="animate-bounce delay-100">•</div>
                  <div className="animate-bounce delay-200">•</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit(input); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about homes... (e.g., 'homes under $800k near Bellevue')"
            disabled={isLoading || openHouses.length === 0}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ask
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-3 text-center">
          Results are based on our curated team listings only.
        </p>
      </div>
    </main>
  );
}
