import axios from "axios";
import { z } from "zod";
export const bikeSchema = z.object({
    _id: z.string(),
    bikeModel: z.string(),
    fuelType: z.string(),
    distance : z.string(),
    condition: z.string(),
});

export type Bike = z.infer<typeof bikeSchema>;

export async function saveBike(data: Bike) {
    const res = await axios.post("/api/bike",data);
    return res.data;
}