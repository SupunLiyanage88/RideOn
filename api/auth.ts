import axios from "axios";

const BASE_URL = "https://rideon-server.vercel.app";

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const res = await axios.post(`${BASE_URL}/api/auth/login`, {
    email,
    password,
  });
  return res.data;
}
