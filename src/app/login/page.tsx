import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
            BalanceView
          </h1>
          <p className="text-muted-foreground mt-2">
            Sign in or create an account to manage your finances.
          p>
        </header>
        <AuthForm />
      </div>
    </main>
  );
}
