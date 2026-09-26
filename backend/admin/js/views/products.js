import { h, clear } from "../dom.js";
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from "../api.js";
import { showToast, showError } from "../toast.js";
import { openModal } from "./modal.js";
import { createImageField } from "./image-field.js";

const VARIANT_TYPES = ["EDT", "EDP", "Perfume"];
const VARIANT_SIZES = ["35ml", "50ml", "100ml"];

export async function renderProducts({ state }) {
  const root = h("div");
  const [{ products }, { collections }] = await Promise.all([
    apiGet("/api/admin/products", { pageSize: 200 }),
    apiGet("/api/admin/collections"),
  ]);

  let currentSearch = "";
  let currentCollectionId = "";

  const searchInput = h("input", { type: "search", id: "product-search", placeholder: "Search by title or handle" });
  // Lists every collection, regardless of the list filter above.
  const collectionSelect = h("select", { id: "product-collection-filter" }, [
    h("option", { value: "", text: "All collections" }),
    ...collections.map((c) => h("option", { value: String(c.dbId), text: c.title })),
  ]);

  const tableWrap = h("div", { class: "table-wrap" });

  async function reload() {
    clear(tableWrap);
    tableWrap.appendChild(h("p", { class: "loading-message", text: "Loading products…" }));
    try {
      const res = await apiGet("/api/admin/products", {
        pageSize: 200,
        search: currentSearch || undefined,
        collectionId: currentCollectionId || undefined,
      });
      clear(tableWrap);
      tableWrap.appendChild(buildTable(res.products));
    } catch (err) {
      clear(tableWrap);
      showError(err);
    }
  }

  function priceRangeLabel(row) {
    if (row.minPrice === row.maxPrice) return `Rs ${row.minPrice}`;
    return `Rs ${row.minPrice} – Rs ${row.maxPrice}`;
  }

  function buildTable(rows) {
    if (rows.length === 0) return h("p", { class: "empty-state", text: "No products found." });

    const table = h("table", {}, [
      h("thead", {}, [
        h("tr", {}, [
          h("th", { text: "Image" }),
          h("th", { text: "Title" }),
          h("th", { text: "Collection" }),
          h("th", { text: "Price range" }),
          h("th", { text: "Variants" }),
          h("th", { text: "Stock" }),
          h("th", { text: "Actions" }),
        ]),
      ]),
      h(
        "tbody",
        {},
        rows.map((p) =>
          h("tr", {}, [
            h("td", {}, [
              p.image
                ? h("img", { class: "thumb", src: resolveImage(p.image, state.siteUrl), alt: "" })
                : h("span", { class: "field-hint", text: "—" }),
            ]),
            h("td", { text: p.title }),
            h("td", { text: p.collectionTitle }),
            h("td", { text: priceRangeLabel(p) }),
            h("td", { text: String(p.variantCount) }),
            h("td", {}, [
              p.inStock ? h("span", { class: "tag", text: "In stock" }) : h("span", { class: "tag tag--out", text: "Out of stock" }),
            ]),
            h("td", { class: "row-actions" }, [
              h("button", { class: "btn btn-secondary", type: "button", onclick: () => editProduct(p), text: "Edit" }),
              h("button", { class: "btn btn-danger", type: "button", onclick: () => onDelete(p), text: "Delete" }),
            ]),
          ])
        )
      ),
    ]);
    return table;
  }

  function resolveImage(path, siteUrl) {
    if (!path) return "";
    return /^https?:\/\//i.test(path) ? path : `${siteUrl}${path}`;
  }

  async function onDelete(product) {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    try {
      await apiDelete(`/api/admin/products/${product.dbId}`);
      showToast("Product deleted.");
      await reload();
    } catch (err) {
      showError(err);
    }
  }

  async function editProduct(row) {
    try {
      const { product } = await apiGet(`/api/admin/products/${row.dbId}`);
      openProductForm(product);
    } catch (err) {
      showError(err);
    }
  }

  // --- Variants editor -----------------------------------------------

  function createVariantRow(variant) {
    const sizeSelect = h(
      "select",
      { "aria-label": "Size" },
      VARIANT_SIZES.map((size) => h("option", { value: size, selected: (variant?.size ?? "50ml") === size, text: size }))
    );
    const typeSelect = h(
      "select",
      { "aria-label": "Type" },
      VARIANT_TYPES.map((type) => h("option", { value: type, selected: variant?.type === type, text: type }))
    );
    const priceInput = h("input", { type: "number", min: "1", step: "1", required: true, "aria-label": "Price (Rs)", placeholder: "Price (Rs)", value: variant?.price ?? "" });
    const compareInput = h("input", { type: "number", min: "0", step: "1", "aria-label": "Compare-at price (Rs)", placeholder: "Compare-at (Rs)", value: variant?.compareAtPrice ?? "" });
    const inStockInput = h("input", { type: "checkbox", "aria-label": "In stock", checked: variant?.inStock !== false });

    function syncTypeForSize() {
      if (sizeSelect.value === "35ml") {
        typeSelect.value = "";
        typeSelect.setAttribute("disabled", "true");
      } else {
        typeSelect.removeAttribute("disabled");
        if (!typeSelect.value) typeSelect.value = "Perfume";
      }
    }
    syncTypeForSize();
    sizeSelect.addEventListener("change", syncTypeForSize);

    const removeBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Remove" });
    const row = {
      id: variant?.id,
      element: null,
      removed: false,
      getValue() {
        return {
          id: this.id,
          size: sizeSelect.value,
          type: sizeSelect.value === "35ml" ? null : typeSelect.value,
          price: priceInput.value === "" ? undefined : Number(priceInput.value),
          compareAtPrice: compareInput.value === "" ? null : Number(compareInput.value),
          inStock: inStockInput.checked,
        };
      },
    };
    removeBtn.addEventListener("click", () => {
      row.removed = true;
      row.element.remove();
    });

    row.element = h("div", { class: "toolbar", role: "group", "aria-label": "Variant" }, [
      field("Size", sizeSelect),
      field("Type", typeSelect),
      field("Price (Rs)", priceInput),
      field("Compare-at (Rs)", compareInput),
      h("div", { class: "field checkbox-field" }, [inStockInput, h("label", { text: "In stock" })]),
      removeBtn,
    ]);
    return row;
  }

  function createVariantsEditor(initialVariants) {
    const rows = (initialVariants && initialVariants.length ? initialVariants : [{ size: "50ml", type: "Perfume", inStock: true }]).map(
      createVariantRow
    );
    const rowsWrap = h("div", {}, rows.map((r) => r.element));
    const errorEl = h("p", { class: "field-error", role: "alert" });
    const addBtn = h("button", {
      type: "button",
      class: "btn btn-secondary",
      text: "Add variant",
      onclick: () => {
        const row = createVariantRow(null);
        rows.push(row);
        rowsWrap.appendChild(row.element);
      },
    });
    return {
      element: h("div", { class: "card" }, [h("h3", { text: "Variants (size / type / price)" }), rowsWrap, addBtn, errorEl]),
      errorEl,
      getVariants: () => rows.filter((r) => !r.removed).map((r) => r.getValue()),
    };
  }

  // --- Product form ----------------------------------------------------

  function openProductForm(product) {
    const isEdit = Boolean(product);
    const titleInput = h("input", { type: "text", required: true, value: product?.title ?? "" });
    const handleInput = h("input", { type: "text", value: product?.handle ?? "", placeholder: "auto from title if left blank" });
    const collectionSelectForm = h(
      "select",
      { required: true },
      collections.map((c) =>
        h("option", { value: String(c.dbId), selected: (product?.collectionId ?? collections[0]?.dbId) === c.dbId, text: c.title })
      )
    );
    const genderSelect = h("select", {}, [
      h("option", { value: "", text: "Not set" }),
      h("option", { value: "unisex", selected: product?.gender === "unisex", text: "Unisex" }),
      h("option", { value: "women", selected: product?.gender === "women", text: "Women" }),
      h("option", { value: "men", selected: product?.gender === "men", text: "Men" }),
    ]);
    const kickerInput = h("input", { type: "text", value: product?.kicker ?? "" });
    const stockCountInput = h("input", { type: "number", min: "0", step: "1", value: product?.stockCount ?? "" });
    const descriptionInput = h("textarea", { text: product?.description ?? "" });
    const imageField = createImageField({ label: "Image", initialValue: product?.image ?? "", siteUrl: state.siteUrl });
    const variantsEditor = createVariantsEditor(product?.variants);
    const errorEl = h("p", { class: "field-error", role: "alert" });
    const submitBtn = h("button", { type: "submit", class: "btn btn-primary", text: isEdit ? "Save changes" : "Add product" });

    const form = h(
      "form",
      {
        onsubmit: async (e) => {
          e.preventDefault();
          errorEl.textContent = "";
          const variants = variantsEditor.getVariants();
          if (variants.length === 0) {
            errorEl.textContent = "Add at least one variant.";
            return;
          }
          const missingPrice = variants.some((v) => v.price === undefined || Number.isNaN(v.price) || v.price <= 0);
          if (missingPrice) {
            errorEl.textContent = "Enter a price greater than 0 for every variant.";
            return;
          }
          submitBtn.setAttribute("disabled", "true");
          try {
            // Explicit null (not undefined) for optional fields, so clearing
            // one in this form actually clears it on the server rather than
            // being silently ignored.
            const payload = {
              title: titleInput.value.trim(),
              handle: handleInput.value.trim() || undefined,
              collectionId: Number(collectionSelectForm.value),
              kicker: kickerInput.value.trim() || null,
              gender: genderSelect.value || null,
              stockCount: stockCountInput.value === "" ? null : Number(stockCountInput.value),
              description: descriptionInput.value.trim() || null,
              image: imageField.getValue() || null,
              variants,
            };
            if (isEdit) {
              // One request for product fields + variants together, so the
              // result shown is always the true final state.
              await apiPut(`/api/admin/products/${product.dbId}`, payload);
              showToast("Product updated.");
            } else {
              await apiPost("/api/admin/products", payload);
              showToast("Product added.");
            }
            modal.close();
            await reload();
          } catch (err) {
            errorEl.textContent = err instanceof ApiError ? err.message : "Could not save the product.";
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
            ? "Only lowercase letters, numbers and dashes. Warning: changing this changes the product's web address — old links to it will stop working."
            : "Only lowercase letters, numbers and dashes."
        ),
        field("Collection", collectionSelectForm),
        field("Kicker (small label above title, optional)", kickerInput),
        field("Gender", genderSelect),
        field("Stock count (optional, for the stock progress bar)", stockCountInput),
        field("Description", descriptionInput),
        imageField.element,
        variantsEditor.element,
        errorEl,
        submitBtn,
      ]
    );

    const modal = openModal(isEdit ? "Edit product" : "Add product", form);
  }

  function field(label, input, hint) {
    return h("div", { class: "field" }, [h("label", { text: label }), input, hint ? h("p", { class: "field-hint", text: hint }) : null]);
  }

  searchInput.addEventListener("input", debounce(() => {
    currentSearch = searchInput.value.trim();
    reload();
  }, 300));
  collectionSelect.addEventListener("change", () => {
    currentCollectionId = collectionSelect.value;
    reload();
  });

  root.append(
    h("h1", { text: "Products" }),
    h("div", { class: "toolbar" }, [
      h("div", { class: "field" }, [h("label", { for: "product-search", text: "Search" }), searchInput]),
      h("div", { class: "field" }, [h("label", { for: "product-collection-filter", text: "Collection" }), collectionSelect]),
      h("button", { class: "btn btn-primary", type: "button", onclick: () => openProductForm(null), text: "Add product" }),
    ]),
    tableWrap
  );

  tableWrap.appendChild(buildTable(products));
  return root;
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
