// app/dashboard/layout.tsx
import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/nextjs';
import DashboardNav from 'components/dashboard/nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="flex min-h-screen w-full flex-col">
          <header className="p-4 flex justify-end">
            <UserButton />
          </header>
          <DashboardNav />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {children}
          </main>
        </div>
      </SignedIn>
    </>
  );
}
