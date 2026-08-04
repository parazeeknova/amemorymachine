import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PortfolioEditor } from "./portfolio-editor";
import { createWrapper } from "#/shared/test/utils";
import { usePortfolioStore } from "../stores/portfolio-store";

const createMockResponse = (data: unknown, ok = true, status = 200): Response =>
  ({
    headers: {
      get: (name: string) => (name.toLowerCase() === "content-type" ? "application/json" : null),
    },
    json: () => Promise.resolve(data),
    ok,
    status,
    text: () => Promise.resolve(JSON.stringify(data)),
  }) as unknown as Response;

const mockTemplates = (isDefault = true) =>
  createMockResponse([{ description: "", icon: "", id: "1", isDefault, title: "Portfolio" }]);

describe("PortfolioEditor", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    usePortfolioStore.setState({
      draft: null,
      history: [],
      isGuideOpen: false,
      isHistoryOpen: false,
      isPinned: false,
      lastSavedMarkdown: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders editor with initial profile data", () => {
    vi.useFakeTimers();

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(mockTemplates())
      .mockResolvedValueOnce(mockTemplates());
    vi.stubGlobal("fetch", mockFetch);

    render(
      <PortfolioEditor
        initialExperiences={[]}
        initialProfile={{ description: "", links: {}, name: "Test", tagline: "dev" }}
        initialProjects={[]}
      />,
      { wrapper: createWrapper() },
    );

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toContain("Name: Test");
    expect(textarea.value).toContain("## PROFILE");
    expect(textarea.value).toContain("## EXPERIENCE");
    expect(textarea.value).toContain("## PROJECTS");

    vi.useRealTimers();
  });

  it("renders editor with default boilerplate when no profile", () => {
    vi.useFakeTimers();

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(mockTemplates(false))
      .mockResolvedValueOnce(mockTemplates(false));
    vi.stubGlobal("fetch", mockFetch);

    render(<PortfolioEditor />, { wrapper: createWrapper() });

    expect(screen.getByRole("textbox")).toBeDefined();

    vi.useRealTimers();
  });
});
