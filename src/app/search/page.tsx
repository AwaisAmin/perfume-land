import { Suspense } from "react";
import SearchResults from "@/components/search/SearchResults";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";

export const metadata = {
  title: "Search",
};

export default function SearchPage() {
  return (
    <>
      {/* The results read the `q` query string on the client, so they need a
          Suspense boundary — the shell around them still prerenders. */}
      <Suspense fallback={null}>
        <SearchResults />
      </Suspense>

      <ContactForm />
      <TrustBadges />
    </>
  );
}
