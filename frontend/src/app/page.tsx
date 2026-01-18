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

      {/* Featured Services */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="text-blue-600 text-4xl mb-4">🏡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Curated Picks</h3>
              <p className="text-gray-600">
                Hand-selected open houses every weekend based on value, location, and potential
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="text-blue-600 text-4xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Local Expertise</h3>
              <p className="text-gray-600">
                Deep knowledge of Seattle neighborhoods, schools, and commute patterns
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="text-blue-600 text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Service</h3>
              <p className="text-gray-600">
                Experienced agents ready to guide you through every step of your home purchase
              </p>
            </div>
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
