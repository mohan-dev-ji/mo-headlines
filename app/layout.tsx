import type { Metadata } from "next";
import { Inter, Abhaya_Libre } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/public/ConvexClientProvider";
import { RootLayoutContent } from "@/components/public/RootLayoutContent";
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({
  subsets: ["latin"],
});

const abhayaLibre = Abhaya_Libre({
  subsets: ["latin"],
  weight: ["500"], // Medium weight
  variable: "--font-abhaya-libre",
});

export const metadata: Metadata = {
  title: "The Headlines | Professional News Aggregation",
  description: "Professional news aggregation with fact-checking and source transparency. Get curated headlines from trusted sources.",
  openGraph: {
    title: "The Headlines",
    description: "Professional news aggregation with fact-checking and source transparency",
    type: "website",
    url: "https://theheadlines.io",
    siteName: "The Headlines",
    images: [
      {
        url: "https://theheadlines.io/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Headlines - Professional News Aggregation",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Headlines",
    description: "Professional news aggregation with fact-checking and source transparency",
    images: ["https://theheadlines.io/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      <html lang="en">
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="DgOxAQF8G4ZEklEtDOBoKhT4kUduRTjBztDBtcL9gFw" />
        <body className={`${inter.className} ${abhayaLibre.variable} antialiased`}>
          <RootLayoutContent>
            {children}
            {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            )}
            </RootLayoutContent>
        </body>
      </html>
    </ConvexClientProvider>
  );
}
