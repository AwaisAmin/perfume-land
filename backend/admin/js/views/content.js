import { h, clear } from "../dom.js";
import { apiGet, apiPut, ApiError } from "../api.js";
import { showToast } from "../toast.js";
import { createImageField } from "./image-field.js";

const SOCIAL_PLATFORMS = ["instagram", "youtube", "tiktok", "facebook", "whatsapp"];
const TRUST_BADGE_ICONS = ["truck", "headphones", "shield"];

function field(label, input, hint) {
  return h("div", { class: "field" }, [h("label", { text: label }), input, hint ? h("p", { class: "field-hint", text: hint }) : null]);
}

// A single-line text field bound directly to `obj[key]`.
function textField(obj, key, label, hint) {
  const input = h("input", { type: "text", value: obj[key] ?? "" });
  input.addEventListener("input", () => (obj[key] = input.value));
  return field(label, input, hint);
}

function textAreaField(obj, key, label, hint) {
  const input = h("textarea", { text: obj[key] ?? "" });
  input.addEventListener("input", () => (obj[key] = input.value));
  return field(label, input, hint);
}

// A repeatable list of plain strings (e.g. paragraphs, intro lines).
function stringListEditor(list, label) {
  const wrap = h("div");
  function draw() {
    clear(wrap);
    list.forEach((value, index) => {
      const input = h("textarea", { text: value });
      input.addEventListener("input", () => (list[index] = input.value));
      const removeBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Remove", onclick: () => { list.splice(index, 1); draw(); } });
      wrap.appendChild(h("div", { class: "toolbar" }, [field(`${label} ${index + 1}`, input), removeBtn]));
    });
  }
  draw();
  const addBtn = h("button", { type: "button", class: "btn btn-secondary", text: `Add ${label.toLowerCase()}`, onclick: () => { list.push(""); draw(); } });
  return h("div", {}, [wrap, addBtn]);
}

// An ordered list of collection handles, each picked from a dropdown.
function collectionPicker(list, collections) {
  const wrap = h("div");
  function draw() {
    clear(wrap);
    list.forEach((handle, index) => {
      const select = h(
        "select",
        {},
        collections.map((c) => h("option", { value: c.handle, text: c.title, selected: c.handle === handle }))
      );
      select.addEventListener("change", () => (list[index] = select.value));
      const removeBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Remove", onclick: () => { list.splice(index, 1); draw(); } });
      wrap.appendChild(h("div", { class: "toolbar" }, [field(`Collection ${index + 1}`, select), removeBtn]));
    });
  }
  draw();
  const addBtn = h("button", {
    type: "button",
    class: "btn btn-secondary",
    text: "Add collection",
    onclick: () => { list.push(collections[0]?.handle ?? ""); draw(); },
  });
  return h("div", {}, [wrap, addBtn]);
}

// A repeatable list of {label, href} links.
function linkListEditor(list) {
  const wrap = h("div");
  function draw() {
    clear(wrap);
    list.forEach((link, index) => {
      const labelInput = h("input", { type: "text", value: link.label ?? "", placeholder: "Label" });
      const hrefInput = h("input", { type: "text", value: link.href ?? "", placeholder: "/path" });
      labelInput.addEventListener("input", () => (link.label = labelInput.value));
      hrefInput.addEventListener("input", () => (link.href = hrefInput.value));
      const removeBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Remove", onclick: () => { list.splice(index, 1); draw(); } });
      wrap.appendChild(h("div", { class: "toolbar" }, [field("Label", labelInput), field("Link (starts with /)", hrefInput), removeBtn]));
    });
  }
  draw();
  const addBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Add link", onclick: () => { list.push({ label: "", href: "" }); draw(); } });
  return h("div", {}, [wrap, addBtn]);
}

// A repeatable list of {title, body} items.
function pairListEditor(list) {
  const wrap = h("div");
  function draw() {
    clear(wrap);
    list.forEach((item, index) => {
      const titleInput = h("input", { type: "text", value: item.title ?? "" });
      const bodyInput = h("textarea", { text: item.body ?? "" });
      titleInput.addEventListener("input", () => (item.title = titleInput.value));
      bodyInput.addEventListener("input", () => (item.body = bodyInput.value));
      const removeBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Remove", onclick: () => { list.splice(index, 1); draw(); } });
      wrap.appendChild(h("div", { class: "card" }, [field("Title", titleInput), field("Body", bodyInput), removeBtn]));
    });
  }
  draw();
  const addBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Add item", onclick: () => { list.push({ title: "", body: "" }); draw(); } });
  return h("div", {}, [wrap, addBtn]);
}

export async function renderSiteContent({ state }) {
  const { settings } = await apiGet("/api/admin/settings");
  // One shared mutable draft: every section's Save button submits this whole
  // object, since the backend validates+stores `content` as a single key.
  const content = structuredClone(settings.content);
  const { collections: allCollections } = await apiGet("/api/admin/collections");
  // Older saved content has no list yet — start from the site's default four.
  content.collections.indexHandles ??= ["exclusive-collection", "standard-collection", "premium-collection", "signature-collection"];

  const root = h("div", {}, [
    h("h1", { text: "Site content" }),
    h("p", { class: "field-hint", text: "Every text and media item on the storefront that isn't a product. Each section below saves independently." }),
  ]);

  function saveSection(label, beforeSave) {
    const errorEl = h("p", { class: "field-error", role: "alert" });
    const btn = h("button", {
      type: "button",
      class: "btn btn-primary",
      text: label,
      onclick: async () => {
        // Fields that keep their own state (image/video pickers) sync into the draft first.
        beforeSave?.();
        errorEl.textContent = "";
        btn.setAttribute("disabled", "true");
        try {
          await apiPut("/api/admin/settings/content", { value: content });
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

  function section(title, children, saveLabel = "Save section", beforeSave) {
    const { btn, errorEl } = saveSection(saveLabel, beforeSave);
    return h("section", { class: "card" }, [h("h2", { text: title }), ...children, btn, errorEl]);
  }

  // --- SEO ---------------------------------------------------------------
  root.appendChild(
    section("SEO", [textField(content.seo, "title", "Page title"), textAreaField(content.seo, "description", "Meta description")])
  );

  // --- Header --------------------------------------------------------
  root.appendChild(
    section("Header", [
      textField(content.header, "currencyCode", "Currency code"),
      textField(content.header, "currencySymbol", "Currency symbol"),
      textField(content.header, "brandImpressionsLabel", "\"Brand Impressions\" menu label"),
      textField(content.header, "searchPlaceholder", "Search box placeholder"),
      textField(content.header, "viewAllResults", "\"View all results\" label"),
    ])
  );

  // --- Home: hero ------------------------------------------------------
  const heroVideoField = createImageField({ label: "Hero video", initialValue: content.home.hero.videoSrc, siteUrl: state.siteUrl, kind: "video" });
  const heroPosterField = createImageField({ label: "Hero poster image", initialValue: content.home.hero.posterSrc, siteUrl: state.siteUrl });
  root.appendChild(
    section(
      "Home — hero",
      [
        heroVideoField.element,
        heroPosterField.element,
        textField(content.home.hero, "ctaLabel", "Button label"),
        textField(content.home.hero, "ctaHref", "Button link (starts with /)"),
      ],
      "Save hero",
      () => {
        content.home.hero.videoSrc = heroVideoField.getValue();
        content.home.hero.posterSrc = heroPosterField.getValue();
      }
    )
  );

  // --- Home: marquees & section headings --------------------------------
  root.appendChild(
    section("Home — marquees & sections", [
      textField(content.home, "marqueeGold", "Marquee text (gold)"),
      textField(content.home, "marqueeForest", "Marquee text (forest)"),
      textField(content.home, "viewAllLabel", "\"View all\" label"),
      textField(content.home.mediaGrid, "heading", "Media grid heading"),
      h("h3", { text: "Media grid links" }),
      linkListEditor(content.home.mediaGrid.items),
      textField(content.home.shopTheLook, "kicker", "Shop-the-look kicker"),
      textField(content.home.shopTheLook, "heading", "Shop-the-look heading"),
      textField(content.home.shopTheLook, "buttonLabel", "Shop-the-look button label"),
      h("h3", { text: "Before / after — him" }),
      textField(content.home.beforeAfter.him, "label", "Label"),
      textField(content.home.beforeAfter.him, "buttonLabel", "Button label"),
      textField(content.home.beforeAfter.him, "href", "Link (starts with /)"),
      h("h3", { text: "Before / after — her" }),
      textField(content.home.beforeAfter.her, "label", "Label"),
      textField(content.home.beforeAfter.her, "buttonLabel", "Button label"),
      textField(content.home.beforeAfter.her, "href", "Link (starts with /)"),
      h("h3", { text: "Featured product section" }),
      textField(content.home.featuredProduct, "kicker", "Kicker"),
      textField(content.home.featuredProduct, "heading", "Heading"),
      textField(content.home.featuredProduct, "sizeLabel", "Size label"),
      textField(content.home.featuredProduct, "addToCart", "Add to cart label"),
      h("h3", { text: "About / values section" }),
      textField(content.home.aboutValues, "heading", "Heading"),
      stringListEditor(content.home.aboutValues.intro, "Intro paragraph"),
      h("h3", { text: "Newsletter" }),
      textField(content.home.newsletter, "kicker", "Kicker"),
      textField(content.home.newsletter, "heading", "Heading"),
      textAreaField(content.home.newsletter, "body", "Body"),
      textField(content.home.newsletter, "emailLabel", "Email label"),
      textField(content.home.newsletter, "emailPlaceholder", "Email placeholder"),
      textField(content.home.newsletter, "submit", "Submit label"),
      textField(content.home.newsletter, "submitted", "Submitted message"),
    ])
  );

  // --- Trust badges --------------------------------------------------
  const badgesWrap = h("div");
  function drawBadges() {
    clear(badgesWrap);
    content.trustBadges.forEach((badge, index) => {
      const iconSelect = h("select", {}, TRUST_BADGE_ICONS.map((icon) => h("option", { value: icon, selected: badge.icon === icon, text: icon })));
      iconSelect.addEventListener("change", () => (badge.icon = iconSelect.value));
      const titleInput = h("input", { type: "text", value: badge.title ?? "" });
      titleInput.addEventListener("input", () => (badge.title = titleInput.value));
      const descInput = h("input", { type: "text", value: badge.description ?? "" });
      descInput.addEventListener("input", () => (badge.description = descInput.value));
      const whatsappLabelInput = h("input", { type: "text", value: badge.whatsappLinkLabel ?? "" });
      whatsappLabelInput.addEventListener("input", () => (badge.whatsappLinkLabel = whatsappLabelInput.value));
      const removeBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Remove", onclick: () => { content.trustBadges.splice(index, 1); drawBadges(); } });
      badgesWrap.appendChild(
        h("div", { class: "card" }, [
          field("Icon", iconSelect),
          field("Title", titleInput),
          field("Description", descInput),
          field("WhatsApp link label (optional)", whatsappLabelInput),
          removeBtn,
        ])
      );
    });
  }
  drawBadges();
  const addBadgeBtn = h("button", {
    type: "button",
    class: "btn btn-secondary",
    text: "Add trust badge",
    onclick: () => { content.trustBadges.push({ icon: "truck", title: "", description: "", whatsappLinkLabel: "" }); drawBadges(); },
  });
  root.appendChild(section("Trust badges", [badgesWrap, addBadgeBtn]));

  // --- Footer ----------------------------------------------------------
  const socialWrap = h("div");
  function drawSocial() {
    clear(socialWrap);
    content.footer.socialLinks.forEach((link, index) => {
      const platformSelect = h("select", {}, SOCIAL_PLATFORMS.map((p) => h("option", { value: p, selected: link.platform === p, text: p })));
      platformSelect.addEventListener("change", () => (link.platform = platformSelect.value));
      const labelInput = h("input", { type: "text", value: link.label ?? "" });
      labelInput.addEventListener("input", () => (link.label = labelInput.value));
      const hrefInput = h("input", { type: "text", value: link.href ?? "" });
      hrefInput.addEventListener("input", () => (link.href = hrefInput.value));
      const removeBtn = h("button", { type: "button", class: "btn btn-secondary", text: "Remove", onclick: () => { content.footer.socialLinks.splice(index, 1); drawSocial(); } });
      socialWrap.appendChild(
        h("div", { class: "toolbar" }, [
          field("Platform", platformSelect),
          field("Label", labelInput),
          field("Link (https://, leave blank for WhatsApp)", hrefInput),
          removeBtn,
        ])
      );
    });
  }
  drawSocial();
  const addSocialBtn = h("button", {
    type: "button",
    class: "btn btn-secondary",
    text: "Add social link",
    onclick: () => { content.footer.socialLinks.push({ platform: "instagram", label: "", href: "" }); drawSocial(); },
  });

  root.appendChild(
    section("Footer", [
      textField(content.footer, "kicker", "Kicker"),
      textField(content.footer, "heading", "Heading"),
      textAreaField(content.footer, "body", "Body"),
      textField(content.footer, "ctaLabel", "CTA label"),
      textField(content.footer, "brandName", "Brand name"),
      textAreaField(content.footer, "about", "About text"),
      textField(content.footer, "motto", "Motto"),
      h("h3", { text: "Social links" }),
      socialWrap,
      addSocialBtn,
      textField(content.footer, "exploreHeading", "\"Explore\" heading"),
      h("h3", { text: "Explore links (start)" }),
      linkListEditor(content.footer.exploreLinksStart),
      h("h3", { text: "Explore links (end)" }),
      linkListEditor(content.footer.exploreLinksEnd),
      textField(content.footer.shopAll, "label", "\"Shop all\" label"),
      textField(content.footer.shopAll, "href", "\"Shop all\" link"),
      textField(content.footer, "helpHeading", "\"Help\" heading"),
      h("h3", { text: "Help links" }),
      linkListEditor(content.footer.helpLinks),
      h("h3", { text: "Help WhatsApp link labels" }),
      stringListEditor(content.footer.helpWhatsappLinks, "Label"),
      textField(content.footer, "countersHeading", "Branches heading"),
      textField(content.footer, "directionsLabel", "\"Get directions\" label"),
      textField(content.footer, "whatsappCaption", "WhatsApp caption"),
      textField(content.footer, "copyright", "Copyright text"),
      textField(content.footer, "marketLabel", "Market label"),
      textField(content.footer, "creditPrefix", "Credit prefix"),
      textField(content.footer.credit, "label", "Credit label"),
      textField(content.footer.credit, "href", "Credit link (https://)"),
    ])
  );

  // --- About page --------------------------------------------------
  root.appendChild(
    section("About page", [
      textField(content.about, "imageAlt", "Image alt text"),
      textField(content.about, "kicker", "Kicker"),
      textField(content.about, "heading", "Heading"),
      h("h3", { text: "Paragraphs" }),
      stringListEditor(content.about.paragraphs, "Paragraph"),
      textAreaField(content.about, "closing", "Closing line"),
      textField(content.about, "whatWeDoKicker", "\"What we do\" kicker"),
      textField(content.about, "whatWeDoHeading", "\"What we do\" heading"),
      h("h3", { text: "\"What we do\" intro" }),
      stringListEditor(content.about.whatWeDoIntro, "Paragraph"),
    ])
  );

  // --- Contact page + contact form ------------------------------------
  root.appendChild(
    section("Contact page", [
      textField(content.contactPage, "kicker", "Kicker"),
      textField(content.contactPage, "title", "Title"),
      textField(content.contactPage, "descriptionStart", "Description (before link)"),
      textField(content.contactPage.link, "label", "Link label"),
      textField(content.contactPage.link, "href", "Link (starts with /)"),
      textField(content.contactPage, "descriptionEnd", "Description (after link)"),
      h("h3", { text: "\"Suggest a fragrance\" form" }),
      textField(content.contactForm, "kicker", "Kicker"),
      textField(content.contactForm, "title", "Title"),
      textAreaField(content.contactForm, "description", "Description"),
      textField(content.contactForm, "nameLabel", "Name label"),
      textField(content.contactForm, "emailLabel", "Email label"),
      textField(content.contactForm, "messageLabel", "Message label"),
      textField(content.contactForm, "submit", "Submit label"),
      textField(content.contactForm, "submitted", "Submitted message"),
    ])
  );

  // --- Search --------------------------------------------------------
  root.appendChild(
    section("Search", [
      textField(content.search, "metaTitle", "Meta title"),
      textField(content.search, "heading", "Heading"),
      textField(content.search, "resultSingular", "Singular label"),
      textField(content.search, "resultPlural", "Plural label"),
      textField(content.search, "countTemplate", "Count template", "Placeholders: {count} {results} {query}"),
      textField(content.search, "emptyPrompt", "Empty prompt (no query yet)"),
      textField(content.search, "noResults", "No results message", "Placeholder: {query}"),
    ])
  );

  // --- Collection page ---------------------------------------------
  root.appendChild(
    section("Collection page", [
      h("h3", { text: "Collections shown on the /collections page (in this order)" }),
      collectionPicker(content.collections.indexHandles, allCollections),
      textField(content.collections, "productSingular", "Singular label (e.g. \"Product\")"),
      textField(content.collections, "productPlural", "Plural label (e.g. \"Products\")"),
      textField(content.collectionPage, "availabilityHeading", "Availability heading"),
      textField(content.collectionPage, "inStockOnly", "\"In stock only\" label"),
      textField(content.collectionPage, "priceHeading", "Price heading"),
      textField(content.collectionPage, "priceRangeSeparator", "Price range separator (e.g. \"to\")"),
      textField(content.collectionPage, "minPriceLabel", "Minimum price label"),
      textField(content.collectionPage, "maxPriceLabel", "Maximum price label"),
      textField(content.collectionPage, "fromPriceLabel", "\"From\" price label"),
      textField(content.collectionPage, "toPriceLabel", "\"To\" price label"),
      textField(content.collectionPage, "genderHeading", "Gender heading"),
      textField(content.collectionPage.genders, "unisex", "Gender option: Unisex"),
      textField(content.collectionPage.genders, "women", "Gender option: Women"),
      textField(content.collectionPage.genders, "men", "Gender option: Men"),
      textField(content.collectionPage, "sortBy", "\"Sort by\" label"),
      textField(content.collectionPage.sortOptions, "featured", "Sort option: Featured"),
      textField(content.collectionPage.sortOptions, "titleAsc", "Sort option: Title A-Z"),
      textField(content.collectionPage.sortOptions, "titleDesc", "Sort option: Title Z-A"),
      textField(content.collectionPage.sortOptions, "priceAsc", "Sort option: Price low to high"),
      textField(content.collectionPage.sortOptions, "priceDesc", "Sort option: Price high to low"),
      textField(content.collectionPage, "productSingular", "Singular label"),
      textField(content.collectionPage, "productPlural", "Plural label"),
      textField(content.collectionPage, "layoutLarge", "Large layout button label"),
      textField(content.collectionPage, "layoutMedium", "Medium layout button label"),
      textField(content.collectionPage, "layoutCompact", "Compact layout button label"),
      textField(content.collectionPage, "noMatches", "No matches message"),
    ])
  );

  // --- Product page ----------------------------------------------------
  root.appendChild(
    section("Product page", [
      textField(content.productCard, "fromPrefix", "\"From\" price prefix (product cards)"),
      textField(content.productCard, "quickAdd", "\"Quick add\" label (product cards)"),
      textField(content.product, "inStockTemplate", "In-stock template", "Placeholder: {count}"),
      textField(content.product, "soldOut", "Sold out label"),
      textField(content.product, "sizeLabel", "Size label"),
      textField(content.product, "typeLabel", "Type label"),
      textField(content.product, "addToCart", "Add to cart label"),
      textField(content.product, "relatedHeading", "Related products heading"),
    ])
  );

  // --- Cart & checkout ---------------------------------------------
  root.appendChild(
    section("Cart & checkout", [
      h("h3", { text: "Cart" }),
      textField(content.cart, "title", "Title"),
      textField(content.cart, "freeShippingRemaining", "Free shipping remaining", "Placeholder: {amount}"),
      textField(content.cart, "freeShippingReached", "Free shipping reached"),
      textField(content.cart, "empty", "Empty cart message"),
      textField(content.cart, "remove", "Remove label"),
      textField(content.cart, "taxesNote", "Taxes note"),
      textField(content.cart, "checkout", "Checkout button label"),
      h("h3", { text: "Checkout form" }),
      textField(content.checkout, "heading", "Heading"),
      textAreaField(content.checkout, "intro", "Intro"),
      textField(content.checkout, "nameLabel", "Name label"),
      textField(content.checkout, "phoneLabel", "Phone label"),
      textField(content.checkout, "cityLabel", "City label"),
      textField(content.checkout, "addressLabel", "Address label"),
      textField(content.checkout, "noteLabel", "Note label"),
      textField(content.checkout, "optionalHint", "Optional hint"),
      textField(content.checkout, "requiredError", "Required-field error"),
      textField(content.checkout, "phoneError", "Phone error"),
      textField(content.checkout, "back", "Back label"),
      textField(content.checkout, "submit", "Submit label"),
      textField(content.checkout, "sentHeading", "Sent heading"),
      textAreaField(content.checkout, "sentBody", "Sent body"),
      textField(content.checkout, "clearCart", "Clear cart label"),
      textField(content.checkout, "keepCart", "Keep cart label"),
      textField(content.checkout, "messageHeading", "WhatsApp message heading"),
      textField(content.checkout, "messageSubtotal", "Subtotal label"),
      textField(content.checkout, "messageFreeDelivery", "Free delivery label"),
      textField(content.checkout, "messageDeliveryNote", "Delivery note template", "Placeholder: {amount}"),
      textField(content.checkout, "messageCustomer", "Customer label"),
    ])
  );

  // --- Floating chat ---------------------------------------------------
  root.appendChild(section("Floating chat", [textField(content.floatingChat, "title", "Title"), textAreaField(content.floatingChat, "greeting", "Greeting")]));

  return root;
}
