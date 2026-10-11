export type Airport = { city: string; name: string; country: string; code: string };

export const airports: Airport[] = [
  { city: "Karachi", name: "Jinnah International Airport", country: "Pakistan", code: "KHI" },
  { city: "Lahore", name: "Allama Iqbal International Airport", country: "Pakistan", code: "LHE" },
  { city: "Islamabad", name: "Islamabad International Airport", country: "Pakistan", code: "ISB" },
  { city: "Peshawar", name: "Bacha Khan International Airport", country: "Pakistan", code: "PEW" },
  { city: "Multan", name: "Multan International Airport", country: "Pakistan", code: "MUX" },
  { city: "Sialkot", name: "Sialkot International Airport", country: "Pakistan", code: "SKT" },
  { city: "Quetta", name: "Quetta International Airport", country: "Pakistan", code: "UET" },
  { city: "Jeddah", name: "King Abdulaziz International Airport", country: "Saudi Arabia", code: "JED" },
  { city: "Madinah", name: "Prince Mohammad bin Abdulaziz Airport", country: "Saudi Arabia", code: "MED" },
  { city: "Riyadh", name: "King Khalid International Airport", country: "Saudi Arabia", code: "RUH" },
  { city: "Dammam", name: "King Fahd International Airport", country: "Saudi Arabia", code: "DMM" },
  { city: "Dubai", name: "Dubai International Airport", country: "United Arab Emirates", code: "DXB" },
  { city: "Abu Dhabi", name: "Zayed International Airport", country: "United Arab Emirates", code: "AUH" },
  { city: "Doha", name: "Hamad International Airport", country: "Qatar", code: "DOH" },
  { city: "Istanbul", name: "Istanbul Airport", country: "Türkiye", code: "IST" },
  { city: "London", name: "Heathrow Airport", country: "United Kingdom", code: "LHR" },
  { city: "Manchester", name: "Manchester Airport", country: "United Kingdom", code: "MAN" },
  { city: "Kuala Lumpur", name: "Kuala Lumpur International Airport", country: "Malaysia", code: "KUL" },
  { city: "Bangkok", name: "Suvarnabhumi Airport", country: "Thailand", code: "BKK" },
  { city: "Toronto", name: "Toronto Pearson International Airport", country: "Canada", code: "YYZ" },
  { city: "New York", name: "John F. Kennedy International Airport", country: "United States", code: "JFK" },
  { city: "Paris", name: "Charles de Gaulle Airport", country: "France", code: "CDG" },
  { city: "Singapore", name: "Changi Airport", country: "Singapore", code: "SIN" },
  { city: "Muscat", name: "Muscat International Airport", country: "Oman", code: "MCT" },
  { city: "Kuwait City", name: "Kuwait International Airport", country: "Kuwait", code: "KWI" }
];

export function airportLabel(airport: Airport) {
  return airport.city + " (" + airport.code + ")";
}
