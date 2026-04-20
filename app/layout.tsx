import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Gastos Julio & Flor",
    template: "Gastos Julio & Flor | %s",
  },
  description: "Sistema de gastos personales y presupuesto familiar",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gastos JF",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              var t=localStorage.getItem('theme');
              var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
              if(d)document.documentElement.classList.add('dark');
              var ct=localStorage.getItem('gfj-theme');
              if(ct)document.documentElement.setAttribute('data-theme',ct);
            }catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
