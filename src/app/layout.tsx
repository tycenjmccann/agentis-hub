import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentis Hub - Pipeline Visualization",
  description: "AI Agent Pipeline Visualization and Output Viewer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen bg-surface-0 text-text-secondary antialiased">
        {children}
      </body>
    </html>
  );
}
