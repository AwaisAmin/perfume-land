import { h, clear } from "../dom.js";
import { apiGet, apiPut, ApiError } from "../api.js";
import { showToast, showError } from "../toast.js";
import { createImageField } from "./image-field.js";

export async function renderSettings({ state }) {
  const { settings } = await apiGet("/api/admin/settings");
  const root = h("div", {}, [h("h1", { text: "Settings" })]);

  root.append(
    buildAnnouncementsSection(settings.announcements ?? []),
    buildShippingSection(settings.freeShippingThreshold ?? 0),
    buildContactSection(settings.contact ?? { whatsappNumber: "", branches: [] }),
    buildImagesSection(settings.bottleImage ?? "", settings.beforeAfterImages ?? { him: "", her: "" }),
    buildBrandSection(settings.brand ?? { journeyImage: "", brandValues: [], brandCraft: [] }),
    buildNavSection(settings.nav ?? { brandImpressionsGroups: [], primaryNavStart: [], primaryNavEnd: [] })
  );

  return root;

  function saveButton(label, onClick) {
    const errorEl = h("p", { class: "field-error", role: "alert" });
    const btn = h("button", {
      type: "button",
      class: "btn btn-primary",
      text: label,
      onclick: async () => {
        errorEl.textContent = "";
        btn.setAttribute("disabled", "true");
        try {
          await onClick();
          showToast("Saved.");
        } catch (err) {
          errorEl.textContent = err instanceof ApiError ? err.message : "Could not save.";
        } finally {
          btn.removeAttribute("disabled");
        }
      },
    });
    return { btn, errorEl };
  }

  function field(label, input) {
    return h("div", { class: "field" }, [h("label", { text: label }), input]);
  }

  function buildAnnouncementsSection(initial) {
    const items = [...initial];
    const listWrap = h("div");

    function draw() {
      clear(listWrap);
      items.forEach((text, index) => {
        const input = h("input", { type: "text", value: text });
        input.addEventListener("input", () => (items[index] = input.value));
        const removeBtn = h("button", {
          type: "button",
          class: "btn btn-secondary",
          text: "Remove",
          onclick: () => {
            items.splice(index, 1);
            draw();
          },
        });
        listWrap.appendChild(h("div", { class: "toolbar" }, [field(`Message ${index + 1}`, input), removeBtn]));
      });
    }
    draw();

    const addBtn = h("button", {
      type: "button",
      class: "btn btn-secondary",
      text: "Add message",
      onclick: () => {
        items.push("");
        draw();
      },
    });
    const { btn, errorEl } = saveButton("Save announcements", () =>
      apiPut("/api/admin/settings/announcements", { value: items.filter((v) => v.trim()) })
    );

    return h("section", { class: "card" }, [h("h2", { text: "Announcement bar" }), listWrap, addBtn, btn, errorEl]);
  }

  function buildShippingSection(initial) {
    const input = h("input", { type: "number", min: "0", value: initial });
    const { btn, errorEl } = saveButton("Save threshold", () =>
      apiPut("/api/admin/settings/freeShippingThreshold", { value: Number(input.value) })
    );
    return h("section", { class: "card" }, [h("h2", { text: "Free shipping threshold (Rs)" }), field("Threshold", input), btn, errorEl]);
  }

  function buildContactSection(initial) {
    const whatsappInput = h("input", { type: "text", value: initial.whatsappNumber ?? "" });
    const orderWhatsappInput = h("input", { type: "text", value: initial.orderWhatsappNumber ?? initial.whatsappNumber ?? "" });
    const branches = (initial.branches ?? []).map((b) => ({ ...b }));
    const branchesWrap = h("div");

    function draw() {
      clear(branchesWrap);
      branches.forEach((branch, index) => {
        const nameInput = h("input", { type: "text", value: branch.name ?? "" });
        const addressInput = h("input", { type: "text", value: branch.address ?? "" });
        const mapInput = h("input", { type: "url", value: branch.mapUrl ?? "" });
        nameInput.addEventListener("input", () => (branch.name = nameInput.value));
        addressInput.addEventListener("input", () => (branch.address = addressInput.value));
        mapInput.addEventListener("input", () => (branch.mapUrl = mapInput.value));
        const removeBtn = h("button", {
          type: "button",
          class: "btn btn-secondary",
          text: "Remove branch",
          onclick: () => {
            branches.splice(index, 1);
            draw();
          },
        });
        branchesWrap.appendChild(
          h("div", { class: "card" }, [field("Name", nameInput), field("Address", addressInput), field("Map URL (optional)", mapInput), removeBtn])
        );
      });
    }
    draw();

    const addBranchBtn = h("button", {
      type: "button",
      class: "btn btn-secondary",
      text: "Add branch",
      onclick: () => {
        branches.push({ name: "", address: "" });
        draw();
      },
    });
    const { btn, errorEl } = saveButton("Save contact info", () =>
      apiPut("/api/admin/settings/contact", {
        value: {
          whatsappNumber: whatsappInput.value.trim(),
          orderWhatsappNumber: orderWhatsappInput.value.trim() || whatsappInput.value.trim(),
          branches: branches
            .filter((b) => b.name && b.address)
            .map((b) => ({ name: b.name.trim(), address: b.address.trim(), mapUrl: b.mapUrl?.trim() || undefined })),
        },
      })
    );

    return h("section", { class: "card" }, [
      h("h2", { text: "WhatsApp & branches" }),
      field("WhatsApp number (general contact)", whatsappInput),
      field("Order WhatsApp number (checkout sends orders here)", orderWhatsappInput, "Leave blank to use the same number as above."),
      branchesWrap,
      addBranchBtn,
      btn,
      errorEl,
    ]);
  }

  function buildImagesSection(bottleImage, beforeAfter) {
    const bottleField = createImageField({ label: "Bottle image", initialValue: bottleImage, siteUrl: state.siteUrl });
    const himField = createImageField({ label: "Before/after — him", initialValue: beforeAfter.him ?? "", siteUrl: state.siteUrl });
    const herField = createImageField({ label: "Before/after — her", initialValue: beforeAfter.her ?? "", siteUrl: state.siteUrl });

    const { btn: bottleBtn, errorEl: bottleError } = saveButton("Save bottle image", () =>
      apiPut("/api/admin/settings/bottleImage", { value: bottleField.getValue() })
    );
    const { btn: baBtn, errorEl: baError } = saveButton("Save before/after images", () =>
      apiPut("/api/admin/settings/beforeAfterImages", { value: { him: himField.getValue(), her: herField.getValue() } })
    );

    return h("section", { class: "card" }, [
      h("h2", { text: "Site images" }),
      bottleField.element,
      bottleBtn,
      bottleError,
      h("hr"),
      himField.element,
      herField.element,
      baBtn,
      baError,
    ]);
  }

  function buildBrandSection(initial) {
    const journeyField = createImageField({ label: "Journey image (About page)", initialValue: initial.journeyImage ?? "", siteUrl: state.siteUrl });
    const values = (initial.brandValues ?? []).map((v) => ({ ...v }));
    const craft = (initial.brandCraft ?? []).map((v) => ({ ...v }));

    function buildPairList(list, heading) {
      const wrap = h("div");
      function draw() {
        clear(wrap);
        list.forEach((entry, index) => {
          const titleInput = h("input", { type: "text", value: entry.title ?? "" });
          const bodyInput = h("textarea", { text: entry.body ?? "" });
          titleInput.addEventListener("input", () => (entry.title = titleInput.value));
          bodyInput.addEventListener("input", () => (entry.body = bodyInput.value));
          const removeBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Remove", onclick: () => { list.splice(index, 1); draw(); } });
          wrap.appendChild(h("div", { class: "card" }, [field("Title", titleInput), field("Body", bodyInput), removeBtn]));
        });
      }
      draw();
      const addBtn = h("button", { type: "button", class: "btn btn-secondary", text: `Add ${heading}`, onclick: () => { list.push({ title: "", body: "" }); draw(); } });
      return { wrap, addBtn };
    }

    const valuesList = buildPairList(values, "value");
    const craftList = buildPairList(craft, "craft point");

    const { btn, errorEl } = saveButton("Save brand section", () =>
      apiPut("/api/admin/settings/brand", {
        value: {
          journeyImage: journeyField.getValue(),
          brandValues: values.filter((v) => v.title && v.body),
          brandCraft: craft.filter((v) => v.title && v.body),
        },
      })
    );

    return h("section", { class: "card" }, [
      h("h2", { text: "Brand (About page)" }),
      journeyField.element,
      h("h3", { text: "Brand values" }),
      valuesList.wrap,
      valuesList.addBtn,
      h("h3", { text: "Craft" }),
      craftList.wrap,
      craftList.addBtn,
      btn,
      errorEl,
    ]);
  }

  function buildNavSection(initial) {
    const primaryNavStart = (initial.primaryNavStart ?? []).map((l) => ({ ...l }));
    const primaryNavEnd = (initial.primaryNavEnd ?? []).map((l) => ({ ...l }));
    const groups = (initial.brandImpressionsGroups ?? []).map((g) => ({ title: g.title, links: g.links.map((l) => ({ ...l })) }));

    function buildLinkList(links) {
      const wrap = h("div");
      function draw() {
        clear(wrap);
        links.forEach((link, index) => {
          const labelInput = h("input", { type: "text", value: link.label ?? "", placeholder: "Label" });
          const hrefInput = h("input", { type: "text", value: link.href ?? "", placeholder: "/path" });
          labelInput.addEventListener("input", () => (link.label = labelInput.value));
          hrefInput.addEventListener("input", () => (link.href = hrefInput.value));
          const removeBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Remove", onclick: () => { links.splice(index, 1); draw(); } });
          wrap.appendChild(h("div", { class: "toolbar" }, [field("Label", labelInput), field("Link", hrefInput), removeBtn]));
        });
      }
      draw();
      const addBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Add link", onclick: () => { links.push({ label: "", href: "" }); draw(); } });
      return { wrap, addBtn };
    }

    const startList = buildLinkList(primaryNavStart);
    const endList = buildLinkList(primaryNavEnd);

    const groupsWrap = h("div");
    function drawGroups() {
      clear(groupsWrap);
      groups.forEach((group, index) => {
        const titleInput = h("input", { type: "text", value: group.title ?? "" });
        titleInput.addEventListener("input", () => (group.title = titleInput.value));
        const linkList = buildLinkList(group.links);
        const removeGroupBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Remove group", onclick: () => { groups.splice(index, 1); drawGroups(); } });
        groupsWrap.appendChild(h("div", { class: "card" }, [field("Group title", titleInput), linkList.wrap, linkList.addBtn, removeGroupBtn]));
      });
    }
    drawGroups();
    const addGroupBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Add nav group", onclick: () => { groups.push({ title: "", links: [] }); drawGroups(); } });

    const { btn, errorEl } = saveButton("Save navigation", () =>
      apiPut("/api/admin/settings/nav", {
        value: {
          primaryNavStart: primaryNavStart.filter((l) => l.label && l.href),
          primaryNavEnd: primaryNavEnd.filter((l) => l.label && l.href),
          brandImpressionsGroups: groups
            .filter((g) => g.title)
            .map((g) => ({ title: g.title, links: g.links.filter((l) => l.label && l.href) })),
        },
      })
    );

    return h("section", { class: "card" }, [
      h("h2", { text: "Navigation" }),
      h("h3", { text: "Primary nav — start" }),
      startList.wrap,
      startList.addBtn,
      h("h3", { text: "Primary nav — end" }),
      endList.wrap,
      endList.addBtn,
      h("h3", { text: "Brand / impressions groups" }),
      groupsWrap,
      addGroupBtn,
      btn,
      errorEl,
    ]);
  }
}
