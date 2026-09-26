import { h, clear } from "../dom.js";
import { apiGet, apiPut, ApiError } from "../api.js";
import { showToast, showError } from "../toast.js";
import { createImageField } from "./image-field.js";

export async function renderFeatured({ state }) {
  const root = h("div");
  const { featuredProduct } = await apiGet("/api/admin/featured-product");

  root.appendChild(h("h1", { text: "Featured product" }));

  if (!featuredProduct) {
    root.appendChild(h("p", { class: "empty-state", text: "No featured product set yet." }));
    return root;
  }

  const handleInput = h("input", { type: "text", required: true, value: featuredProduct.handle });
  const titleInput = h("input", { type: "text", required: true, value: featuredProduct.title });
  const descriptionInput = h("textarea", { text: featuredProduct.description, required: true });
  const imageField = createImageField({ label: "Image", initialValue: featuredProduct.image ?? "", siteUrl: state.siteUrl });
  const errorEl = h("p", { class: "field-error", role: "alert" });
  const saveBtn = h("button", { type: "submit", class: "btn btn-primary", text: "Save featured product" });

  const detailForm = h(
    "form",
    {
      class: "card",
      onsubmit: async (e) => {
        e.preventDefault();
        errorEl.textContent = "";
        saveBtn.setAttribute("disabled", "true");
        try {
          await apiPut("/api/admin/featured-product", {
            handle: handleInput.value.trim(),
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim(),
            image: imageField.getValue() || undefined,
          });
          showToast("Featured product saved.");
        } catch (err) {
          errorEl.textContent = err instanceof ApiError ? err.message : "Could not save.";
        } finally {
          saveBtn.removeAttribute("disabled");
        }
      },
    },
    [
      h("h2", { text: "Details" }),
      field("Product handle", handleInput, "Must match an existing product's handle."),
      field("Title", titleInput),
      field("Description", descriptionInput),
      imageField.element,
      errorEl,
      saveBtn,
    ]
  );

  const variantsWrap = h("div", { class: "card" });
  renderVariants(variantsWrap, featuredProduct.variants);

  function renderVariants(wrap, variants) {
    clear(wrap);
    const rows = variants.map((v) => makeVariantRow(v));
    const addBtn = h("button", { type: "button", class: "btn btn-secondary", onclick: () => rows.push(makeVariantRow({})) && rerenderRows(), text: "Add size" });
    const rowsWrap = h("div", {}, rows.map((r) => r.element));
    const saveVariantsBtn = h("button", { type: "button", class: "btn btn-primary", text: "Save sizes" });
    const variantsError = h("p", { class: "field-error", role: "alert" });

    function rerenderRows() {
      clear(rowsWrap);
      rows.forEach((r) => rowsWrap.appendChild(r.element));
    }

    saveVariantsBtn.addEventListener("click", async () => {
      variantsError.textContent = "";
      const payload = rows
        .filter((r) => !r.removed)
        .map((r) => ({
          size: r.sizeInput.value.trim(),
          price: Number(r.priceInput.value),
          compareAtPrice: r.compareInput.value === "" ? null : Number(r.compareInput.value),
        }))
        .filter((v) => v.size);
      if (payload.length === 0) {
        variantsError.textContent = "Add at least one size.";
        return;
      }
      saveVariantsBtn.setAttribute("disabled", "true");
      try {
        await apiPut("/api/admin/featured-product/variants", { variants: payload });
        showToast("Sizes saved.");
      } catch (err) {
        variantsError.textContent = err instanceof ApiError ? err.message : "Could not save sizes.";
      } finally {
        saveVariantsBtn.removeAttribute("disabled");
      }
    });

    function makeVariantRow(v) {
      const sizeInput = h("input", { type: "text", placeholder: "e.g. 50ml", value: v.size ?? "" });
      const priceInput = h("input", { type: "number", min: "0", placeholder: "Price", value: v.price ?? "" });
      const compareInput = h("input", { type: "number", min: "0", placeholder: "Compare-at", value: v.compareAtPrice ?? "" });
      const row = { sizeInput, priceInput, compareInput, removed: false };
      const removeBtn = h("button", {
        type: "button",
        class: "btn btn-secondary",
        text: "Remove",
        onclick: () => {
          row.removed = true;
          row.element.remove();
        },
      });
      row.element = h("div", { class: "toolbar" }, [
        field("Size", sizeInput),
        field("Price (Rs)", priceInput),
        field("Compare-at (Rs)", compareInput),
        removeBtn,
      ]);
      return row;
    }

    wrap.append(h("h2", { text: "Sizes / variants" }), rowsWrap, addBtn, saveVariantsBtn, variantsError);
  }

  function field(label, input, hint) {
    return h("div", { class: "field" }, [h("label", { text: label }), input, hint ? h("p", { class: "field-hint", text: hint }) : null]);
  }

  root.append(detailForm, variantsWrap);
  return root;
}
