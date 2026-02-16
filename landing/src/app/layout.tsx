import type { Metadata } from "next";
import "./globals.css";
import { geistMono, geistSans } from "./fonts";

export const metadata: Metadata = {
  title: "Flick - Your Anonymous Campus Hangout",
  description: "An anonymous reddit only for college students. You can vent, chill, hangout and all at one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        cz-shortcut-listen="true"
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
