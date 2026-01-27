// UNMA Volunteer Locations Data
// Countries where Navodayan alumni/volunteers are present

export const VOLUNTEER_LOCATIONS = [
  // India - Headquarters (Kerala region focus)
  { id: 1, country: "India", city: "Kerala", lat: 10.8505, lng: 76.2711, volunteers: 5000, isHQ: true },
  
  // Middle East - Major Gulf Countries
  { id: 2, country: "UAE", city: "Dubai", lat: 25.2048, lng: 55.2708, volunteers: 1200 },
  { id: 3, country: "Saudi Arabia", city: "Riyadh", lat: 24.7136, lng: 46.6753, volunteers: 800 },
  { id: 4, country: "Qatar", city: "Doha", lat: 25.2854, lng: 51.5310, volunteers: 450 },
  { id: 5, country: "Kuwait", city: "Kuwait City", lat: 29.3759, lng: 47.9774, volunteers: 350 },
  { id: 6, country: "Oman", city: "Muscat", lat: 23.5880, lng: 58.3829, volunteers: 280 },
  { id: 7, country: "Bahrain", city: "Manama", lat: 26.2285, lng: 50.5860, volunteers: 150 },
  
  // North America
  { id: 8, country: "USA", city: "New York", lat: 40.7128, lng: -74.0060, volunteers: 600 },
  { id: 9, country: "USA", city: "San Francisco", lat: 37.7749, lng: -122.4194, volunteers: 450 },
  { id: 10, country: "USA", city: "Houston", lat: 29.7604, lng: -95.3698, volunteers: 200 },
  { id: 11, country: "Canada", city: "Toronto", lat: 43.6532, lng: -79.3832, volunteers: 300 },
  { id: 12, country: "Canada", city: "Vancouver", lat: 49.2827, lng: -123.1207, volunteers: 150 },
  
  // Europe
  { id: 13, country: "United Kingdom", city: "London", lat: 51.5074, lng: -0.1278, volunteers: 500 },
  { id: 14, country: "Germany", city: "Berlin", lat: 52.5200, lng: 13.4050, volunteers: 180 },
  { id: 15, country: "Germany", city: "Munich", lat: 48.1351, lng: 11.5820, volunteers: 120 },
  { id: 16, country: "France", city: "Paris", lat: 48.8566, lng: 2.3522, volunteers: 100 },
  { id: 17, country: "Netherlands", city: "Amsterdam", lat: 52.3676, lng: 4.9041, volunteers: 80 },
  { id: 18, country: "Ireland", city: "Dublin", lat: 53.3498, lng: -6.2603, volunteers: 90 },
  { id: 19, country: "Switzerland", city: "Zurich", lat: 47.3769, lng: 8.5417, volunteers: 60 },
  { id: 20, country: "Sweden", city: "Stockholm", lat: 59.3293, lng: 18.0686, volunteers: 40 },
  { id: 21, country: "Norway", city: "Oslo", lat: 59.9139, lng: 10.7522, volunteers: 35 },
  { id: 22, country: "Finland", city: "Helsinki", lat: 60.1699, lng: 24.9384, volunteers: 25 },
  { id: 23, country: "Denmark", city: "Copenhagen", lat: 55.6761, lng: 12.5683, volunteers: 30 },
  { id: 24, country: "Belgium", city: "Brussels", lat: 50.8503, lng: 4.3517, volunteers: 45 },
  { id: 25, country: "Italy", city: "Milan", lat: 45.4642, lng: 9.1900, volunteers: 55 },
  { id: 26, country: "Spain", city: "Madrid", lat: 40.4168, lng: -3.7038, volunteers: 40 },
  { id: 27, country: "Poland", city: "Warsaw", lat: 52.2297, lng: 21.0122, volunteers: 35 },
  { id: 28, country: "Czech Republic", city: "Prague", lat: 50.0755, lng: 14.4378, volunteers: 25 },
  
  // Asia Pacific
  { id: 29, country: "Singapore", city: "Singapore", lat: 1.3521, lng: 103.8198, volunteers: 400 },
  { id: 30, country: "Australia", city: "Sydney", lat: -33.8688, lng: 151.2093, volunteers: 350 },
  { id: 31, country: "Australia", city: "Melbourne", lat: -37.8136, lng: 144.9631, volunteers: 250 },
  { id: 32, country: "Australia", city: "Perth", lat: -31.9505, lng: 115.8605, volunteers: 100 },
  { id: 33, country: "New Zealand", city: "Auckland", lat: -36.8485, lng: 174.7633, volunteers: 80 },
  { id: 34, country: "Japan", city: "Tokyo", lat: 35.6762, lng: 139.6503, volunteers: 70 },
  { id: 35, country: "South Korea", city: "Seoul", lat: 37.5665, lng: 126.9780, volunteers: 50 },
  { id: 36, country: "Malaysia", city: "Kuala Lumpur", lat: 3.1390, lng: 101.6869, volunteers: 200 },
  { id: 37, country: "Thailand", city: "Bangkok", lat: 13.7563, lng: 100.5018, volunteers: 60 },
  { id: 38, country: "Philippines", city: "Manila", lat: 14.5995, lng: 120.9842, volunteers: 45 },
  { id: 39, country: "Indonesia", city: "Jakarta", lat: -6.2088, lng: 106.8456, volunteers: 40 },
  { id: 40, country: "Vietnam", city: "Ho Chi Minh City", lat: 10.8231, lng: 106.6297, volunteers: 30 },
  { id: 41, country: "Hong Kong", city: "Hong Kong", lat: 22.3193, lng: 114.1694, volunteers: 120 },
  { id: 42, country: "China", city: "Shanghai", lat: 31.2304, lng: 121.4737, volunteers: 50 },
  
  // Africa
  { id: 43, country: "South Africa", city: "Johannesburg", lat: -26.2041, lng: 28.0473, volunteers: 80 },
  { id: 44, country: "South Africa", city: "Cape Town", lat: -33.9249, lng: 18.4241, volunteers: 50 },
  { id: 45, country: "Kenya", city: "Nairobi", lat: -1.2921, lng: 36.8219, volunteers: 40 },
  { id: 46, country: "Nigeria", city: "Lagos", lat: 6.5244, lng: 3.3792, volunteers: 35 },
  { id: 47, country: "Nigeria", city: "Abuja", lat: 9.0765, lng: 7.3986, volunteers: 25 },
  { id: 48, country: "Egypt", city: "Cairo", lat: 30.0444, lng: 31.2357, volunteers: 30 },
  { id: 49, country: "Ghana", city: "Accra", lat: 5.6037, lng: -0.1870, volunteers: 35 },
  { id: 50, country: "Tanzania", city: "Dar es Salaam", lat: -6.7924, lng: 39.2083, volunteers: 30 },
  { id: 51, country: "Uganda", city: "Kampala", lat: 0.3476, lng: 32.5825, volunteers: 25 },
  { id: 52, country: "Ethiopia", city: "Addis Ababa", lat: 9.1450, lng: 38.7667, volunteers: 30 },
  { id: 53, country: "Morocco", city: "Casablanca", lat: 33.5731, lng: -7.5898, volunteers: 40 },
  { id: 54, country: "Tunisia", city: "Tunis", lat: 36.8065, lng: 10.1815, volunteers: 25 },
  { id: 55, country: "Mauritius", city: "Port Louis", lat: -20.1619, lng: 57.5012, volunteers: 20 },
  { id: 56, country: "Botswana", city: "Gaborone", lat: -24.6282, lng: 25.9231, volunteers: 15 },
  { id: 57, country: "Zimbabwe", city: "Harare", lat: -17.8292, lng: 31.0522, volunteers: 20 },
  
  // South America
  { id: 58, country: "Brazil", city: "São Paulo", lat: -23.5505, lng: -46.6333, volunteers: 40 },
  { id: 59, country: "Brazil", city: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, volunteers: 35 },
  { id: 60, country: "Brazil", city: "Brasília", lat: -15.7942, lng: -47.8822, volunteers: 20 },
  { id: 61, country: "Argentina", city: "Buenos Aires", lat: -34.6037, lng: -58.3816, volunteers: 25 },
  { id: 62, country: "Chile", city: "Santiago", lat: -33.4489, lng: -70.6693, volunteers: 20 },
  { id: 63, country: "Colombia", city: "Bogotá", lat: 4.7110, lng: -74.0721, volunteers: 30 },
  { id: 64, country: "Peru", city: "Lima", lat: -12.0464, lng: -77.0428, volunteers: 25 },
  { id: 65, country: "Ecuador", city: "Quito", lat: -0.1807, lng: -78.4678, volunteers: 20 },
  { id: 66, country: "Venezuela", city: "Caracas", lat: 10.4806, lng: -66.9036, volunteers: 15 },
  { id: 67, country: "Uruguay", city: "Montevideo", lat: -34.9011, lng: -56.1645, volunteers: 18 },
  { id: 68, country: "Paraguay", city: "Asunción", lat: -25.2637, lng: -57.5759, volunteers: 15 },
  { id: 69, country: "Bolivia", city: "La Paz", lat: -16.5000, lng: -68.1500, volunteers: 12 },
  
  // Other Asian regions
  { id: 70, country: "Bangladesh", city: "Dhaka", lat: 23.8103, lng: 90.4125, volunteers: 30 },
  { id: 71, country: "Sri Lanka", city: "Colombo", lat: 6.9271, lng: 79.8612, volunteers: 50 },
  { id: 72, country: "Nepal", city: "Kathmandu", lat: 27.7172, lng: 85.3240, volunteers: 25 },
];

// Get total volunteer count
export const getTotalVolunteers = () => {
  return VOLUNTEER_LOCATIONS.reduce((sum, loc) => sum + loc.volunteers, 0);
};

// Get unique countries count
export const getCountriesCount = () => {
  return new Set(VOLUNTEER_LOCATIONS.map(loc => loc.country)).size;
};

// Get headquarters location
export const getHQLocation = () => {
  return VOLUNTEER_LOCATIONS.find(loc => loc.isHQ);
};

// Generate arcs from HQ to ALL locations (airline routes style)
export const getConnectionArcs = () => {
  const hq = getHQLocation();
  if (!hq) return [];
  
  // Connect to ALL destinations from Kerala hub
  return VOLUNTEER_LOCATIONS
    .filter(loc => !loc.isHQ)
    .map(loc => {
      // Arc stroke width based on volunteer count
      const strokeWidth = Math.max(0.3, Math.min(2.0, loc.volunteers / 500));
      
      // Color gradient based on traffic volume
      let colorStart, colorEnd;
      if (loc.volunteers >= 500) {
        // High traffic - golden to pink
        colorStart = 'rgba(255, 200, 50, 0.9)';
        colorEnd = 'rgba(255, 100, 180, 0.9)';
      } else if (loc.volunteers >= 100) {
        // Medium traffic - yellow to pink
        colorStart = 'rgba(255, 180, 60, 0.7)';
        colorEnd = 'rgba(255, 120, 160, 0.7)';
      } else {
        // Low traffic - subtle yellow to orange
        colorStart = 'rgba(255, 200, 100, 0.4)';
        colorEnd = 'rgba(255, 150, 100, 0.4)';
      }
      
      return {
        startLat: hq.lat,
        startLng: hq.lng,
        endLat: loc.lat,
        endLng: loc.lng,
        color: [colorStart, colorEnd],
        strokeWidth,
        volunteers: loc.volunteers,
      };
    });
};
