const trafficData = [
  { time: '9:00', congestion: 45 },
  { time: '10:00', congestion: 52 },
  { time: '11:00', congestion: 68 },
  { time: '12:00', congestion: 75 },
  { time: '1:00', congestion: 82 },
  { time: '2:00', congestion: 78 },
  { time: '3:00', congestion: 65 },
];

const vehicles = [
  { id: 1, lat: 19.0760, lng: 72.8777, status: 'active', name: 'V-01', deliveries: 8 },
  { id: 2, lat: 19.1136, lng: 72.8697, status: 'active', name: 'V-02', deliveries: 6 },
  { id: 3, lat: 19.0596, lng: 72.8295, status: 'parking', name: 'V-03', deliveries: 12 },
  { id: 4, lat: 19.0330, lng: 72.8479, status: 'active', name: 'V-04', deliveries: 9 },
  { id: 5, lat: 18.9750, lng: 72.8258, status: 'idle', name: 'V-05', deliveries: 4 },
];

const stats = {
  onTimeDelivery: "94.3%",
  avgParkingSearch: "4.2 min",
  fuelSaved: "127 L",
  co2Reduction: "312 kg",
  activeRoutes: 12,
  deliveriesToday: 87,
  avgDeliveryTime: "18 min"
};

const parkingZones = [
  {
    name: 'Technology Dr Garage',
    distance: '120m',
    arrivalTime: '2:08 PM',
    probability: 85,
    trend: 'up',
    historicalData: [45, 52, 68, 75, 82, 85],
  },
  {
    name: 'Market St Parking',
    distance: '280m',
    arrivalTime: '2:11 PM',
    probability: 62,
    trend: 'stable',
    historicalData: [60, 58, 65, 63, 60, 62],
  },
  {
    name: '3rd Street Lot',
    distance: '450m',
    arrivalTime: '2:15 PM',
    probability: 38,
    trend: 'down',
    historicalData: [75, 68, 55, 48, 42, 38],
  },
];

const deliveries = [
  {
    orderId: 'ORD-7843',
    address: '1247 Technology Dr, San Francisco',
    timeWindow: '2:00 PM - 3:00 PM',
    timeRemaining: '23 min left',
    priorityScore: 92,
    parkingDifficulty: 'high',
    status: 'urgent',
  },
  {
    orderId: 'ORD-7856',
    address: '892 Market Street, San Francisco',
    timeWindow: '2:30 PM - 4:00 PM',
    timeRemaining: '58 min left',
    priorityScore: 78,
    parkingDifficulty: 'medium',
    status: 'medium',
  },
  {
    orderId: 'ORD-7901',
    address: '456 Valencia St, San Francisco',
    timeWindow: '3:00 PM - 5:00 PM',
    timeRemaining: '1h 45m left',
    priorityScore: 65,
    parkingDifficulty: 'low',
    status: 'medium',
  },
  {
    orderId: 'ORD-7923',
    address: '2301 Mission St, San Francisco',
    timeWindow: '4:00 PM - 6:00 PM',
    timeRemaining: '2h 30m left',
    priorityScore: 48,
    parkingDifficulty: 'low',
    status: 'low',
  },
  {
    orderId: 'ORD-7934',
    address: '678 Folsom Street, San Francisco',
    timeWindow: '3:30 PM - 5:30 PM',
    timeRemaining: '1h 12m left',
    priorityScore: 72,
    parkingDifficulty: 'high',
    status: 'medium',
  },
];

const weatherClimate = [
  {
    id: 1,
    location: "Connaught Place",
    address: "Rajiv Chowk, New Delhi",
    lat: 28.6304,
    lng: 77.2177,
    weather: {
      temp: 32,
      condition: "Partly Cloudy",
      humidity: 65,
      windSpeed: 12,
      precipitation: 10,
      uvIndex: 8
    },
    climate: {
      airQuality: 72,
      carbonImpact: "Low",
      ecoScore: 85,
      riskLevel: "low"
    },
    delivery: {
      eta: "12 min",
      distance: "2.4 km"
    }
  },
  {
    id: 2,
    location: "Okhla Industrial Area",
    address: "Phase-III, Okhla",
    lat: 28.5355,
    lng: 77.2897,
    weather: {
      temp: 35,
      condition: "Clear",
      humidity: 48,
      windSpeed: 8,
      precipitation: 0,
      uvIndex: 9
    },
    climate: {
      airQuality: 145,
      carbonImpact: "Medium",
      ecoScore: 58,
      riskLevel: "medium"
    },
    delivery: {
      eta: "18 min",
      distance: "4.1 km"
    }
  },
  {
    id: 3,
    location: "Hauz Khas Village",
    address: "Hauz Khas, South Delhi",
    lat: 28.5494,
    lng: 77.1960,
    weather: {
      temp: 28,
      condition: "Rain Expected",
      humidity: 88,
      windSpeed: 18,
      precipitation: 75,
      uvIndex: 4
    },
    climate: {
      airQuality: 88,
      carbonImpact: "Low",
      ecoScore: 92,
      riskLevel: "high"
    },
    delivery: {
      eta: "25 min",
      distance: "5.8 km"
    }
  },
  {
    id: 4,
    location: "Cyber City, Gurugram",
    address: "DLF Cyber Hub, Gurugram",
    lat: 28.4950,
    lng: 77.0869,
    weather: {
      temp: 33,
      condition: "Sunny",
      humidity: 52,
      windSpeed: 10,
      precipitation: 5,
      uvIndex: 8
    },
    climate: {
      airQuality: 98,
      carbonImpact: "Low",
      ecoScore: 80,
      riskLevel: "low"
    },
    delivery: {
      eta: "15 min",
      distance: "3.2 km"
    }
  }
];

module.exports = {
  trafficData,
  vehicles,
  stats,
  parkingZones,
  deliveries,
  weatherClimate,
  users: []
};
