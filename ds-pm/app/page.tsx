// app/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/domainUser';

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-xl">Redirecting...</p>
    </div>
  );
}
