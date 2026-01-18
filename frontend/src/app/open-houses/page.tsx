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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                Found <span className="font-semibold">{openHouses.length}</span> open house
                {openHouses.length !== 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>

        {/* Open House Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : openHouses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openHouses.map((openHouse) => (
              <OpenHouseCard
                key={openHouse.id}
                openHouse={openHouse}
                onScheduleTour={handleScheduleTour}
              />
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
