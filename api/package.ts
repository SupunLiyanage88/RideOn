// src/api/package.ts
import axios from "axios";
import { z } from "zod";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = process.env.EXPO_PUBLIC_API_BASE_URL;


// Schema of a Package (matches backend model)
export const packageSchema = z.object({
  _id: z.string(),
  name: z.string(),
  rc: z.string(),
  price: z.string(),
  recommended: z.boolean(),
  icon: z.string(),
  description: z.string(),
  isActive: z.boolean(),
});

// Input payload schema for creating/updating (no _id or isActive required)
export const packageInputSchema = z.object({
  name: z.string(),
  rc: z.string(),
  price: z.string(),
  recommended: z.boolean().optional(),
  icon: z.string().optional(),
  description: z.string(),
});

export type Package = z.infer<typeof packageSchema>;
export type PackageInput = z.infer<typeof packageInputSchema>;


async function getAuthHeaders() {
  const token = await AsyncStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

// ---- SAVE PACKAGE ----
export async function savePackage(data: any) {
  const headers = await getAuthHeaders();
  return axios.post(`${API}/api/packages/add`, data, { headers });
}

// ---- UPDATE PACKAGE ----
export async function updatePackage(id: string, data: any) {
  const headers = await getAuthHeaders();
  return axios.put(`${API}/api/packages/${id}`, data, { headers });
}

// ---- FETCH ALL PACKAGES ----
export async function fetchPackages() {
  const headers = await getAuthHeaders();
  const res = await axios.get(`${API}/api/packages`, { headers });
  return res.data;
}

// ---- DELETE PACKAGE ----
export async function deletePackage(id: string) {
  const headers = await getAuthHeaders();
  return axios.delete(`${API}/api/packages/${id}`, { headers });
}