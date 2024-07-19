import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Follow",
  description: "The Follow Language",
  icons: {
    icon: "/assets/logo/follow-24-white.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("flex flex-row h-full w-full", inter.className)}>
        {children}
      </body>
    </html>
  );
}
