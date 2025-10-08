export const getRouteDistance = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<number | null> => {
  const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!API_KEY) {
    console.error("[RoutesAPI] ❌ Missing Google Maps API key.");
    return null;
  }

  try {
    const url = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix";

    const body = {
      origins: [{ waypoint: { location: { latLng: origin } } }],
      destinations: [{ waypoint: { location: { latLng: destination } } }],
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      units: "METRIC",
    };

    console.log("[RoutesAPI] 🌍 Fetching route data...");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "originIndex,destinationIndex,distanceMeters,duration,status",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("[RoutesAPI] 📦 Full Response:", JSON.stringify(data, null, 2));

    if (Array.isArray(data) && data[0]?.status === "OK") {
      const distanceKm = data[0].distanceMeters / 1000;
      console.log(`[RoutesAPI] ✅ Distance: ${distanceKm.toFixed(2)} km`);
      return distanceKm;
    } else {
      console.warn("[RoutesAPI] ⚠️ Invalid response or route unavailable.");
      return null;
    }
  } catch (error: any) {
    console.error("[RoutesAPI] 🚨 Network or parsing error:", error.message);
    return null;
  }
};
