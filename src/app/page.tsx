import HomePage from '@/components/pages/HomePage';
import { getAppUser } from '@/lib/auth';

export default async function Home() {
  const user = await getAppUser();
  return <HomePage isLoggedIn={!!user} />;
}
