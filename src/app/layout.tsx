import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import Navbar from "./_components/Navbar";
import { AuthProvider } from "./_context/AuthContext";
import { ProjectProvider } from "./_context/ProjectContext";

export const metadata: Metadata = {
  title: "connectnow · Digital Grid Connection",
  description: "Digital grid connection registration per VDE Data Set 3.0",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        <AuthProvider>
          <ProjectProvider>
            <Navbar />
            <main>{children}</main>
          </ProjectProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
