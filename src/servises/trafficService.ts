const API_URL = "https://margdarshak-4.onrender.com/api/traffic";

export async function getTrafficData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching traffic data:", error);
    return [];
  }
}