import type { Metadata } from "next";
import { Inter, Abhaya_Libre } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/public/ConvexClientProvider";
import { RootLayoutContent } from "@/components/public/RootLayoutContent";

const inter = Inter({
  subsets: ["latin"],
});

const abhayaLibre = Abhaya_Libre({
  subsets: ["latin"],
  weight: ["500"], // Medium weight
  variable: "--font-abhaya-libre",
});

export const metadata: Metadata = {
  title: "The Headlines",
  description: "Professional news aggregation with fact-checking and source transparency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      <html lang="en">
        <body className={`${inter.className} ${abhayaLibre.variable} antialiased`}>
          <RootLayoutContent>{children}</RootLayoutContent>
        </body>
      </html>
    </ConvexClientProvider>
  );
}
