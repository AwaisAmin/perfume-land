import { Suspense } from "react";
import PageHeader from "@/components/shared/PageHeader";
import SearchResults, { SearchCount } from "@/components/search/SearchResults";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";

export const metadata = {
  title: "Search",
};

export default function SearchPage() {
  return (
    <>
      {/* The heading band is the same whatever the query, so it is rendered
          on the server. Only the result count and grid depend on `q`, which
          is read on the client — they sit behind Suspense, over a reserved
          block, so the sections below them never get pushed down. */}
      <PageHeader>
        <h1 className="text-fluid-h2 font-light uppercase tracking-widest text-cream-50">Search</h1>
        <Suspense fallback={<p className="mt-3 text-sm text-cream-100/70">&nbsp;</p>}>
          <SearchCount />
        </Suspense>
      </PageHeader>

      <section className="container-app min-h-screen py-16">
        <Suspense fallback={null}>
          <SearchResults />
        </Suspense>
      </section>

      <ContactForm />
      <TrustBadges />
    </>
  );
}
