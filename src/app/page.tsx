import { BalanceView } from '@/components/dashboard/balance-view';

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
          BalanceView
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          A clean and simple way to track your monthly income and bills, giving you a clear view of your remaining balance.
        </p>
      </header>
      <BalanceView />
    </main>
  );
}
