const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

// helper to attach JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem("sb_token");

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Capture knowledge
export const captureKnowledge = async (data: any) => {
  const res = await fetch(`${API_BASE}/brain/capture`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  return res.json();
};

// Query knowledge
export const queryKnowledge = async (question: string) => {
  const res = await fetch(`${API_BASE}/brain/query`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ question })
  });

  return res.json();
};

// Delete knowledge
export const deleteKnowledge = async (id: string) => {
  const res = await fetch(`${API_BASE}/brain/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  return res.json();
};
