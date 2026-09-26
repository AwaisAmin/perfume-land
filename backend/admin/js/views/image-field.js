import { h } from "../dom.js";
import { apiUpload } from "../api.js";
import { showError } from "../toast.js";

// A field that lets the admin either type an existing site-relative
// image/video path or upload a new file. Previews are resolved against the
// website origin so relative paths render correctly.
//   kind: "image" (default) or "video" — controls the accepted file types,
//   the preview element (<img> vs muted <video controls>), and hint text.
export function createImageField({ label, initialValue = "", siteUrl, kind = "image" }) {
  let value = initialValue || "";
  const isVideo = kind === "video";

  const preview = isVideo
    ? h("video", { class: "image-preview", controls: true, muted: true, playsinline: true })
    : h("img", { class: "image-preview", alt: "" });
  const pathInput = h("input", {
    type: "text",
    value,
    placeholder: isVideo ? "/videos/example.mp4" : "/products/example.webp",
  });
  const fileInput = h("input", {
    type: "file",
    accept: isVideo ? "video/mp4,video/webm" : "image/png,image/jpeg,image/webp",
  });
  const status = h("p", { class: "field-hint" });

  function resolvePreviewUrl(v) {
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    return `${siteUrl}${v}`;
  }

  function updatePreview() {
    const url = resolvePreviewUrl(value);
    if (url) {
      preview.src = url;
      preview.style.display = "block";
    } else {
      preview.style.display = "none";
    }
  }

  pathInput.addEventListener("input", () => {
    value = pathInput.value.trim();
    updatePreview();
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    status.textContent = "Uploading…";
    try {
      const res = await apiUpload(file);
      value = res.path;
      pathInput.value = value;
      status.textContent = "Uploaded.";
      updatePreview();
    } catch (err) {
      showError(err);
      status.textContent = "Upload failed.";
    } finally {
      fileInput.value = "";
    }
  });

  updatePreview();

  const hint = isVideo
    ? "Type an existing video path, or choose an MP4/WEBM file below to upload a new one (max 30MB)."
    : "Type an existing image path, or choose a file below to upload a new one (max 5MB).";

  const wrap = h("div", { class: "field" }, [
    h("label", { text: label }),
    pathInput,
    h("p", { class: "field-hint", text: hint }),
    fileInput,
    status,
    preview,
  ]);

  return {
    element: wrap,
    getValue: () => value,
  };
}
