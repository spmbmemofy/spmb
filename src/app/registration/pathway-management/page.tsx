"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/registration/pendaftaran-settings');
  }, [router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-xl font-semibold">Halaman Dipindahkan</h1>
        <p className="mt-2 text-muted-foreground">
          Pengaturan ini sekarang menjadi bagian dari halaman "Pengaturan Pendaftaran".
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Mengarahkan Anda ke halaman yang baru...
        </p>
      </div>
    </div>
  );
}
