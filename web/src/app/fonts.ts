import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const avallon = localFont({
  src: "../assets/fonts/avallon-regular/Avallon.woff2",
  display: "swap",
  variable: "--font-avallon",
});
