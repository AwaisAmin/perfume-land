const JSON_HEADERS = { "Content-Type": "application/json", "X-Requested-With": "perfume-land-admin" };

export class ApiError extends Error {
  constructor(status, body) {
    super((body && body.error) || `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

async function handle(res) {
  let body = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }
  if (!res.ok) throw new ApiError(res.status, body);
  return body;
}

export function apiGet(path, query) {
  const url = new URL(path, window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
    }
  }
  return fetch(url, { credentials: "include" }).then(handle);
}

export function apiSend(method, path, body) {
  return fetch(path, {
    method,
    credentials: "include",
    headers: JSON_HEADERS,
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(handle);
}

export const apiPost = (path, body) => apiSend("POST", path, body);
export const apiPut = (path, body) => apiSend("PUT", path, body);
export const apiDelete = (path) => apiSend("DELETE", path);

export function apiUpload(file) {
  const formData = new FormData();
  formData.append("image", file);
  return fetch("/api/admin/uploads", {
    method: "POST",
    credentials: "include",
    headers: { "X-Requested-With": "perfume-land-admin" },
    body: formData,
  }).then(handle);
}
