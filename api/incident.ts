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
  time: z.string(),
  createdAt: z.string().or(z.date()),
  user: z.object({
    _id: z.string(),
    email: z.string(),
  }).optional(), 
});

export type Incident = z.infer<typeof incidentSchema>;

export async function saveIncident(data: Incident) {
  const res = await axios.post("/api/incident", data);
  return res.data;
}
export async function getUserIncident() {
  const res = await axios.get("/api/incident/user-incidents");
  return res.data;
}
export async function getAllIncident() {
  const res = await axios.get("/api/incident");
  return res.data;
}

export async function updateIncident(data: Incident) {
  const res = await axios.put(`/api/incident/${data._id}`, data);
  return res.data;
}

export async function deleteIncident(id?: string) {
  const res = await axios.delete(`/api/incident/${id}`);
  return res.data;
}
