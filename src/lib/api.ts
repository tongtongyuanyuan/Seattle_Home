// Placeholder for open house data
export interface OpenHouse {
  id: string;
  address: string;
  area: string;
  date: string;
  time: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  redfinUrl: string;
}

// Placeholder for lead data
export interface Lead {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
}

// Placeholder function to fetch open houses from backend
export async function fetchOpenHouses(): Promise<OpenHouse[]> {
  // TODO: Connect to backend API in Step 2
  // For now, return empty array
  return [];
}

// Placeholder function to submit lead to backend
export async function submitLead(lead: Lead): Promise<{ success: boolean; message?: string }> {
  // TODO: Connect to backend API in Step 3
  // For now, return mock success
  console.log('Lead submitted:', lead);
  return { success: true };
}
