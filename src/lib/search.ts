import type { Collection, Product } from "@/lib/types";

/**
 * Search runs entirely in the browser against the catalog the page was
 * rendered with (from the CRM, via SiteDataProvider) — no network call. The
 * index is built once per catalog and reused.
 */
export type SearchResult = {
  product: Product;
  collection: Pick<Collection, "handle" | "title">;
};

type SearchIndex = { entries: SearchResult[]; haystacks: Map<string, string> };

const indexes = new WeakMap<Collection[], SearchIndex>();

/** Every product once, tagged with the collection it belongs to, plus its match text. */
function indexFor(collections: Collection[]): SearchIndex {
  const cached = indexes.get(collections);
  if (cached) return cached;
  const entries: SearchResult[] = collections.flatMap((collection) =>
    collection.products.map((product) => ({
      product,
      collection: { handle: collection.handle, title: collection.title },
    })),
  );
  const haystacks = new Map<string, string>(
    entries.map((entry) => [
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
  const index = { entries, haystacks };
  indexes.set(collections, index);
  return index;
}

/** Lowercased, punctuation-stripped text so "oud-ul shams" matches "Oud Ul Shams". */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

// A title hit is what the searcher almost always means, so it outranks a
// match buried in a description; a match at the very start of the title
// ("oud" -> "Oud Wood") outranks one in the middle ("Mukhalat Oud").
function scoreTerm(entry: SearchResult, term: string, haystacks: Map<string, string>): number {
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
export function searchProducts(collections: Collection[], query: string, limit?: number): SearchResult[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (terms.length === 0) return [];

  const scored: { entry: SearchResult; score: number }[] = [];

  const { entries, haystacks } = indexFor(collections);
  for (const entry of entries) {
    let total = 0;
    for (const term of terms) {
      const score = scoreTerm(entry, term, haystacks);
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
