import { h } from "../dom.js";
import { apiGet, apiPost } from "../api.js";
import { showToast, showError } from "../toast.js";

export async function renderDashboard() {
  const data = await apiGet("/api/admin/dashboard");

  const refreshBtn = h("button", {
    class: "btn btn-secondary",
    type: "button",
    text: "Refresh website",
    onclick: async () => {
      refreshBtn.setAttribute("disabled", "true");
      refreshBtn.textContent = "Refreshing…";
      try {
        const result = await apiPost("/api/admin/revalidate");
        if (result.siteOk) {
          showToast("Website refreshed.");
        } else {
          showToast("Could not reach the website to refresh it. Is it running?", "error");
        }
      } catch (err) {
        showError(err);
      } finally {
        refreshBtn.removeAttribute("disabled");
        refreshBtn.textContent = "Refresh website";
      }
    },
  });

  return h("div", {}, [
    h("h1", { text: "Dashboard" }),
    h("div", { class: "stat-grid" }, [
      h("div", { class: "stat-card" }, [h("strong", { text: String(data.collections) }), "Collections"]),
      h("div", { class: "stat-card" }, [h("strong", { text: String(data.products) }), "Products"]),
      h("div", { class: "stat-card" }, [h("strong", { text: String(data.outOfStock) }), "Out of stock"]),
    ]),
    h("p", { class: "field-hint", text: "Changes you save here go live on the website within a few seconds." }),
    h("div", { class: "toolbar" }, [
      refreshBtn,
      h("p", { class: "field-hint", text: "Use this if the website was changed outside the CRM (e.g. by running seed/migrate) and looks out of date." }),
    ]),
  ]);
}
