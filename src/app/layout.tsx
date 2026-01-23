import type { Metadata } from "next";
import "./globals.css";
import { GlobalAuthInterceptor } from "@/components/GlobalAuthInterceptor";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "SalesDost - Welcome",
  description: "Sales incentive management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <GlobalAuthInterceptor />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
