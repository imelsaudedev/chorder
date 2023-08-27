import "./globals.scss";
import { Inter } from "next/font/google";
import messages from "@/i18n/messages";

export const metadata = {
  title: messages.siteName,
  description: messages.siteDescription,
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-white text-black`}>
        {children}
      </body>
    </html>
  );
}
