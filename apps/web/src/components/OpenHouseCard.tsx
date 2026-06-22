'use client';

import { OpenHouse } from '@/lib/api';

interface OpenHouseCardProps {
  openHouse: OpenHouse;
  onScheduleTour: (openHouse: OpenHouse) => void;
}

export default function OpenHouseCard({ openHouse, onScheduleTour }: OpenHouseCardProps) {
  const formatPrice = (price?: number) => {
    if (!price) return 'Price available upon request';
    return `$${price.toLocaleString()}`;
  };

  const encodedAddress = encodeURIComponent(openHouse.address);
  // Keyless Google Maps — no paid API key required.
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodedAddress}&z=15&output=embed`;

  // Get "Why we picked this" bullets
  const getWhyPicks = (): string[] => {
    const picks: string[] = [];
    if (openHouse.why_pick_1) picks.push(openHouse.why_pick_1);
    if (openHouse.why_pick_2) picks.push(openHouse.why_pick_2);
    if (openHouse.why_pick_3) picks.push(openHouse.why_pick_3);
    if (picks.length === 0 && openHouse.notes) {
      const sentences = openHouse.notes.split(/[.,;]/).filter(s => s.trim().length > 5);
      picks.push(...sentences.slice(0, 3).map(s => s.trim()));
    }
    return picks;
  };

  const whyPicks = getWhyPicks();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-200">
      {/* Map preview — keyless Google Maps embed. Click opens the full map. */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative h-48 bg-gray-100 group"
        aria-label={`View ${openHouse.address} on Google Maps`}
      >
        <iframe
          src={mapEmbedUrl}
          className="w-full h-full border-0 pointer-events-none"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${openHouse.address}`}
        />
        {/* Transparent overlay so the whole map is a single click target */}
        <div className="absolute inset-0 group-hover:bg-black/5 transition-colors" />
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1 pointer-events-none">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          View on Google Maps
        </div>
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

        {/* Why We Picked This */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-800 mb-2">Why we picked this</p>
          {whyPicks.length > 0 ? (
            <ul className="text-sm text-gray-600 space-y-1">
              {whyPicks.map((pick, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{pick}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Curated by our team based on value, location, and timing.
            </p>
          )}
        </div>

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
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gray-100 text-gray-700 text-center py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-200"
          >
            View on Google Maps
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
