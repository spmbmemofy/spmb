import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <LoginForm />
      </main>
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        dibuat oleh Memofy Studio
      </footer>
    </div>
  );
}
