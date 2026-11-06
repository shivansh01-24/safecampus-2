import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusShield - Emergency Assistance Portal",
  description: "Official campus emergency response, SOS panic trigger, and medical assistance portal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
