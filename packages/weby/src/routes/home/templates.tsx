import { createFileRoute } from "@tanstack/react-router";
import { TemplatesView } from "#/features/templates/components/templates-view";

const TemplatesRouteComponent = () => <TemplatesView />;

export const Route = createFileRoute("/home/templates")({
  component: TemplatesRouteComponent,
});
