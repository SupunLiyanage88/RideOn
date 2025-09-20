// src/api/package.ts
import axios from "axios";
import { z } from "zod";

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

// Adjust baseURL to your backend (local emulator: http://10.0.2.2:5000)
const API = axios.create({ baseURL: "http://10.0.2.2:5000/api" });

// CRUD functions
export async function getPackages(): Promise<Package[]> {
  const res = await API.get("/packages");
  return res.data;
}

export async function getPackageById(id: string): Promise<Package> {
  const res = await API.get(`/packages/${id}`);
  return res.data;
}

export async function savePackage(data: PackageInput): Promise<Package> {
  const res = await API.post("/packages", data);
  return res.data;
}

export async function updatePackage(id: string, data: PackageInput): Promise<Package> {
  const res = await API.put(`/packages/${id}`, data);
  return res.data;
}

export async function deletePackage(id: string): Promise<{ message: string }> {
  const res = await API.delete(`/packages/${id}`);
  return res.data;
}
