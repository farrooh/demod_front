import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@/styles/carousel.module.css';
import Navbar from "@/components/views/navbar";
import RightBar from "@/components/right_bar";
import Footer from "@/components/views/footer";
import Providers from "@/components/providers";
import React, { Suspense } from 'react';
import { NavigationEvents } from '../components/providers/navigation_events';
import { ToastContainer } from 'react-toastify';
import TopLoading from '../components/top_loading';


import AlertWrapper from '../components/alert';
import { Box } from '@mui/system';

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Demod"
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="ru">
      <head>
        <script defer data-domain="demod.uz" src="https://plausible.io/js/script.js"></script>
      </head>
      <body className={inter.className}>
        <Providers>
          <Box sx={{ position: 'realtive' }}>
            {/* <TopLoading /> */}
            <AlertWrapper />
          </Box>
          <Navbar />
          <RightBar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
