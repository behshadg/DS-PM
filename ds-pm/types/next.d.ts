// types/next.d.ts
import 'next';

declare module 'next' {
  interface PageProps {
    params: Record<string, string | string[]> | Promise<Record<string, string | string[]>>;
    searchParams?: Record<string, string | string[]>;
  }
}