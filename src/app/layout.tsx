import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agentis Hub',
  description: 'Agentis Hub - Pipeline visualization for AI agents',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
