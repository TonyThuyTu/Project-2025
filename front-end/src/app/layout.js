// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../../public/assets/css/bootstrap.min.css";
import "../../public/assets/css/templatemo.css";
import "../../public/assets/css/custom.css";
import "../../public/assets/css/fontawesome.min.css";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Táo Bro - Trang Chủ",
  description: "Website bán sản phẩm Apple chính hãng",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        {/* Favicon và icon */}
        <link rel="apple-touch-icon" href="/assets/img/apple-icon.png" />
        <link rel="shortcut icon" href="/assets/img/favicon.ico" type="image/x-icon" />

        {/* Google Font bổ sung nếu không dùng next/font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;200;300;400;500;700;900&display=swap"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
