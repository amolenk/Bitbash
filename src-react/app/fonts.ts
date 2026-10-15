import { Agdasima, Montserrat } from "next/font/google";

export const agdasima = Agdasima({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-agdasima",
});

export const montserrat = Montserrat({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-montserrat",
});
