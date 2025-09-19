import axios from "axios";
import { z } from "zod";

export enum IncidentType {
    ACCIDENTS = "Accidents",
    MECHANICAL = "Mechanical",
    MEDICAL = "Medical",
    THEFT = "Theft",
    HAZARD = "Hazard",
}

export enum HowSerious {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High",
    CRITICAL = "Critical",
}

export const incidentSchema = z.object({
  _id: z.string(),
  incidentType: z.enum(IncidentType),
  howSerious: z.enum(HowSerious),
  description: z.string(),
  date: z.date(),
  time: z.date(),
});

export type Incident = z.infer<typeof incidentSchema>;

export async function saveIncident(data: Incident) {
  const res = await axios.post("/api/incident",data);
  return res.data;
}
