import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Masuk Akun</CardTitle>
            <CardDescription>
              Gunakan akun yang telah Anda dapatkan untuk masuk ke sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </main>
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        dibuat oleh Memofy Studio
      </footer>
    </div>
  );
}
