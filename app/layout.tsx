import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // Added this for the footer links

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "THE YASAR WAY",
  description: "Premium Grooming Essentials for the Modern Standard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black`}>
        
        {/* Everything inside children is your page content */}
        {children}

        {/* --- FOOTER START --- */}
        <footer className="bg-black text-white py-16 px-8 mt-20 border-t border-zinc-800 font-sans">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">THE YASAR WAY</h2>
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] leading-relaxed max-w-sm">
                Premium grooming essentials for the modern standard. Defining the way you present yourself to the world.
              </p>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6 text-zinc-400">Connect</h3>
              <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest">
                <li>
                  <a href="https://www.facebook.com/share/1AtcRzW6wE/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Facebook</a>
                </li>
                <li>
                  <a href="https://www.instagram.com/theyasarway?igsh=MWtiMDl3emp4OTd0bQ==" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Instagram</a>
                </li>
                <li>
                  <span className="text-zinc-600">TikTok (Soon)</span>
                </li>
                <li>
                  <span className="text-zinc-600">WhatsApp (Soon)</span>
                </li>
              </ul>
            </div>

            {/* Support/Links */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6 text-zinc-400">Support</h3>
              <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest">
                <li><Link href="/checkout" className="hover:text-zinc-400 transition-colors">My Bag</Link></li>
                <li><Link href="/" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/" className="hover:text-zinc-400 transition-colors">Shipping Info</Link></li>
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[8px] text-zinc-600 uppercase tracking-widest">© 2026 THE YASAR WAY. All Rights Reserved.</p>
            <p className="text-[8px] text-zinc-600 uppercase tracking-widest italic">Designed for the Elite</p>
          </div>
        </footer>
        {/* --- FOOTER END --- */}

      </body>
    </html>
  );
}