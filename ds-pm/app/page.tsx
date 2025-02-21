import { getCurrentUser } from '@/lib/domainUser'; // Adjust path if needed

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

  // Redirect authenticated users to /dashboard
  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-xl">
        Redirecting to{' '}
        <a href="/dashboard" className="text-blue-500">
          dashboard
        </a>
        ...
      </p>
    </div>
  );
}