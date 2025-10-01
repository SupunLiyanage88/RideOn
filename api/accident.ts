import axios from "axios";
import { z } from "zod";

export const accidentSchema = z.object({
  _id: z.string(),
  title: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  user: z.string(),
  createdAt: z.string(),
});

export type Accident = z.infer<typeof accidentSchema>;

export async function saveAccident(data: Accident) {
  const res = await axios.post("/api/accident", data);
  return res.data;
}
export async function getAllAccident() {
  const res = await axios.get("/api/accident");
  return res.data;
}
