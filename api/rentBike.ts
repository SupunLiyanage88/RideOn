import axios from "axios";
import { z } from "zod";
import { bikeStationSchema } from "./bikeStation";

export const rentBikeSchema = z.object({
  _id: z.string(),
  bikeId: z.string(),
  selectedStationId: z.string(),
  bikeStation: bikeStationSchema,
  expiresAt: z.string(),
  distance: z.number(),
  duration: z.number(),
  rcPrice: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.string(),
});

export type RentBike = z.infer<typeof rentBikeSchema>;

export async function saveRentBike(data: RentBike) {
  const res = await axios.post("/api/rent-bike", data);
  return res.data;
}
export async function fetchUserRentBike() {
  const res = await axios.get("/api/rent-bike");
  return res.data;
}

export async function fetchAllUsersRentBike() {
  const res = await axios.get("/api/rent-bike/all-rented");
  return res.data;
}