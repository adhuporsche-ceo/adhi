import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import KeyWatermark from "@/components/KeyWatermark";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KORE | Smart Canteen Queue & Order Management System",
  description:
    "Eliminate canteen wait times, track food preparation in real-time, and get smart AI crowd predictions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 min-h-screen flex flex-col`}
      >
        {/* 's' key watermark — active on every page */}
        <KeyWatermark />

        <div className="flex-1">{children}</div>

        {/* Global Footer — Google colour palette */}
        <footer className="mt-auto border-t border-gray-100 bg-white py-6 px-4">
          <div className="mx-auto max-w-7xl flex flex-col items-center gap-3 text-center">
            {/* Logo row */}
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg font-black text-white text-sm shadow"
                style={{ backgroundColor: "#4285F4" }}
              >
                K
              </div>
              <span className="text-base font-bold tracking-tight text-gray-800">
                KORE
              </span>
            </div>

            {/* Google dots */}
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#4285F4" }} />
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#EA4335" }} />
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#FBBC05" }} />
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#34A853" }} />
            </div>

            {/* Credit */}
            <p className="text-sm font-medium text-gray-500">
              Made by{" "}
              <span className="font-bold" style={{ color: "#4285F4" }}>
                Adhithya K
              </span>{" "}
              &mdash;{" "}
              <span className="font-mono font-semibold" style={{ color: "#34A853" }}>
                24BCS403
              </span>
            </p>

            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} KORE Smart Canteen. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
