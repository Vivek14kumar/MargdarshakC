const BASE_URL = import.meta.env.VITE_API_URL;

export const authRequest = async ({ action, email, password }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Authentication failed");
    }

    // Save token on login
    if (data.token) {
      localStorage.setItem("adminToken", data.token);
    }

    return data;
  } catch (error) {
    console.error("Auth error:", error.message);
    throw error;
  }
};
