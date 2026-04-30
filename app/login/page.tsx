import { AuthPage } from "@/components/auth/auth-page";
import { PageShell } from "@/components/ui/page-shell";

export default function Login() {
  return (
    <PageShell>
      <AuthPage initialMode="sign_in" />
    </PageShell>
  );
}
