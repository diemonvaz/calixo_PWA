import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Feed Social - Calixo",
  description: "Ve los retos completados por otros usuarios",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#fe4b5b",
};

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

