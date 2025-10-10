import axios from "axios";
import { z } from "zod";
import { userSchema } from "./auth";

export enum ObstacleCategory {
  ACCIDENTS = "Accidents",
  TRAFFIC = "Traffic",
  ANIMALS = "Animals",
  MUD = "Mud",
  RAIN = "Rain",
  SLIPPERY = "Slippery",
}

export const obstacleSchema = z.object({
  _id: z.string(),
  name: z.string(),
  category: z.enum(ObstacleCategory),
  isShow: z.boolean(),
  createdBy: userSchema,
  obstacleLocation: z.number().optional(),
  obstacleLongitude: z.number().optional(),
});

export type Obstacle = z.infer<typeof obstacleSchema>;

export async function saveObstacle(data: Obstacle) {
  const res = await axios.post("/api/obstacle", data);
  return res.data;
}

export async function hideObstacle(id: string) {
  const res = await axios.patch(`/api/obstacle/${id}/is-show`);
  return res.data;
}

export async function fetchObstacleData({ category }: { category: string }) {
  console.log("Category in API:", category);
  const res = await axios.get(`/api/obstacle?category=${category}`);
  return res.data;
}
