import { SignIn } from '@clerk/nextjs';

export default function ClerkSignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn path="/login" routing="path" signUpUrl="/signup" afterSignInUrl="/" />
    </div>
  );
}
