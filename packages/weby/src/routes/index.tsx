import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "#/features/auth/hooks/use-auth";
import { useIsDesktop } from "#/shared/lib/desktop";

const IndexRoute = () => {
  const { data: user, isPending } = useAuth();
  const isDesktop = useIsDesktop();

  if (isPending) {
    return null;
  }

  if (user) {
    return <Navigate replace to="/home" />;
  }

  // Desktop has its own onboarding at /desktop — never show the web landing there.
  if (isDesktop) {
    return <Navigate replace to="/desktop" />;
  }

  return <Navigate replace to="/about" />;
};

export const Route = createFileRoute("/")({
  component: IndexRoute,
});
