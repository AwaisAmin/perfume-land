import { h } from "../dom.js";
import { apiGet, apiPut, ApiError } from "../api.js";
import { showToast } from "../toast.js";
import { createImageField } from "./image-field.js";

export async function renderFeatured({ state }) {
  const root = h("div");
  const { featuredProduct } = await apiGet("/api/admin/featured-product");

  root.appendChild(h("h1", { text: "Featured product" }));

  if (!featuredProduct) {
    root.appendChild(h("p", { class: "empty-state", text: "No featured product set yet." }));
    return root;
  }

  // Pick the product from a list instead of typing its handle.
  const { products } = await apiGet("/api/admin/products?pageSize=200");
  const handleInput = h(
    "select",
    { required: true },
    products.map((p) => h("option", { value: p.handle, text: `${p.title} (${p.collectionTitle})`, selected: p.handle === featuredProduct.handle }))
  );
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
      field("Product", handleInput),
      field("Title", titleInput),
      field("Description", descriptionInput),
      imageField.element,
      errorEl,
      saveBtn,
    ]
  );

  // Sizes and prices always come from the chosen product's own variants, so the
  // home section and the cart can never disagree.
  const pricesNote = h("div", { class: "card" }, [
    h("h2", { text: "Sizes & prices" }),
    h("p", { class: "field-hint", text: "The sizes and prices shown in this section come from the product's own variants. To change them, edit the product under Products." }),
  ]);

  function field(label, input, hint) {
    return h("div", { class: "field" }, [h("label", { text: label }), input, hint ? h("p", { class: "field-hint", text: hint }) : null]);
  }

  root.append(detailForm, pricesNote);
  return root;
}
