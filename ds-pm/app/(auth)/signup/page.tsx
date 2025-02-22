import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp path="/signup" routing="path" signInUrl="/login" forceRedirectUrl="/dashboard" />
    </div>
  );
}