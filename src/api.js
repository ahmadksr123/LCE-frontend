// const API = "http://localhost:4000";
const API = "https://lce-backend-bxn1.onrender.com";

export async function apiRequest(path, method = "GET", body, token) {
  const res = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error((await res.json()).error || "Request failed");
  }
  return res.json();
}
