
import type { Metadata } from 'next';
import '../../globals.css';

export const metadata: Metadata = {
  title: 'Bukti Pendaftaran',
  description: 'Dokumen bukti pendaftaran siswa baru.',
};

export default function ProofLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-body antialiased bg-background">
        {children}
      </body>
    </html>
  );
}
