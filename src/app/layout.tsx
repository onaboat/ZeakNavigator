import AppWalletProvider from "./components/AppWalletProvider";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./ui/Navbar";
import Footer from "./ui/Footer";


export const metadata: Metadata = {
  title: "Zeak Navigator",
  description: "ZK Compression explorer & tools",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="bg-gray-50 "
      >
        <AppWalletProvider>
          <Navbar />
          {children}
          <Footer />
        </AppWalletProvider>
      </body>
    </html>
  );
}
