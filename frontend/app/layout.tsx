import type { Metadata } from "next";
import "../styles/globals.css";
import Layout from "../components/Layout";

export const metadata: Metadata = {
  title: "MK SHOP — Shop Smarter with AI",
  description: "Futuristic premium AI-powered shopping platform combining natural language search, product intelligence, and conversational discovery.",
  openGraph: {
    title: "MK SHOP — AI Commerce Platform",
    description: "Shop smarter with AI natural search and product intelligence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Fonts Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          body {
            font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Outfit', sans-serif;
          }
        `}</style>
      </head>
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
