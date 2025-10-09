import axios from "axios";
import { z } from "zod";
import { userSchema } from "./auth";

export const bikeSchema = z.object({
  _id: z.string(),
  bikeModel: z.string(),
  bikeId: z.string(),
  fuelType: z.string(),
  distance: z.string(),
  condition: z.string(),
  availability: z.boolean(),
  assigned: z.boolean(),
  rentApproved: z.boolean(),
  rentRejected: z.boolean(),
  createdBy: userSchema
});

export type Bike = z.infer<typeof bikeSchema>;

// Create
export async function saveBike(data: Bike) {
  const res = await axios.post("/api/bike", data);
  return res.data;
}

export async function saveBikeByUser(data: Bike) {
  const res = await axios.post("/api/bike/user-bikes", data);
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
export async function updateBike(bike: Bike) {
  const res = await axios.put(`/api/bike/${bike._id}`, bike);
  return res.data;
}

// Delete
export async function deleteBike(id: string) {
  const res = await axios.delete(`/api/bike/${id}`);
  return res.data;
}

// Search Bikes
export async function searchBikes({ query } : {query: String}) {
  const res = await axios.get(`/api/bike/search?query=${query}`);
  return res.data;
}

export async function getBikesByUser() {
  const res = await axios.get(`/api/bike/user-bikes`);
  return res.data;
}

// Get bikes that need rent approval
export async function getBikesAwaitingApproval() {
  const allBikes = await getAllBikes();
  return allBikes.filter((bike: Bike) => !bike.rentApproved && !bike.rentRejected);
}

// Approve bike rental
export async function approveBikeRental(bikeId: string) {
  const bike = await getBikeById(bikeId);
  const updatedBike = { ...bike, rentApproved: true };
  return await updateBike(updatedBike);
}

// Reject bike rental
export async function rejectBikeRental(bikeId: string) {
  const bike = await getBikeById(bikeId);
  const updatedBike = { ...bike, rentRejected: true };
  return await updateBike(updatedBike);
}
