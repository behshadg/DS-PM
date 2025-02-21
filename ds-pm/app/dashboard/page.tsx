import DashboardContent from 'components/DashboardContent';
import { getCurrentUser } from '@/lib/domainUser';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div>
      {user ? (
        <DashboardContent user={user} />
      ) : (
        <div className="h-screen flex items-center justify-center">
          <p className="text-xl">
            Please{' '}
            <a href="/login" className="text-blue-500">
              log in
            </a>{' '}
            to view your dashboard.
          </p>
        </div>
      )}
    </div>
  );
}