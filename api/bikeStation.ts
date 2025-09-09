import axios from "axios";
import { z } from "zod";
export const bikeStationSchema = z.object({
  _id: z.string(),
  stationName: z.string(),
  stationLocation: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export type BikeStation = z.infer<typeof bikeStationSchema>;

export async function saveBikeStation(data: BikeStation) {
  const res = await axios.post("/api/bike",data);
  return res.data;
}
