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

export async function validateUser() {
  const res = await axios.get("/api/auth/user");
  return res.data;
}

