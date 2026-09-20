import { collections } from "@/data/products";
import type { Collection, Product } from "@/lib/types";

/**
 * Search runs entirely in the browser against the static product data in
 * `src/data/products.ts` — there is no backend and no network call. If a
 * real search API is added later, only `searchProducts` needs to change;
 * its callers already treat it as "query in, ranked products out".
 */
export type SearchResult = {
  product: Product;
  collection: Pick<Collection, "handle" | "title">;
};

/** Every product once, tagged with the collection it belongs to. */
const searchIndex: SearchResult[] = collections.flatMap((collection) =>
  collection.products.map((product) => ({
    product,
    collection: { handle: collection.handle, title: collection.title },
  })),
);

/** Lowercased, punctuation-stripped text so "oud-ul shams" matches "Oud Ul Shams". */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** The text a result can match on, built once per product. */
const haystacks = new Map<string, string>(
  searchIndex.map((entry) => [
    entry.product.id,
    normalize(
      [
        entry.product.title,
        entry.product.handle,
        entry.product.kicker,
        entry.product.description,
        entry.product.gender,
        entry.collection.title,
      ]
        .filter(Boolean)
        .join(" "),
    ),
  ]),
);

// A title hit is what the searcher almost always means, so it outranks a
// match buried in a description; a match at the very start of the title
// ("oud" -> "Oud Wood") outranks one in the middle ("Mukhalat Oud").
function scoreTerm(entry: SearchResult, term: string): number {
  const title = normalize(entry.product.title);
  if (title === term) return 100;
  if (title.startsWith(term)) return 60;
  if (title.includes(term)) return 40;
  if (normalize(entry.collection.title).includes(term)) return 20;
  return haystacks.get(entry.product.id)?.includes(term) ? 10 : 0;
}

/**
 * Ranked matches for `query`. Multi-word queries are treated as AND — every
 * term must match somewhere — so "premium oud" narrows rather than widens.
 * An empty query returns nothing (the caller decides what to show instead).
 */
export function searchProducts(query: string, limit?: number): SearchResult[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (terms.length === 0) return [];

  const scored: { entry: SearchResult; score: number }[] = [];

  for (const entry of searchIndex) {
    let total = 0;
    for (const term of terms) {
      const score = scoreTerm(entry, term);
      if (score === 0) {
        total = 0;
        break;
      }
      total += score;
    }
    if (total > 0) scored.push({ entry, score: total });
  }

  scored.sort(
    (a, b) => b.score - a.score || a.entry.product.title.localeCompare(b.entry.product.title),
  );

  const ranked = scored.map((s) => s.entry);
  return limit ? ranked.slice(0, limit) : ranked;
}
