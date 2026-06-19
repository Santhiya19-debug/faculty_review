import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/hooks/useAuth";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Faculty Review — Find, Review, Improve Together",
  description: "Share honest feedback about your faculty and help build a better learning experience for everyone.",
  keywords: ["faculty review", "student feedback", "professor rating", "college review"],
  verification: {
  google: "Mtzd27ELf5dYCSuDF6HoMMKp1_MznXhDLyEZ3sLDwSI",
},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body className="font-sans bg-cream antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "#fff",
                color: "#333",
                borderRadius: "12px",
                border: "1px solid #ffc9d5",
                fontSize: "14px",
                fontFamily: "var(--font-poppins)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
