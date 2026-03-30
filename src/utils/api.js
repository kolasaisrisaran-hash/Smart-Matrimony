// src/utils/api.js

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export default API_BASE;
export { API_BASE };