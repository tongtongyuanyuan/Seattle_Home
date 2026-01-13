export default function OpenHouses() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          This Weekend Open House Picks
        </h1>
        <p className="text-gray-600 mb-8">
          Explore our curated selection of open houses this weekend.
        </p>

        {/* Filters Section - Will be implemented in Step 2 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All</option>
                <option>Eastside</option>
                <option>North Seattle</option>
                <option>South Seattle</option>
                <option>Downtown</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
            </div>
          </div>
        </div>

        {/* Open House Cards - Will be populated in Step 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample card showing the structure */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sample Address
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Open House:</span> Sat 1-4 PM
              </p>
              <p className="text-sm text-gray-700 mb-4 italic">
                Sample notes: Great schools, convenient location
              </p>
              <div className="flex flex-col gap-2">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  View on Redfin
                </button>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Schedule a Tour
                </button>
              </div>
            </div>
          </div>

          {/* Placeholder message */}
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              Open house listings will be loaded from the backend in Step 2
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
