import BuyerNavbar from '@/components/BuyerNavbar';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BuyerNavbar />
      <main className="bg-white min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </>
  );
}


