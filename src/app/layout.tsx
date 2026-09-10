import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dynamics 365 Integration Demo",
  description: "Bidirectional sync demo between a portal and Dynamics 365 Finance & Operations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
