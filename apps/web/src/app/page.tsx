import Link from 'next/link';
import ProfileCards from '@/components/ProfileCards';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Find Your Seattle Home
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Expert guidance for your home buying journey in the Greater Seattle area
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/open-houses"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              View This Weekend's Picks
            </Link>
            <Link
              href="/contact"
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Schedule a Tour
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Services — clickable entry points */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                href: '/open-houses',
                icon: '🏡',
                title: 'Curated Picks',
                desc: 'Hand-selected open houses every weekend based on value, location, and potential.',
                cta: 'Browse this weekend',
              },
              {
                href: '/ask',
                icon: '📍',
                title: 'Local Expertise',
                desc: 'Ask about neighborhoods, schools, budget, and commute — answered from our curated picks.',
                cta: 'Ask a question',
              },
              {
                href: '/contact',
                icon: '💼',
                title: 'Professional Service',
                desc: 'Experienced agents ready to guide you through every step of your home purchase.',
                cta: 'Schedule a tour',
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col bg-white p-8 rounded-xl shadow-md border border-transparent hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="text-blue-600 text-4xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-600 flex-1">{card.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-blue-600 font-semibold">
                  {card.cta}
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Team Profile Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Your Real Estate Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trusted professionals committed to helping you find your perfect home in Seattle
            </p>
          </div>
          <ProfileCards />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Home Search?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Check out our curated open house picks for this weekend or schedule a personalized tour
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/open-houses"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Browse Open Houses
            </Link>
            <Link
              href="/contact"
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg border-2 border-white"
            >
              Contact Us Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-8 px-4 bg-gray-900 text-gray-400 text-center">
        <p className="text-sm">
          © 2026 Seattle Home Picks. Your trusted partner in finding the perfect home.
        </p>
      </section>
    </main>
  );
}
