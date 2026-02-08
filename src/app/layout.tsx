import type { Metadata } from "next";
import "./globals.css";
import { GlobalAuthInterceptor } from "@/components/GlobalAuthInterceptor";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "SalesDost",
  description: "Sales incentive management platform",
  icons: {
    icon: "/zopper-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`} suppressHydrationWarning>
        <GlobalAuthInterceptor />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
