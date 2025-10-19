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
  bikeStationId: z.string(),
});

// Schema for rental history with nested objects
export const rentalHistorySchema = z.object({
  _id: z.string(),
  bikeId: z.object({
    _id: z.string(),
    bikeId: z.string(),
    bikeModel: z.string(),
    fuelType: z.string(),
    distance: z.number(),
    condition: z.number(),
    availability: z.boolean(),
    assigned: z.boolean(),
    rentApproved: z.boolean(),
    rentRejected: z.boolean(),
    userAggrement: z.boolean(),
    createdBy: z.object({
      userAggrement: z.boolean(),
      _id: z.string(),
      email: z.string(),
      mobile: z.string(),
      userName: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      __v: z.number(),
      role: z.string(),
    }),
    createdAt: z.string(),
    updatedAt: z.string(),
    __v: z.number(),
  }),
  distance: z.number(),
  duration: z.number(),
  rcPrice: z.number(),
  userId: z.object({
    _id: z.string(),
    email: z.string(),
    mobile: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    __v: z.number(),
    role: z.string(),
    userName: z.string(),
    rc: z.number(),
    userAggrement: z.boolean(),
  }),
  selectedStationId: z.object({
    _id: z.string(),
    stationName: z.string(),
    stationId: z.string(),
    stationLocation: z.string(),
    bikeCount: z.number(),
    bikes: z.array(z.any()),
    latitude: z.number(),
    longitude: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    __v: z.number(),
  }),
  isRented: z.boolean(),
  latitude: z.number(),
  longitude: z.number(),
  userLatitude: z.number(),
  userLongitude: z.number(),
  fromLatitude: z.number(),
  fromLongitude: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
});

export type RentBike = z.infer<typeof rentBikeSchema>;
export type RentalHistoryItem = z.infer<typeof rentalHistorySchema>;

export async function saveRentBike(data: RentBike) {
  const res = await axios.post("/api/rent-bike", data);
  return res.data;
}
export async function fetchUserRentBike() {
  const res = await axios.get("/api/rent-bike");
  return res.data;
}
export async function fetchUserRentBikeHistory() {
  const res = await axios.get("/api/rent-bike/rented-bike-history");
  return res.data;
}

export async function fetchOwnerBikeRentals() {
  const res = await axios.get("/api/owner-bike-rentals");
  return res.data;
}

// Fetch rentals where the current user's bikes were rented by others
export async function fetchBikeOwnerEarnings() {
  const res = await axios.get("/api/owner-earnings");
  return res.data;
}

export async function fetchAllUsersRentBike() {
  const res = await axios.get("/api/rent-bike/all-rented");
  return res.data;
}

export async function updateUserLocation(data: any) {
  const res = await axios.put("/api/rent-bike/me", data);
  return res.data;
}

export async function stopRent() {
  const res = await axios.put("/api/rent-bike/trip-end");
  return res.data;
}