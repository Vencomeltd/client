const API_URL = import.meta.env.VITE_API_URL;

// Per-tab (sessionStorage) so it can never leak into another tab.
const ACT_AS_KEY = "vencome_act_as_host";
export const getActAsHost = () => {
  try {
    return sessionStorage.getItem(ACT_AS_KEY) || "";
  } catch {
    return "";
  }
};
export const setActAsHost = (hostId) => {
  try {
    if (hostId) sessionStorage.setItem(ACT_AS_KEY, hostId);
    else sessionStorage.removeItem(ACT_AS_KEY);
  } catch {
    // storage unavailable: the wizard simply works as the signed-in user
  }
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("vencome_refresh");
  if (!refreshToken) {
    localStorage.removeItem("vencome_token");
    localStorage.removeItem("vencome_refresh");
    localStorage.removeItem("vencome_user");
    localStorage.removeItem("vencome_login_time");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  const response = await fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem("vencome_token");
    localStorage.removeItem("vencome_refresh");
    localStorage.removeItem("vencome_user");
    localStorage.removeItem("vencome_login_time");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  const data = await response.json();
  const newToken = data.token || data.accessToken;
  localStorage.setItem("vencome_token", newToken);
  return newToken;
};

const isTokenExpired = (token) => {
  try {
    const base64 = token.split(".")[1];
    const decoded = JSON.parse(atob(base64));
    return decoded.exp * 1000 < Date.now() + 300000;
  } catch {
    return true;
  }
};

export const apiFetch = async (endpoint, options = {}) => {
  let token = localStorage.getItem("vencome_token");

  if (!token || isTokenExpired(token)) {
    token = await refreshAccessToken();
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // An admin building a listing for a customer in the host wizard (see
  // CreateSpace.jsx, ?forHost=). Only draft requests and the create-listing
  // POST carry it, and the server only honours it for admins.
  const actAsHost = getActAsHost();
  const method = (options.method || "GET").toUpperCase();
  if (actAsHost && (endpoint.startsWith("/drafts") || (endpoint === "/properties" && method === "POST"))) {
    headers["X-Act-As-Host"] = actAsHost;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("vencome_token");
    localStorage.removeItem("vencome_refresh");
    localStorage.removeItem("vencome_user");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  return response;
};

export default apiFetch;
