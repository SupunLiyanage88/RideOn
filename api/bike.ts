import axios from "axios";
import { z } from "zod";

export const bikeSchema = z.object({
  _id: z.string(),
  bikeModel: z.string(),
  bikeId: z.string(),
  fuelType: z.string(),
  distance: z.string(),
  condition: z.string(),
  availability: z.boolean(),
  assigned: z.boolean(),
});

export type Bike = z.infer<typeof bikeSchema>;

// Create
export async function saveBike(data: Bike) {
  const res = await axios.post("/api/bike", data);
  return res.data;
}

// Get all
export async function getAllBikes() {
  const res = await axios.get("/api/bike");
  return res.data;
}

// Get by ID
export async function getBikeById(id: string) {
  const res = await axios.get(`/api/bike/${id}`);
  return res.data;
}

//Get Condition Stats
export async function getBikeConditionStats() {
  const res = await axios.get("/api/bike/stats");
  return res.data;
}

// Update
export async function updateBike(id: string, data: Partial<Bike>) {
  const res = await axios.put(`/api/bike/${id}`, data);
  return res.data;
}

// Delete
export async function deleteBike(id: string) {
  const res = await axios.delete(`/api/bike/${id}`);
  return res.data;
}
