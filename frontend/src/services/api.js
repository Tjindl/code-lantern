// src/services/api.js
export async function uploadProjectZip(file) {
  const formData = new FormData();
  formData.append("file", file); // must match backend parameter name "file"

  const response = await fetch("http://localhost:5000/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Upload failed");
  }

  return response.json(); // backend returns repo_id, extracted_to, etc.
}
