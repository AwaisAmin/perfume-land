import { z } from "zod";
import { siteHrefSchema, imagePathSchema, videoPathSchema, externalHttpsLinkSchema } from "./validators.js";

const nonEmpty = (label) => z.string().trim().min(1, `${label} is required.`);
const list = (schema) => z.array(schema);

// A link that must stay on this site (menus, CTAs, "read more" links etc.).
const linkSchema = z.object({ label: nonEmpty("Label"), href: siteHrefSchema });

const columnItemSchema = z.object({ title: nonEmpty("Title"), body: nonEmpty("Body") });

const SOCIAL_PLATFORMS = ["instagram", "youtube", "tiktok", "facebook", "whatsapp"];
const TRUST_BADGE_ICONS = ["truck", "headphones", "shield"];

// Each social platform's href must point at that platform's real domain
// (including common subdomains like www./m.) — not just any https URL.
const SOCIAL_PLATFORM_HOSTS = {
  instagram: ["instagram.com"],
  youtube: ["youtube.com", "youtu.be"],
  tiktok: ["tiktok.com"],
  facebook: ["facebook.com"],
  whatsapp: ["wa.me", "whatsapp.com"],
};

function hostnameAllowed(hostname, allowedBases) {
  return allowedBases.some((base) => hostname === base || hostname.endsWith(`.${base}`));
}

// WhatsApp's href is ignored by the site (it always links to the shop's
// WhatsApp number instead), so it alone is allowed to be blank.
const socialLinkSchema = z
  .object({
    platform: z.enum(SOCIAL_PLATFORMS),
    label: nonEmpty("Label"),
    href: z.string().trim(),
  })
  .superRefine((link, ctx) => {
    if (link.platform === "whatsapp" && !link.href) return; // allowed blank
    const httpsCheck = externalHttpsLinkSchema().safeParse(link.href);
    if (!httpsCheck.success) {
      ctx.addIssue({ code: "custom", path: ["href"], message: "Link must be a valid https:// URL." });
      return;
    }
    const hostname = new URL(link.href).hostname;
    const allowedBases = SOCIAL_PLATFORM_HOSTS[link.platform] ?? [];
    if (!hostnameAllowed(hostname, allowedBases)) {
      ctx.addIssue({
        code: "custom",
        path: ["href"],
        message: `Link must be on ${allowedBases.join(" or ")} for ${link.platform}.`,
      });
    }
  });

export const contentSchema = z.object({
  seo: z.object({ title: nonEmpty("Title"), description: nonEmpty("Description") }),

  header: z.object({
    currencyCode: nonEmpty("Currency code"),
    currencySymbol: nonEmpty("Currency symbol"),
    brandImpressionsLabel: nonEmpty("Label"),
    searchPlaceholder: nonEmpty("Search placeholder"),
    viewAllResults: nonEmpty("View all results label"),
  }),

  home: z.object({
    hero: z.object({
      videoSrc: videoPathSchema,
      posterSrc: imagePathSchema,
      ctaLabel: nonEmpty("CTA label"),
      ctaHref: siteHrefSchema,
    }),
    marqueeGold: nonEmpty("Marquee text"),
    marqueeForest: nonEmpty("Marquee text"),
    viewAllLabel: nonEmpty("View all label"),
    mediaGrid: z.object({ heading: nonEmpty("Heading"), items: list(linkSchema) }),
    shopTheLook: z.object({ kicker: nonEmpty("Kicker"), heading: nonEmpty("Heading"), buttonLabel: nonEmpty("Button label") }),
    beforeAfter: z.object({
      him: z.object({ label: nonEmpty("Label"), buttonLabel: nonEmpty("Button label"), href: siteHrefSchema }),
      her: z.object({ label: nonEmpty("Label"), buttonLabel: nonEmpty("Button label"), href: siteHrefSchema }),
    }),
    featuredProduct: z.object({
      kicker: nonEmpty("Kicker"),
      heading: nonEmpty("Heading"),
      sizeLabel: nonEmpty("Size label"),
      addToCart: nonEmpty("Add to cart label"),
    }),
    aboutValues: z.object({ heading: nonEmpty("Heading"), intro: list(z.string().trim().min(1)) }),
    newsletter: z.object({
      kicker: nonEmpty("Kicker"),
      heading: nonEmpty("Heading"),
      body: nonEmpty("Body"),
      emailLabel: nonEmpty("Email label"),
      emailPlaceholder: nonEmpty("Email placeholder"),
      submit: nonEmpty("Submit label"),
      submitted: nonEmpty("Submitted message"),
    }),
  }),

  contactForm: z.object({
    kicker: nonEmpty("Kicker"),
    title: nonEmpty("Title"),
    description: nonEmpty("Description"),
    nameLabel: nonEmpty("Name label"),
    emailLabel: nonEmpty("Email label"),
    messageLabel: nonEmpty("Message label"),
    submit: nonEmpty("Submit label"),
    submitted: nonEmpty("Submitted message"),
  }),

  trustBadges: list(
    z.object({
      icon: z.enum(TRUST_BADGE_ICONS),
      title: nonEmpty("Title"),
      description: nonEmpty("Description"),
      whatsappLinkLabel: z.string().trim(),
    })
  ),

  footer: z.object({
    kicker: nonEmpty("Kicker"),
    heading: nonEmpty("Heading"),
    body: nonEmpty("Body"),
    ctaLabel: nonEmpty("CTA label"),
    brandName: nonEmpty("Brand name"),
    about: nonEmpty("About text"),
    motto: nonEmpty("Motto"),
    socialLinks: list(socialLinkSchema),
    exploreHeading: nonEmpty("Heading"),
    exploreLinksStart: list(linkSchema),
    exploreLinksEnd: list(linkSchema),
    shopAll: linkSchema,
    helpHeading: nonEmpty("Heading"),
    helpLinks: list(linkSchema),
    helpWhatsappLinks: list(z.string().trim().min(1)),
    countersHeading: nonEmpty("Heading"),
    directionsLabel: nonEmpty("Directions label"),
    whatsappCaption: nonEmpty("WhatsApp caption"),
    copyright: nonEmpty("Copyright text"),
    marketLabel: nonEmpty("Market label"),
    creditPrefix: nonEmpty("Credit prefix"),
    credit: z.object({ label: nonEmpty("Label"), href: externalHttpsLinkSchema() }),
  }),

  about: z.object({
    imageAlt: nonEmpty("Image alt text"),
    kicker: nonEmpty("Kicker"),
    heading: nonEmpty("Heading"),
    paragraphs: list(z.string().trim().min(1)),
    closing: nonEmpty("Closing line"),
    whatWeDoKicker: nonEmpty("Kicker"),
    whatWeDoHeading: nonEmpty("Heading"),
    whatWeDoIntro: list(z.string().trim().min(1)),
  }),

  contactPage: z.object({
    kicker: nonEmpty("Kicker"),
    title: nonEmpty("Title"),
    descriptionStart: nonEmpty("Description"),
    link: linkSchema,
    descriptionEnd: nonEmpty("Description"),
  }),

  collections: z.object({ productSingular: nonEmpty("Singular label"), productPlural: nonEmpty("Plural label") }),

  search: z.object({
    metaTitle: nonEmpty("Meta title"),
    heading: nonEmpty("Heading"),
    resultSingular: nonEmpty("Singular label"),
    resultPlural: nonEmpty("Plural label"),
    countTemplate: nonEmpty("Count template"),
    emptyPrompt: nonEmpty("Empty prompt"),
    noResults: nonEmpty("No results message"),
  }),

  productCard: z.object({ fromPrefix: nonEmpty("'From' prefix"), quickAdd: nonEmpty("Quick add label") }),

  collectionPage: z.object({
    availabilityHeading: nonEmpty("Availability heading"),
    inStockOnly: nonEmpty("'In stock only' label"),
    priceHeading: nonEmpty("Price heading"),
    priceRangeSeparator: nonEmpty("Price range separator"),
    minPriceLabel: nonEmpty("Minimum price label"),
    maxPriceLabel: nonEmpty("Maximum price label"),
    fromPriceLabel: nonEmpty("'From' price label"),
    toPriceLabel: nonEmpty("'To' price label"),
    genderHeading: nonEmpty("Gender heading"),
    genders: z.object({ unisex: nonEmpty("Unisex label"), women: nonEmpty("Women label"), men: nonEmpty("Men label") }),
    sortBy: nonEmpty("'Sort by' label"),
    sortOptions: z.object({
      featured: nonEmpty("Featured label"),
      titleAsc: nonEmpty("Title A-Z label"),
      titleDesc: nonEmpty("Title Z-A label"),
      priceAsc: nonEmpty("Price low-high label"),
      priceDesc: nonEmpty("Price high-low label"),
    }),
    productSingular: nonEmpty("Singular label"),
    productPlural: nonEmpty("Plural label"),
    layoutLarge: nonEmpty("Large layout label"),
    layoutMedium: nonEmpty("Medium layout label"),
    layoutCompact: nonEmpty("Compact layout label"),
    noMatches: nonEmpty("No matches message"),
  }),

  product: z.object({
    inStockTemplate: nonEmpty("In-stock template"),
    soldOut: nonEmpty("Sold out label"),
    sizeLabel: nonEmpty("Size label"),
    typeLabel: nonEmpty("Type label"),
    addToCart: nonEmpty("Add to cart label"),
    relatedHeading: nonEmpty("Related products heading"),
  }),

  cart: z.object({
    title: nonEmpty("Title"),
    freeShippingRemaining: nonEmpty("Free shipping remaining message"),
    freeShippingReached: nonEmpty("Free shipping reached message"),
    empty: nonEmpty("Empty cart message"),
    remove: nonEmpty("Remove label"),
    taxesNote: nonEmpty("Taxes note"),
    checkout: nonEmpty("Checkout label"),
  }),

  checkout: z.object({
    heading: nonEmpty("Heading"),
    intro: nonEmpty("Intro"),
    nameLabel: nonEmpty("Name label"),
    phoneLabel: nonEmpty("Phone label"),
    cityLabel: nonEmpty("City label"),
    addressLabel: nonEmpty("Address label"),
    noteLabel: nonEmpty("Note label"),
    optionalHint: nonEmpty("Optional hint"),
    requiredError: nonEmpty("Required error"),
    phoneError: nonEmpty("Phone error"),
    back: nonEmpty("Back label"),
    submit: nonEmpty("Submit label"),
    sentHeading: nonEmpty("Sent heading"),
    sentBody: nonEmpty("Sent body"),
    clearCart: nonEmpty("Clear cart label"),
    keepCart: nonEmpty("Keep cart label"),
    messageHeading: nonEmpty("Message heading"),
    messageSubtotal: nonEmpty("Subtotal label"),
    messageFreeDelivery: nonEmpty("Free delivery label"),
    messageDeliveryNote: nonEmpty("Delivery note template"),
    messageCustomer: nonEmpty("Customer label"),
  }),

  floatingChat: z.object({ title: nonEmpty("Title"), greeting: nonEmpty("Greeting") }),
});
