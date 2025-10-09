import axios from "axios";
import { z } from "zod";
import { bikeSchema } from "./bike";
export const bikeStationSchema = z.object({
  _id: z.string(),
  stationName: z.string(),
  stationId: z.string(),
  stationLocation: z.string(),
  bikeCount: z.string(),
  bikes: bikeSchema,
  addedBikes: z.array(bikeSchema),
  latitude: z.number(),
  longitude: z.number(),
});

export type BikeStation = z.infer<typeof bikeStationSchema>;

export async function saveBikeStation(data: BikeStation) {
  console.log("Raw Data", data);

  const payload = {
    stationName: data.stationName,
    stationLocation: data.stationLocation,
    bikeCount: data.bikeCount,
    latitude: data.latitude,
    longitude: data.longitude,
    addedBikesArray: data.addedBikes?.map((bike: any) => bike._id) || [],
  };

  console.log("Payload Sent:", payload);

  const res = await axios.post("/api/bike-station", payload);
  return res.data;
}

export async function updateBikeStation(data: BikeStation) {
  console.log("Id", data._id);
  const payload = {
    stationName: data.stationName,
    stationLocation: data.stationLocation,
    bikeCount: data.bikeCount,
    latitude: data.latitude,
    longitude: data.longitude,
    addedBikesArray: data.addedBikes?.map((bike: any) => bike._id) || [],
  };
  const res = await axios.put(`/api/bike-station/${data._id}`, payload);
  return res.data;
}

export async function deleteBikeStation(id?: string) {
  const res = await axios.delete(`/api/bike-station/${id}`);
  return res.data;
}

export async function fetchBikeStation({ query }: { query: string }) {
  const res = await axios.get(`/api/bike-station/search?keyword=${query}`);
  return res.data;
}

export async function fetchBikeStationById(id: String) {
  const res = await axios.get(`/api/bike-station/bike-id/${id}`);
  return res.data;
}

export async function getAllBikeStations() {
  const res = await axios.get("/api/bike-station");
  return res.data;
}

export async function getAvailableBikes() {
  const res = await axios.get("/api/bike/available-bikes");
  return res.data;
}
