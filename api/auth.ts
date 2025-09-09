import axios from "axios";
import { z } from "zod";

export enum Role {
  ADMIN = "Admin",
  USER = "User",
}

export const userSchema = z.object({
  id: z.number(),
  userName: z.string(),
  email: z.string(),
  mobile: z.string(),
  password: z.string(),
  confirmPassword: z.string().optional(),
  role: z.enum(Role)
});

export type User = z.infer<typeof userSchema>;

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const res = await axios.post(`/api/auth/login`, {
    email,
    password,
  });
  return res.data;
}

export async function validateUser() {
  const res = await axios.get("/api/auth/user");
  return res.data;
}

export async function userRegister(data: User) {
  const res = await axios.post("/api/auth/register", data);
  return res.data;
}

export async function logout() {
  const res = await axios.post("/api/auth/logout");
  return res.data;
}