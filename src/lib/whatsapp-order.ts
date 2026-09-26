import { CURRENCY_LABEL, formatPrice as format } from "@/lib/currency";
import { variantLabel, type SiteContent } from "@/lib/types";

export type OrderLine = {
  title: string;
  variantType: "EDT" | "EDP" | "Perfume" | null;
  variantSize: "35ml" | "50ml" | "100ml";
  price: number;
  quantity: number;
};

export type OrderCustomer = {
  name: string;
  phone: string;
  city: string;
  address: string;
  note: string;
};

/** Keeps customer input to one tidy line each and strips control characters. */
function clean(value: string, max: number): string {
  return value.replace(/[\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

/** The order as plain text, ready to prefill a WhatsApp chat. */
export function buildOrderMessage(
  lines: OrderLine[],
  customer: OrderCustomer,
  freeShippingThreshold: number,
  texts: SiteContent["checkout"],
  currency: string = CURRENCY_LABEL,
): string {
  const formatPrice = (amount: number) => format(amount, currency);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const out: string[] = [`*${texts.messageHeading}*`, ""];

  lines.forEach((line, i) => {
    out.push(`${i + 1}. ${line.title} — ${variantLabel({ type: line.variantType, size: line.variantSize })}`);
    out.push(`   ${line.quantity} × ${formatPrice(line.price)} = ${formatPrice(line.price * line.quantity)}`);
  });

  out.push("", `*${texts.messageSubtotal}: ${formatPrice(subtotal)}*`);
  out.push(
    subtotal >= freeShippingThreshold
      ? texts.messageFreeDelivery
      : texts.messageDeliveryNote.replace("{amount}", formatPrice(freeShippingThreshold)),
  );

  out.push("", `*${texts.messageCustomer}*`);
  out.push(`${texts.nameLabel}: ${clean(customer.name, 100)}`);
  out.push(`${texts.phoneLabel}: ${clean(customer.phone, 30)}`);
  out.push(`${texts.cityLabel}: ${clean(customer.city, 60)}`);
  out.push(`${texts.addressLabel}: ${clean(customer.address, 300)}`);
  const note = clean(customer.note, 500);
  if (note) out.push(`${texts.noteLabel}: ${note}`);

  return out.join("\n");
}

/** wa.me link that opens a chat with `phoneNumber` and the message prefilled. */
export function whatsappOrderUrl(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/** A loose sanity check: 10–15 digits, optional leading +, spaces/dashes allowed. */
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\+?[\d\s-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "").length;
  return digits >= 10 && digits <= 15;
}
