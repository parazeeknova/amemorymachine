import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PortfolioEditor } from "#/features/templates/components/portfolio-editor";
import { useExperience, useProfile, useProjects } from "#/features/landing/hooks/use-data";

const PortfolioTemplateRoute = () => {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: experience } = useExperience();
  const { data: projects } = useProjects();

  return (
    <PortfolioEditor
      initialExperiences={experience}
      initialProfile={profile}
      initialProjects={projects}
      onBack={() => navigate({ to: "/home/templates" })}
    />
  );
};

export const Route = createFileRoute("/home/templates/portfolio")({
  component: PortfolioTemplateRoute,
});
