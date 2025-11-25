import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import "@/styles/themes.css";

import { APP_CONFIG } from "@/config/app-config";
import { ThemeProvider } from "@/context/Theme";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={[
            "light",
            "dark",
            "red-light",
            "red-dark",
            "rose-light",
            "rose-dark",
            "orange-light",
            "orange-dark",
            "green-light",
            "green-dark",
            "blue-light",
            "blue-dark",
            "violet-light",
            "violet-dark",
            "teal-light",
            "teal-dark",
            "bronze-light",
            "bronze-dark",
          ]}
        >
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
