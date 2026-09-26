import { h, clear } from "../dom.js";
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from "../api.js";
import { showToast, showError } from "../toast.js";
import { openModal } from "./modal.js";
import { createImageField } from "./image-field.js";

export async function renderCollections({ state }) {
  const root = h("div");
  const listWrap = h("div", { class: "table-wrap" });

  async function reload() {
    const { collections } = await apiGet("/api/admin/collections");
    clear(listWrap);
    listWrap.appendChild(buildTable(collections));
  }

  function buildTable(collections) {
    if (collections.length === 0) return h("p", { class: "empty-state", text: "No collections yet." });
    return h("table", {}, [
      h("thead", {}, [h("tr", {}, [h("th", { text: "Title" }), h("th", { text: "Handle" }), h("th", { text: "Products" }), h("th", { text: "Actions" })])]),
      h(
        "tbody",
        {},
        collections.map((c) =>
          h("tr", {}, [
            h("td", { text: c.title }),
            h("td", { text: c.handle }),
            h("td", { text: String(c.productCount) }),
            h("td", { class: "row-actions" }, [
              h("button", { class: "btn btn-secondary", type: "button", onclick: () => openForm(c), text: "Edit" }),
              h("button", {
                class: "btn btn-danger",
                type: "button",
                onclick: () => onDelete(c),
                text: "Delete",
                disabled: c.productCount > 0,
                title: c.productCount > 0 ? "Move or delete its products first." : undefined,
              }),
            ]),
          ])
        )
      ),
    ]);
  }

  async function onDelete(collection) {
    if (!window.confirm(`Delete "${collection.title}"?`)) return;
    try {
      await apiDelete(`/api/admin/collections/${collection.dbId}`);
      showToast("Collection deleted.");
      await reload();
    } catch (err) {
      showError(err);
    }
  }

  function openForm(collection) {
    const isEdit = Boolean(collection);
    const titleInput = h("input", { type: "text", required: true, value: collection?.title ?? "" });
    const handleInput = h("input", { type: "text", value: collection?.handle ?? "" });
    const kickerInput = h("input", { type: "text", value: collection?.kicker ?? "" });
    const pageTitleInput = h("input", { type: "text", value: collection?.pageTitle ?? "" });
    const imageField = createImageField({ label: "Hero image", initialValue: collection?.heroImage ?? "", siteUrl: state.siteUrl });
    const errorEl = h("p", { class: "field-error", role: "alert" });
    const submitBtn = h("button", { type: "submit", class: "btn btn-primary", text: isEdit ? "Save changes" : "Add collection" });

    const form = h(
      "form",
      {
        onsubmit: async (e) => {
          e.preventDefault();
          errorEl.textContent = "";
          submitBtn.setAttribute("disabled", "true");
          try {
            const payload = {
              title: titleInput.value.trim(),
              handle: handleInput.value.trim() || undefined,
              kicker: kickerInput.value.trim() || undefined,
              pageTitle: pageTitleInput.value.trim() || undefined,
              heroImage: imageField.getValue() || undefined,
            };
            if (isEdit) {
              await apiPut(`/api/admin/collections/${collection.dbId}`, payload);
              showToast("Collection updated.");
            } else {
              await apiPost("/api/admin/collections", payload);
              showToast("Collection added.");
            }
            modal.close();
            await reload();
          } catch (err) {
            errorEl.textContent = err instanceof ApiError ? err.message : "Could not save the collection.";
          } finally {
            submitBtn.removeAttribute("disabled");
          }
        },
      },
      [
        field("Title", titleInput),
        field(
          "Handle (URL slug)",
          handleInput,
          isEdit
            ? "Only lowercase letters, numbers and dashes. Warning: changing this changes the collection's web address — old links to it will stop working."
            : "Only lowercase letters, numbers and dashes."
        ),
        field("Kicker (small label above title)", kickerInput),
        field("Page title (defaults to title)", pageTitleInput),
        imageField.element,
        errorEl,
        submitBtn,
      ]
    );
    const modal = openModal(isEdit ? "Edit collection" : "Add collection", form);
  }

  function field(label, input, hint) {
    return h("div", { class: "field" }, [h("label", { text: label }), input, hint ? h("p", { class: "field-hint", text: hint }) : null]);
  }

  root.append(
    h("h1", { text: "Collections" }),
    h("div", { class: "toolbar" }, [h("button", { class: "btn btn-primary", type: "button", onclick: () => openForm(null), text: "Add collection" })]),
    listWrap
  );

  await reload();
  return root;
}
