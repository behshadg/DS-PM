import { getCurrentUser } from '@/lib/domainUser';

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="h-screen flex items-center justify-center">
      {user ? (
        <p className="text-xl">
          Welcome back, {user.name || user.email}! Go to your{' '}
          <a href="/dashboard" className="text-blue-500">
            dashboard
          </a>
          .
        </p>
      ) : (
        <p className="text-xl">
          Welcome to Property Management. Please{' '}
          <a href="/login" className="text-blue-500">
            click me to log in
          </a>
           
        </p>
      )}
    </div>
  );
}