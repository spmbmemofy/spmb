
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl font-headline">Pemulihan Kata Sandi</CardTitle>
            <CardDescription>
              Instruksi untuk pemulihan kata sandi akan muncul di sini.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Jika Anda lupa kata sandi, silakan ikuti proses pemulihan kata sandi yang akan dijelaskan di halaman ini atau hubungi dukungan.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        dibuat oleh Memofy Studio
      </footer>
    </div>
  );
}
