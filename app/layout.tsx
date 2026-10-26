import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/ui/BottomNav";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "EVNaija — Charging, Parking & Roadside Assist",
  description:
    "Find EV charging stations and paid parking across Nigeria, book a slot, order car utilities and request emergency rescue.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EVNaija",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#059669",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body>
        <ToastProvider>
          <div className="app-shell">{children}</div>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}