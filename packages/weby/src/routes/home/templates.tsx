import { Outlet, createFileRoute } from "@tanstack/react-router";

const TemplatesLayout = () => <Outlet />;

export const Route = createFileRoute("/home/templates")({
  component: TemplatesLayout,
});
