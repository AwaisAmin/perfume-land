import { h, clear } from "./dom.js";
import { apiGet, apiPost, ApiError } from "./api.js";
import { showError } from "./toast.js";
import { renderLogin } from "./views/login.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderProducts } from "./views/products.js";
import { renderCollections } from "./views/collections.js";
import { renderFeatured } from "./views/featured.js";
import { renderLook } from "./views/look.js";
import { renderSettings } from "./views/settings.js";
import { renderSiteContent } from "./views/content.js";

const appRoot = document.getElementById("app");

export const state = {
  admin: null,
  siteUrl: "http://localhost:3000",
};

const ROUTES = {
  "": renderDashboard,
  dashboard: renderDashboard,
  products: renderProducts,
  collections: renderCollections,
  featured: renderFeatured,
  look: renderLook,
  settings: renderSettings,
  content: renderSiteContent,
};

const NAV_ITEMS = [
  ["dashboard", "Dashboard"],
  ["products", "Products"],
  ["collections", "Collections"],
  ["featured", "Featured product"],
  ["look", "Shop the look"],
  ["settings", "Settings"],
  ["content", "Site content"],
];

function currentRoute() {
  return (window.location.hash || "#dashboard").replace(/^#\/?/, "");
}

async function logout() {
  try {
    await apiPost("/api/admin/auth/logout");
  } catch {
    // ignore — we're logging out regardless
  }
  state.admin = null;
  render();
}

function renderShell() {
  clear(appRoot);

  const nav = h(
    "nav",
    { class: "topbar__nav", "aria-label": "Admin navigation" },
    NAV_ITEMS.map(([route, label]) =>
      h("a", {
        href: `#${route}`,
        class: currentRoute() === route ? "active" : "",
        "aria-current": currentRoute() === route ? "page" : undefined,
        text: label,
      })
    )
  );

  const topbar = h("header", { class: "topbar" }, [
    h("span", { class: "topbar__brand", text: "Haris Bhai Perfumes — Admin" }),
    nav,
    h("button", { class: "logout-btn", type: "button", onclick: logout, text: `Log out (${state.admin?.email ?? ""})` }),
  ]);

  const main = h("main", { class: "view", id: "view-root" });
  appRoot.append(topbar, main);
  return main;
}

async function render() {
  if (!state.admin) {
    clear(appRoot);
    appRoot.appendChild(renderLogin({ onLoggedIn: onAuthenticated }));
    return;
  }

  const viewRoot = renderShell();
  const routeFn = ROUTES[currentRoute()] || renderDashboard;
  viewRoot.appendChild(h("p", { class: "loading-message", text: "Loading…" }));
  try {
    const view = await routeFn({ state });
    clear(viewRoot);
    viewRoot.appendChild(view);
  } catch (err) {
    clear(viewRoot);
    if (err instanceof ApiError && err.status === 401) {
      state.admin = null;
      render();
      return;
    }
    showError(err);
    viewRoot.appendChild(h("p", { class: "empty-state", text: "Could not load this page. Please refresh." }));
  }
}

// Views build `<label>text</label><input>` pairs without ids. Link every such
// label to the control that follows it so screen readers (and getByLabel) know
// what each field is. Runs for views, modals and rows added later.
let fieldIdCounter = 0;
function linkFieldLabels(root) {
  for (const label of root.querySelectorAll("label:not([for])")) {
    if (label.control) continue;
    let control = label.nextElementSibling;
    if (!control && label.parentElement?.classList.contains("checkbox-field")) control = label.previousElementSibling;
    if (!control || !control.matches("input, select, textarea")) continue;
    if (!control.id) control.id = `field-${++fieldIdCounter}`;
    label.htmlFor = control.id;
  }
}
new MutationObserver(() => linkFieldLabels(document.body)).observe(document.body, { childList: true, subtree: true });

async function onAuthenticated(admin) {
  state.admin = admin;
  try {
    const config = await apiGet("/api/admin/config");
    state.siteUrl = config.siteUrl;
  } catch {
    // keep default
  }
  render();
}

async function checkSession() {
  try {
    const res = await apiGet("/api/admin/auth/me");
    await onAuthenticated(res.admin);
  } catch {
    render();
  }
}

window.addEventListener("hashchange", render);
checkSession();
