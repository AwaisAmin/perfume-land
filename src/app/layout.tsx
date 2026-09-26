import type { Metadata } from "next";
import { Montserrat, Nunito_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import FloatingChat from "@/components/layout/FloatingChat";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/lib/cart-context";
import { getSiteData, toClientSiteData } from "@/lib/site-data";
import { SiteDataProvider } from "@/lib/site-data-context";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = (await getSiteData()).content;
  return { title: seo.title, description: seo.description };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const siteData = toClientSiteData(await getSiteData());
  return (
    <html
      lang="en"
      className={`${nunitoSans.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream-50 text-ink">
        <SiteDataProvider value={siteData}>
          <CartProvider>
            <AnnouncementBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingChat />
            <CartDrawer />
          </CartProvider>
        </SiteDataProvider>
      </body>
    </html>
  );
}
