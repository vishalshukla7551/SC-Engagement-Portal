// import RepublicLanding from '@/components/RepublicLanding';
import ValentineLanding from '@/components/ValentineLanding';
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
    <main className="min-h-screen bg-white font-[family-name:var(--font-plus-jakarta-sans)]">
      {/* <RepublicLanding /> */}
      <ValentineLanding />
    </main>
  );
}
