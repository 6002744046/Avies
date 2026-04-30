import { LandingPage } from "@/components/site/landing-page";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return <LandingPage user={user} />;
}
