import type { ReactNode } from "react";
import "./globals.css";
import { EraChatbot } from "@/components/EraChatbot";

export const metadata = {
  title: "AI Finance Controller",
  description: "Books, cash, and the August reconciliation agent"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <EraChatbot />
      </body>
    </html>
  );
}
