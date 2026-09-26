import { listCollectionsRaw, mapCollection } from "./collectionsRepo.js";
import { listProductsForSite, mapProduct } from "./productsRepo.js";
import { listAllVariantsGrouped } from "./productVariantsRepo.js";
import { getFeaturedProduct, mapFeatured } from "./featuredRepo.js";
import { listLookGroupsForSite } from "./lookRepo.js";
import { getAllSettings } from "./settingsRepo.js";
import { toAbsoluteImage } from "../services/imageUrl.js";

function withAbsoluteImage(obj, key) {
  if (obj[key]) obj[key] = toAbsoluteImage(obj[key]);
  return obj;
}

export async function getSitePayload() {
  const [collectionRows, productRows, variantsByProduct, featured, lookGroups, settings] = await Promise.all([
    listCollectionsRaw(),
    listProductsForSite(),
    listAllVariantsGrouped(),
    getFeaturedProduct(),
    listLookGroupsForSite(),
    getAllSettings(),
  ]);

  const collections = collectionRows.map((row) => {
    const collection = withAbsoluteImage(mapCollection(row), "heroImage");
    collection.products = productRows
      .filter((p) => p.collection_id === row.id)
      .map((p) => withAbsoluteImage(mapProduct(p, variantsByProduct.get(p.id) ?? []), "image"));
    return collection;
  });

  const featuredProduct = featured.product
    ? withAbsoluteImage(mapFeatured(featured.product, featured.variants), "image")
    : null;

  const shopTheLookGroups = lookGroups.map((group) => {
    const mapped = { ...group };
    if (mapped.image) mapped.image = toAbsoluteImage(mapped.image);
    mapped.items = mapped.items.map((item) => {
      const copy = { ...item };
      if (copy.image) copy.image = toAbsoluteImage(copy.image);
      return copy;
    });
    return mapped;
  });

  const beforeAfterImages = settings.beforeAfterImages
    ? {
        him: toAbsoluteImage(settings.beforeAfterImages.him),
        her: toAbsoluteImage(settings.beforeAfterImages.her),
      }
    : undefined;

  const brand = settings.brand
    ? { ...settings.brand, journeyImage: toAbsoluteImage(settings.brand.journeyImage) }
    : undefined;

  const content = settings.content
    ? {
        ...settings.content,
        home: {
          ...settings.content.home,
          hero: {
            ...settings.content.home.hero,
            videoSrc: toAbsoluteImage(settings.content.home.hero.videoSrc),
            posterSrc: toAbsoluteImage(settings.content.home.hero.posterSrc),
          },
        },
      }
    : undefined;

  return {
    collections,
    featuredProduct,
    shopTheLookGroups,
    beforeAfterImages,
    bottleImage: settings.bottleImage ? toAbsoluteImage(settings.bottleImage) : undefined,
    brand,
    contact: settings.contact,
    nav: settings.nav,
    announcements: settings.announcements ?? [],
    freeShippingThreshold: settings.freeShippingThreshold ?? 0,
    content,
    updatedAt: settings.updatedAt ?? new Date().toISOString(),
  };
}
