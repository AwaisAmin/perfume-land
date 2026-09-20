export type Branch = {
  /** Short label for the branch, e.g. in a "which shop?" list. */
  name: string;
  /** The full address as one line — this is what the footer shows. */
  address: string;
  /** Google Maps listing for the branch, opened in a new tab. */
  mapUrl?: string;
};

/** WhatsApp is how orders actually come in, so it doubles as the phone number. */
export const whatsappNumber = "+92 321 1128481";

/** wa.me wants the number bare — no +, spaces or dashes. */
export const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;

export const branches: Branch[] = [
  {
    name: "Bahria Town",
    address: "Bahria Town, Lahore",
    mapUrl:
      "https://www.google.com/maps/place/Hariss+Bhai+Perfumes/@31.358676,74.1843781,17z/data=!3m1!4b1!4m6!3m5!1s0x3918ff00421c7059:0x3fdc3a909da3b42f!8m2!3d31.358676!4d74.186953!16s%2Fg%2F11nps7drtp",
  },
  {
    name: "Shah Alam Market",
    address: "Shah Alam Market, Lahore",
  },
];
