// app/actions/auth.ts
'use server';

// With Clerk, sign-out is handled client‑side. This dummy logout action can be removed.
export async function logout() {
  // Optionally, you could clear cookies or perform server-side cleanup here.
  return { success: true };
}
