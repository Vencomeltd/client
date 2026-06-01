const API = import.meta.env.VITE_API_URL;

const getStoredValue = (primaryKey, fallbackKey) =>
  localStorage.getItem(primaryKey) || localStorage.getItem(fallbackKey);

export const getToken = () => getStoredValue("vencome_token", "token");

export const getUser = () => {
  const storedUser = getStoredValue("vencome_user", "user");
  return storedUser ? JSON.parse(storedUser) : null;
};

export const isLoggedIn = () => !!getToken();

export const isHost = () => {
  const user = getUser();
  return user?.isHost === true;
};

export const logout = async () => {
  const token = getToken();
  if (token) {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  localStorage.removeItem("vencome_token");
  localStorage.removeItem("vencome_refresh");
  localStorage.removeItem("vencome_user");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});
