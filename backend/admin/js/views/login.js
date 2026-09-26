import { h } from "../dom.js";
import { apiPost, ApiError } from "../api.js";

export function renderLogin({ onLoggedIn }) {
  const errorEl = h("p", { class: "field-error", role: "alert" });
  const emailInput = h("input", { type: "email", id: "login-email", required: true, autocomplete: "username" });
  const passwordInput = h("input", { type: "password", id: "login-password", required: true, autocomplete: "current-password" });
  const submitBtn = h("button", { type: "submit", class: "btn btn-primary", text: "Log in" });

  const form = h(
    "form",
    {
      onsubmit: async (e) => {
        e.preventDefault();
        errorEl.textContent = "";
        submitBtn.setAttribute("disabled", "true");
        submitBtn.textContent = "Logging in…";
        try {
          const res = await apiPost("/api/admin/auth/login", {
            email: emailInput.value.trim(),
            password: passwordInput.value,
          });
          onLoggedIn(res.admin);
        } catch (err) {
          errorEl.textContent = err instanceof ApiError ? err.message : "Could not log in. Please try again.";
        } finally {
          submitBtn.removeAttribute("disabled");
          submitBtn.textContent = "Log in";
        }
      },
    },
    [
      h("div", { class: "field" }, [h("label", { for: "login-email", text: "Email" }), emailInput]),
      h("div", { class: "field" }, [h("label", { for: "login-password", text: "Password" }), passwordInput]),
      errorEl,
      submitBtn,
    ]
  );

  return h("div", { class: "login-wrap" }, [
    h("div", { class: "login-card" }, [h("h1", { text: "Admin sign in" }), form]),
  ]);
}
