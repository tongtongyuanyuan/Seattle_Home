'use client';

import { useState, useEffect } from 'react';
import { fetchOpenHouses, OpenHouse } from '@/lib/api';
import Filters from '@/components/Filters';
import OpenHouseCard from '@/components/OpenHouseCard';
import TourModal from '@/components/TourModal';

export default function OpenHouses() {
  const [openHouses, setOpenHouses] = useState<OpenHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedHouse, setSelectedHouse] = useState<OpenHouse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch open houses whenever filters change
  useEffect(() => {
    async function loadOpenHouses() {
      setLoading(true);
      const data = await fetchOpenHouses({
        area: selectedArea,
        day: selectedDay,
      });
      setOpenHouses(data);
      setLoading(false);
    }
    loadOpenHouses();
  }, [selectedArea, selectedDay]);

  const handleScheduleTour = (openHouse: OpenHouse) => {
    setSelectedHouse(openHouse);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHouse(null);
  };

  // Filter out inactive listings (client-side)
  const activeHouses = openHouses.filter(h => !h.status || h.status.toLowerCase() === 'active');

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Team Curated Picks — Updated Weekly
          </span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          This Weekend Open House Picks
        </h1>
        <p className="text-gray-600 mb-8">
          Explore our curated selection of open houses this weekend.
        </p>

        {/* Filters */}
        <Filters
          selectedArea={selectedArea}
          selectedDay={selectedDay}
          onAreaChange={setSelectedArea}
          onDayChange={setSelectedDay}
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-700">
            {loading ? (
              'Loading...'
            ) : (
              <>
                Found <span className="font-semibold">{activeHouses.length}</span> open house
                {activeHouses.length !== 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>

        {/* Open House Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : activeHouses.length > 0 ? (
          <div id="picks" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeHouses.map((openHouse) => (
              <div key={openHouse.id} id={`home-${openHouse.id}`}>
                <OpenHouseCard
                  openHouse={openHouse}
                  onScheduleTour={handleScheduleTour}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">
              No open houses found matching your filters.
            </p>
            <p className="text-gray-400 mt-2">
              Try adjusting your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Tour Modal */}
      <TourModal
        openHouse={selectedHouse}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </main>
  );
}
