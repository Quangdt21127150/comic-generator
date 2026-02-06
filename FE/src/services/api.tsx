import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const generateArt = async (payload: {
  text: string;
  pages: number;
  style: string;
}) => {
  return api.post("/generate", payload);
};
