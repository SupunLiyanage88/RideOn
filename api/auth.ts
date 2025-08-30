import axios from "axios";
import { z } from "zod";

export const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  mobile: z.string(),
  password: z.string(),
  confirmPassword: z.string().optional(),
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