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
  const res = await axios.post("/api/bike-station", data);
  return res.data;
}

export async function updateBikeStation(data: BikeStation) {
  console.log("Id", data._id);
  const res = await axios.put(`/api/bike-station/${data._id}`, data);
  return res.data;
}

export async function deleteBikeStation(id?: string) {
  const res = await axios.delete(`/api/bike-station/${id}`);
  return res.data;
}

export async function fetchBikeStation() {
  const res = await axios.get("/api/bike-station");
  return res.data;
}
