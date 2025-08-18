
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import '../../globals.css';

export const metadata: Metadata = {
  title: 'Detail Sekolah PMB 2026',
  description: 'Informasi detail sekolah tujuan Penerimaan Murid Baru 2026',
};

export default function SchoolDetailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>PMB 2026</span>
          </Link>
          <Button variant="outline" asChild>
              <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Beranda
              </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t p-4 text-center text-sm text-muted-foreground bg-background">
          &copy; {new Date().getFullYear()} PMB 2026. Dibuat oleh Memofy Studio.
      </footer>
    </div>
  );
}
