"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { BalanceView } from '@/components/dashboard/balance-view';
import { MonthlyOverview } from '@/components/dashboard/monthly-overview';
import { LegacyDataMigration } from '@/components/dashboard/legacy-data-migration';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Calendar, Wallet } from 'lucide-react';

export default function Home() {
  const { user, isUserLoading, auth } = useFirebase();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('current');

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

  const handleMonthSelect = (monthKey: string) => {
    setActiveTab('current');
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
        <header className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
              Anna's budget
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

        <LegacyDataMigration />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Current Month
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              All Months
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            <BalanceView key={user.uid} />
          </TabsContent>
          
          <TabsContent value="overview">
            <MonthlyOverview onMonthSelect={handleMonthSelect} />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
