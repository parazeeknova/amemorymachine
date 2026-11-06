import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "#/features/auth/hooks/use-auth";

const IndexRoute = () => {
  const { data: user, isPending } = useAuth();

  if (isPending) {
    return null;
  }

  if (user) {
    return <Navigate replace to="/home" />;
  }

  return <Navigate replace to="/about" />;
};

export const Route = createFileRoute("/")({
  component: IndexRoute,
});
