const API_URL = import.meta.env.VITE_API_URL;

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("vencome_refresh");
  if (!refreshToken) throw new Error("No refresh token");

  const response = await fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem("vencome_token");
    localStorage.removeItem("vencome_refresh");
    localStorage.removeItem("vencome_user");
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
    return decoded.exp * 1000 < Date.now() + 60000;
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
