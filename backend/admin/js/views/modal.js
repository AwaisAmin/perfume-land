import { h } from "../dom.js";

export function openModal(title, contentEl) {
  const backdrop = h("div", { class: "modal-backdrop", role: "dialog", "aria-modal": "true", "aria-label": title });
  const closeBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Close" });
  const modal = h("div", { class: "modal" }, [h("h2", { text: title }), contentEl, h("div", { style: "margin-top:1rem" }, [closeBtn])]);

  function close() {
    backdrop.remove();
    document.removeEventListener("keydown", onKeydown);
  }
  function onKeydown(e) {
    if (e.key === "Escape") close();
  }
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  document.addEventListener("keydown", onKeydown);

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  const firstInput = modal.querySelector("input, textarea, select, button");
  if (firstInput) firstInput.focus();
  return { close };
}
