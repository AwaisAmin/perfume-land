const root = document.getElementById("toast-root");

export function showToast(message, type = "success") {
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

export function showError(err) {
  const message = err && err.message ? err.message : "Something went wrong.";
  showToast(message, "error");
}
