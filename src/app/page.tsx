"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { BalanceView } from '@/components/dashboard/balance-view';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function Home() {
  const { user, isUserLoading, auth } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <main className="container mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-12">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
              BalanceView
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              A clean and simple way to track your monthly income and bills.
            </p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="shadow-neumorphic active:shadow-neumorphic-inset">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </header>
        <BalanceView />
      </main>
    </>
  );
}
