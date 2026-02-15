import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 1800000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const generateArt = async (payload: { text: string; style: string }) => {
  return api.post("/generate", payload);
};
