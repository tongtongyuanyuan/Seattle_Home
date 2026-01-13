import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Seattle Home Picks
            </Link>
          </div>
          <div className="flex space-x-1">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/open-houses"
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Open Houses
            </Link>
            <Link
              href="/contact"
              className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
