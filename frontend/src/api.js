import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BASE}/api`;

export const http = axios.create({ baseURL: API });

export const tokenStore = {
  get: () => localStorage.getItem("admin_token") || "",
  set: (t) => localStorage.setItem("admin_token", t),
  clear: () => localStorage.removeItem("admin_token"),
};

export const authHeaders = () => {
  const t = tokenStore.get();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export const api = {
  getContent: () => http.get("/content").then((r) => r.data),
  sendMessage: (payload) => http.post("/messages", payload).then((r) => r.data),
  adminLogin: (password) => http.post("/admin/login", { password }).then((r) => r.data),
  adminMe: () => http.get("/admin/me", { headers: authHeaders() }).then((r) => r.data),
  adminUpdate: (patch) =>
    http.put("/admin/content", patch, { headers: authHeaders() }).then((r) => r.data),
  adminMessages: () =>
    http.get("/admin/messages", { headers: authHeaders() }).then((r) => r.data),
  adminDeleteMessage: (id) =>
    http.delete(`/admin/messages/${id}`, { headers: authHeaders() }).then((r) => r.data),
};
