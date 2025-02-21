import { getCurrentUser } from '@/lib/domainUser';

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-xl">
          Welcome to Property Management. Please{' '}
          <a href="/login" className="text-blue-500">
            log in
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-xl">
        Welcome back, {user.name || user.email}! Go to your{' '}
        <a href="/dashboard" className="text-blue-500">
          dashboard
        </a>
        .
      </p>
    </div>
  );
}