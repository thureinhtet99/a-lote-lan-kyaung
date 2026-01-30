import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@/services/clerk/component/ClerkProvider";
import { APP_CONFIG } from "@/config/appConfig";
import { Toaster } from "@/components/ui/sonner";
import { UploadThingSSR } from "@/services/uploadthing/components/UploadThingSSR";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_CONFIG.APP_NAME,
  description: APP_CONFIG.APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <ClerkProvider>
          {children}
          <Toaster />
          <UploadThingSSR />
        </ClerkProvider>
      </body>
    </html>
  );
}
