import { h, clear } from "../dom.js";
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from "../api.js";
import { showToast, showError } from "../toast.js";
import { openModal } from "./modal.js";
import { createImageField } from "./image-field.js";

export async function renderLook({ state }) {
  const root = h("div", {}, [h("h1", { text: "Shop the look" })]);
  const listWrap = h("div");

  async function reload() {
    const { groups } = await apiGet("/api/admin/look-groups");
    clear(listWrap);
    listWrap.append(...groups.map((g) => buildGroupCard(g)));
    if (groups.length === 0) listWrap.appendChild(h("p", { class: "empty-state", text: "No look groups yet." }));
  }

  function buildGroupCard(group) {
    const imageField = createImageField({ label: "Background image", initialValue: group.image ?? "", siteUrl: state.siteUrl });
    const saveImageBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Save image" });
    const deleteGroupBtn = h("button", { type: "button", class: "btn btn-danger", text: "Delete group" });

    saveImageBtn.addEventListener("click", async () => {
      try {
        await apiPut(`/api/admin/look-groups/${group.id}`, { image: imageField.getValue() || undefined });
        showToast("Image saved.");
      } catch (err) {
        showError(err);
      }
    });
    deleteGroupBtn.addEventListener("click", async () => {
      if (!window.confirm("Delete this look group and all its items?")) return;
      try {
        await apiDelete(`/api/admin/look-groups/${group.id}`);
        showToast("Group deleted.");
        await reload();
      } catch (err) {
        showError(err);
      }
    });

    const itemsTable = buildItemsTable(group);
    const addItemBtn = h("button", { type: "button", class: "btn btn-primary", text: "Add item", onclick: () => openItemForm(group, null) });

    return h("div", { class: "card" }, [
      h("h2", { text: group.handle }),
      imageField.element,
      saveImageBtn,
      h("hr"),
      itemsTable,
      addItemBtn,
      deleteGroupBtn,
    ]);
  }

  function buildItemsTable(group) {
    if (group.items.length === 0) return h("p", { class: "empty-state", text: "No items in this group." });
    return h("table", {}, [
      h("thead", {}, [h("tr", {}, [h("th", { text: "Title" }), h("th", { text: "Price" }), h("th", { text: "Position" }), h("th", { text: "Actions" })])]),
      h(
        "tbody",
        {},
        group.items.map((item) =>
          h("tr", {}, [
            h("td", { text: item.title }),
            h("td", { text: `Rs ${item.price}` }),
            h("td", { text: `top ${item.top}%, left ${item.left}%` }),
            h("td", { class: "row-actions" }, [
              h("button", { class: "btn btn-secondary", type: "button", onclick: () => openItemForm(group, item), text: "Edit" }),
              h("button", { class: "btn btn-danger", type: "button", onclick: () => onDeleteItem(item), text: "Delete" }),
            ]),
          ])
        )
      ),
    ]);
  }

  async function onDeleteItem(item) {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await apiDelete(`/api/admin/look-groups/items/${item.id}`);
      showToast("Item deleted.");
      await reload();
    } catch (err) {
      showError(err);
    }
  }

  function openItemForm(group, item) {
    const isEdit = Boolean(item);
    const handleInput = h("input", { type: "text", required: true, value: item?.handle ?? "" });
    const titleInput = h("input", { type: "text", required: true, value: item?.title ?? "" });
    const priceInput = h("input", { type: "number", min: "0", required: true, value: item?.price ?? "" });
    const topInput = h("input", { type: "number", min: "0", max: "100", required: true, value: item?.top ?? 50 });
    const leftInput = h("input", { type: "number", min: "0", max: "100", required: true, value: item?.left ?? 50 });
    const imageField = createImageField({ label: "Image", initialValue: item?.image ?? "", siteUrl: state.siteUrl });
    const errorEl = h("p", { class: "field-error", role: "alert" });
    const submitBtn = h("button", { type: "submit", class: "btn btn-primary", text: isEdit ? "Save changes" : "Add item" });

    const form = h(
      "form",
      {
        onsubmit: async (e) => {
          e.preventDefault();
          errorEl.textContent = "";
          submitBtn.setAttribute("disabled", "true");
          const payload = {
            handle: handleInput.value.trim(),
            title: titleInput.value.trim(),
            price: Number(priceInput.value),
            top: Number(topInput.value),
            left: Number(leftInput.value),
            image: imageField.getValue() || undefined,
          };
          try {
            if (isEdit) {
              await apiPut(`/api/admin/look-groups/items/${item.id}`, payload);
              showToast("Item updated.");
            } else {
              await apiPost(`/api/admin/look-groups/${group.id}/items`, payload);
              showToast("Item added.");
            }
            modal.close();
            await reload();
          } catch (err) {
            errorEl.textContent = err instanceof ApiError ? err.message : "Could not save the item.";
          } finally {
            submitBtn.removeAttribute("disabled");
          }
        },
      },
      [
        field("Handle", handleInput),
        field("Title", titleInput),
        field("Price (Rs)", priceInput),
        field("Top position (%)", topInput),
        field("Left position (%)", leftInput),
        imageField.element,
        errorEl,
        submitBtn,
      ]
    );
    const modal = openModal(isEdit ? "Edit look item" : "Add look item", form);
  }

  function field(label, input) {
    return h("div", { class: "field" }, [h("label", { text: label }), input]);
  }

  const addGroupBtn = h("button", {
    type: "button",
    class: "btn btn-primary",
    text: "Add group",
    onclick: async () => {
      try {
        await apiPost("/api/admin/look-groups", {});
        showToast("Group added.");
        await reload();
      } catch (err) {
        showError(err);
      }
    },
  });

  root.append(h("div", { class: "toolbar" }, [addGroupBtn]), listWrap);
  await reload();
  return root;
}
