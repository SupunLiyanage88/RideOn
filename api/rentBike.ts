import axios from "axios";
import { z } from "zod";

export const rentBikeSchema = z.object({
  _id: z.string(),
  bikeId: z.string(),
  selectedStationId: z.string(),
  expiresAt: z.string(),
  distance: z.number(),
  duration: z.number(),
  rcPrice: z.number(),
});

export type RentBike = z.infer<typeof rentBikeSchema>;

export async function saveRentBike(data: RentBike) {
  const res = await axios.post("/api/rent-bike", data);
  return res.data;
}