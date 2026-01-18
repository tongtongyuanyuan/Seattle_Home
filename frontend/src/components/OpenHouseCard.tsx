'use client';

import { useState } from 'react';
import { OpenHouse } from '@/lib/api';

interface OpenHouseCardProps {
  openHouse: OpenHouse;
  onScheduleTour: (openHouse: OpenHouse) => void;
}

export default function OpenHouseCard({ openHouse, onScheduleTour }: OpenHouseCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price?: number) => {
    if (!price) return 'Price available upon request';
    return `$${price.toLocaleString()}`;
  };

  // Street View Static API image URL
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${encodeURIComponent(openHouse.address)}&key=${apiKey}`;

  // Google Maps link for when user clicks the image
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(openHouse.address)}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-200">
      {/* Street View Photo - Click to open Google Maps */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative h-48 bg-gray-200 group cursor-pointer"
      >
        {!imageError ? (
          <>
            <img
              src={streetViewUrl}
              alt={`Street view of ${openHouse.address}`}
              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              onError={() => setImageError(true)}
            />
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              View on Google Maps
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm">Click to view on Maps</span>
            </div>
          </div>
        )}
      </a>

      <div className="p-6">
        {/* Address */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {openHouse.address}
        </h3>

        {/* Area and Time */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            {openHouse.area}
          </span>
          <span className="text-gray-600">
            <span className="font-semibold">🕐</span> {openHouse.open_house_time}
          </span>
        </div>

        {/* Price */}
        <p className="text-2xl font-bold text-green-600 mb-3">
          {formatPrice(openHouse.price)}
        </p>

        {/* Notes */}
        <p className="text-gray-700 mb-4 italic line-clamp-2">
          {openHouse.notes}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <a
            href={openHouse.redfin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-600 text-white text-center py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View on Redfin
          </a>
          <button
            onClick={() => onScheduleTour(openHouse)}
            className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Schedule a Tour
          </button>
        </div>
      </div>
    </div>
  );
}
