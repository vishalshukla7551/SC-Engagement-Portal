import AnimatedText from '@/components/AnimatedText';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { getHomePathForRole } from '@/lib/roleHomePath';
import { redirect } from 'next/navigation';

export default async function Home() {
  // In page components we must not mutate cookies; pass mutateCookies: false so
  // getAuthenticatedUserFromCookies only reads tokens and does not rotate them.
  const authUser = await getAuthenticatedUserFromCookies(undefined, { mutateCookies: false });

  if (authUser) {
    const target = getHomePathForRole(authUser.role);
    redirect(target);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black font-[family-name:var(--font-plus-jakarta-sans)]">
      <AnimatedText />
    </main>
  );
}
