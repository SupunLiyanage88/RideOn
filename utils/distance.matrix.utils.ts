export const getRouteDistance = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<any | null> => {
  const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!API_KEY) {
    console.error("[RoutesAPI] ❌ Missing Google Maps API key.");
    return null;
  }
  try {
    const url =
      "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix";

    const body = {
      origins: [{ waypoint: { location: { latLng: origin } } }],
      destinations: [{ waypoint: { location: { latLng: destination } } }],
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      units: "METRIC",
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "originIndex,destinationIndex,distanceMeters,duration,status",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (data[0]?.distanceMeters != null && data[0]?.duration != null) {
      const distanceKm = data[0].distanceMeters / 1000;
      const durationSeconds = Number(data[0].duration.replace("s", ""));
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const returnData = {
        distanceKm,
        ConvertedHours: hours,
        ConvertedMinutes: minutes,
      };
      return returnData;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("[RoutesAPI] 🚨 Network or parsing error:", error.message);
    return null;
  }
};
