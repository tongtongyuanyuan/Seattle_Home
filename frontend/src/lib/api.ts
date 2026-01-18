// Backend API base URL (set in .env.local)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Open house data interface matching Google Sheets schema
export interface OpenHouse {
  id: number;
  address: string;
  area: string;
  open_house_time: string;
  redfin_url: string;
  notes: string;
  price?: number;
}

// Lead data interface
export interface Lead {
  name: string;
  email: string;
  phone: string;
  message: string;
  source?: string;
  listing_id?: number;
  listing_address?: string;
}

// Mock data for open houses (will be replaced with backend API in Step 4)
const mockOpenHouses: OpenHouse[] = [
  {
    id: 1,
    address: '123 Main St, Bellevue, WA 98004',
    area: 'Eastside',
    open_house_time: 'Sat 1-4 PM',
    redfin_url: 'https://www.redfin.com',
    notes: 'Great schools, close to tech companies, updated kitchen',
    price: 950000,
  },
  {
    id: 2,
    address: '456 Lake View Dr, Seattle, WA 98102',
    area: 'North Seattle',
    open_house_time: 'Sun 12-3 PM',
    redfin_url: 'https://www.redfin.com',
    notes: 'Lake views, walkable neighborhood, excellent value',
    price: 725000,
  },
  {
    id: 3,
    address: '789 Pine St, Kirkland, WA 98033',
    area: 'Eastside',
    open_house_time: 'Sat 2-5 PM',
    redfin_url: 'https://www.redfin.com',
    notes: 'Waterfront access, top-rated schools, newly renovated',
    price: 1200000,
  },
  {
    id: 4,
    address: '321 Cedar Ave, Redmond, WA 98052',
    area: 'Eastside',
    open_house_time: 'Sun 1-4 PM',
    redfin_url: 'https://www.redfin.com',
    notes: 'Near Microsoft campus, spacious lot, modern design',
    price: 875000,
  },
  {
    id: 5,
    address: '654 Green Lake Way, Seattle, WA 98103',
    area: 'North Seattle',
    open_house_time: 'Sat 11-2 PM',
    redfin_url: 'https://www.redfin.com',
    notes: 'Green Lake adjacent, charming craftsman, great community',
    price: 825000,
  },
  {
    id: 6,
    address: '987 Maple Dr, Mercer Island, WA 98040',
    area: 'Eastside',
    open_house_time: 'Sun 2-5 PM',
    redfin_url: 'https://www.redfin.com',
    notes: 'Mercer Island schools, quiet street, lake access',
    price: 1450000,
  },
  {
    id: 7,
    address: '147 Queen Anne Ave, Seattle, WA 98109',
    area: 'Downtown',
    open_house_time: 'Sat 10-1 PM',
    redfin_url: 'https://www.redfin.com',
    notes: 'City views, walkable to downtown, modern condo',
    price: 650000,
  },
  {
    id: 8,
    address: '258 Columbia St, Seattle, WA 98104',
    area: 'Downtown',
    open_house_time: 'Sun 11-2 PM',
    redfin_url: 'https://www.redfin.com',
    notes: 'Pioneer Square loft, exposed brick, urban lifestyle',
    price: 575000,
  },
];

// Fetch open houses with optional filters
export async function fetchOpenHouses(params?: {
  area?: string;
  day?: string;
}): Promise<OpenHouse[]> {
  // Use backend API if configured
  if (API_BASE_URL) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.area) queryParams.append('area', params.area);
      if (params?.day) queryParams.append('day', params.day);

      const url = `${API_BASE_URL}/open-houses${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch open houses');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching from backend, falling back to mock data:', error);
      // Fall back to mock data
    }
  }

  // Use mock data (for development without backend)
  await new Promise((resolve) => setTimeout(resolve, 300));

  let results = [...mockOpenHouses];

  // Filter by area if specified
  if (params?.area && params.area !== 'All') {
    results = results.filter((house) => house.area === params.area);
  }

  // Filter by day if specified
  if (params?.day && params.day !== 'All') {
    const day = params.day;
    results = results.filter((house) =>
      house.open_house_time.toLowerCase().includes(day.toLowerCase())
    );
  }

  return results;
}

// Submit lead to backend
export async function submitLead(lead: Lead): Promise<{ success: boolean; message?: string }> {
  // Use backend API if configured
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lead),
      });

      if (!response.ok) {
        throw new Error('Failed to submit lead');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting to backend:', error);
      return {
        success: false,
        message: 'Failed to submit. Please try again or contact us directly.',
      };
    }
  }

  // Mock submission (for development without backend)
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log('Lead submitted (mock):', lead);
  return { success: true, message: 'Thank you! We will contact you soon.' };
}
