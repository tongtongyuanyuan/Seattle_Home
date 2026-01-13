import Link from 'next/link';
import ProfileCards from '@/components/ProfileCards';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Seattle Home Picks
          </h1>
          <p className="text-xl text-gray-600">
            Your trusted real estate team in Seattle
          </p>
        </div>

        {/* Profile Cards Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
            Meet Our Team
          </h2>
          <ProfileCards />
        </section>

        {/* Action Buttons Section */}
        <section className="max-w-2xl mx-auto">
          <div className="flex flex-col gap-4">
            <Link
              href="/open-houses"
              className="w-full bg-blue-600 text-white text-center py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              This Weekend Open Houses
            </Link>
            <Link
              href="/contact"
              className="w-full bg-green-600 text-white text-center py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-md"
            >
              Schedule a Tour
            </Link>
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 text-center py-4 px-6 rounded-lg font-semibold text-lg cursor-not-allowed shadow-md"
            >
              Team Listings / Sold (Coming Soon)
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
