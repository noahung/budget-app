
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    // If the user is logged in, redirect them to the home page.
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  // While checking for user auth, show a loading state
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
            Anna's budget
          </h1>
          <p className="text-muted-foreground mt-2">
            Sign in or create an account to manage your finances.
          </p>
        </header>
        <AuthForm />
      </div>
    </main>
  );
}
