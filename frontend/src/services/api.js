export async function uploadProjectZip(file) {
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) throw new Error("Failed to upload file");
    return response.json();
  }
  