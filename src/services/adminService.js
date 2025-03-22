// src/services/adminService.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_NOCODB_URL + "/api/v2",
  headers: {
    "xc-token": process.env.REACT_APP_NOCODB_TOKEN,
    "Content-Type": "application/json",
  },
});

export const isAdmin = async (email) => {
  const { data } = await api.get("/tables/mq3yj6dmzslr9i3/records");
  return data.list.some((item) => item["Email Administração"]?.toLowerCase() === email.toLowerCase());
};

export const getEmailsAdministradores = async () => {
  const { data } = await api.get("/tables/mq3yj6dmzslr9i3/records");
  return data.list.map((item) => item["Email Administração"]?.toLowerCase()).filter(Boolean);
};