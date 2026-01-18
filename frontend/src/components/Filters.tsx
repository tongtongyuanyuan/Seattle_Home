'use client';

interface FiltersProps {
  selectedArea: string;
  selectedDay: string;
  onAreaChange: (area: string) => void;
  onDayChange: (day: string) => void;
}

export default function Filters({
  selectedArea,
  selectedDay,
  onAreaChange,
  onDayChange,
}: FiltersProps) {
  // Cities within 1-1.5h of Seattle Downtown & Bellevue
  const areas = [
    'All',
    // Eastside
    'Bellevue',
    'Kirkland',
    'Redmond',
    'Bothell',
    'Woodinville',
    'Issaquah',
    'Sammamish',
    'Newcastle',
    'Mercer Island',
    'Factoria',
    // South
    'Renton',
    'Kent',
    'Auburn',
    'Federal Way',
    'Tukwila',
    'SeaTac',
    // North
    'Shoreline',
    'Lynnwood',
    'Edmonds',
    'Mountlake Terrace',
    'Everett',
    'Kenmore',
    // Seattle
    'Seattle Downtown',
    'Queen Anne',
    'Capitol Hill',
    'Ballard',
    'Fremont',
    'University District',
    'West Seattle',
    'South Seattle',
    'North Seattle',
  ];
  const days = ['All', 'Saturday', 'Sunday'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Area Filter */}
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
            Area
          </label>
          <select
            id="area"
            value={selectedArea}
            onChange={(e) => onAreaChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Day Filter */}
        <div>
          <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-2">
            Day
          </label>
          <select
            id="day"
            value={selectedDay}
            onChange={(e) => onDayChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
