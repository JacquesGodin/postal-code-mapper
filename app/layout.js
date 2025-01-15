import { Geist, Geist_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS globally
import "./globals.css"; // Import global styles

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Postal Code Mapper",
  description: "Map coordinates based on postal codes",
  icons: {
    icon: "/favicon.ico", // Specify the path to your favicon here
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" /> {/* Add favicon link */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
