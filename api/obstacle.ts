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
});

export type Obstacle = z.infer<typeof obstacleSchema>;

export async function saveObstacle(data: Obstacle) {
  const res = await axios.post("/api/obstacle", data);
  return res.data;
}