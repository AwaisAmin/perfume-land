import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/lib/types";

/**
 * The "/collections" index page's card grid — a plain, page-agnostic list
 * of collections (image, title, product count), each linking to its own
 * `/collections/[handle]` page. Takes the collections to show as a prop
 * rather than importing the data itself, so this stays reusable if a
 * future page needs a different subset (e.g. "featured" vs "all").
 */
export default function CollectionsGrid({ collections }: { collections: Collection[] }) {
  return (
    <div className="py-10 lg:py-16">
      <div className="container-app">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.handle}`} className="group block">
              <div className="relative aspect-square overflow-hidden bg-cream-100">
                {collection.products[0]?.image && (
                  <Image
                    src={collection.products[0].image}
                    alt={collection.pageTitle ?? collection.title}
                    fill
                    className="object-contain p-6 sm:p-10 transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-width: 639px) 50vw, 25vw"
                  />
                )}
              </div>
              <div className="pt-5 text-center">
                <h3 className="text-lg font-semibold tracking-[0.05em] text-forest-900 uppercase">
                  {collection.pageTitle ?? collection.title}
                </h3>
                <p className="text-sm text-forest-900">
                  {collection.products.length} {collection.products.length === 1 ? "Product" : "Products"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
