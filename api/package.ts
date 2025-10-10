// src/api/package.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { z } from "zod";

const API = process.env.EXPO_PUBLIC_API_BASE_URL;


// Schema of a Package (matches backend model)
export const packageSchema = z.object({
  _id: z.string(),
  name: z.string(),
  rc: z.number(),
  price: z.number(),
  recommended: z.boolean(),
  icon: z.string().optional(),
  description: z.string(),
  timePeriod: z.number(),
});

// Input payload schema for creating/updating (no _id or isActive required)
export const packageInputSchema = z.object({
  name: z.string(),
  rc: z.number(),
  price: z.number(),
  recommended: z.boolean().optional(),
  description: z.string(),
  timePeriod: z.number(),
});

export type Package = z.infer<typeof packageSchema>;
export type PackageInput = z.infer<typeof packageInputSchema>;
export type ImagePart = { uri: string; name: string; type: string };

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

function buildFormData(data: PackageInput, image?: ImagePart) {
  const fd = new FormData();
  fd.append("name", data.name);
  fd.append("rc", String(data.rc));
  fd.append("price", String(data.price));
  fd.append("timePeriod", String(data.timePeriod));
  fd.append("description", data.description);
  if (typeof data.recommended === "boolean") {
    fd.append("recommended", String(data.recommended));
  }
  if (image) {
    // @ts-ignore RN FormData file object
    fd.append("icon", image); // field name must match multer: upload.single("icon")
  }
  return fd;
}

// ---- SAVE (multipart) ----
export async function savePackage(args: { data: PackageInput; image?: ImagePart }) {
  const headers = await getAuthHeaders();
  const formData = buildFormData(args.data, args.image);
  return axios.post(`${API}/api/package`, formData, {
    headers: { ...headers, "Content-Type": "multipart/form-data" },
  });
}

// ---- UPDATE (multipart) ----
export async function updatePackage(id: string, args: { data: PackageInput; image?: ImagePart }) {
  const headers = await getAuthHeaders();
  const formData = buildFormData(args.data, args.image);
  // Using PUT to replace resource (controller supports it below)
  return axios.patch(`${API}/api/package/${id}`, formData, {
    headers: { ...headers, "Content-Type": "multipart/form-data" },
  });
}

// ---- FETCH ALL PACKAGES ----
export async function fetchPackages() {
  const headers = await getAuthHeaders();
  const res = await axios.get(`${API}/api/package`, { headers });
  return res.data.data || [];
}

// ---- DELETE PACKAGE ----
export async function deletePackage(id: string) {
  const headers = await getAuthHeaders();
  return axios.delete(`${API}/api/package/${id}`, { headers });
}

/** GET /api/user-package/active
 * Returns the user's active packages
 */
export async function fetchActiveUserPackages() {
  const headers = await getAuthHeaders();
  const res = await axios.get(`${API}/api/user-package/active`, { headers });
  // controller returns an array directly (not wrapped)
  return Array.isArray(res.data) ? res.data : [];
}

/** POST /api/user-package/activate  { packageId }
 * Activates (or renews) a package for the logged-in user
 * returns { success, message, data: { package, updatedRC } }
 */
export async function activateUserPackage(packageId: string) {
  const headers = await getAuthHeaders();
  const res = await axios.post(
    `${API}/api/user-package/activate`,
    { packageId },
    { headers }
  );
  return res.data;
}

/** GET /api/user-package/rc -> { success, data: { rc, ... } } */
export async function fetchUserRcTotal() {
  const headers = await getAuthHeaders();
  const res = await axios.get(`${API}/api/user-package/rc`, { headers });
  return res.data?.data?.rc ?? 0;
}