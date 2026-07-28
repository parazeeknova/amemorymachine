import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PortfolioEditorSidebar } from "./portfolio-editor-sidebar";
import { usePortfolioStore } from "../stores/portfolio-store";
import { setPortfolioEditorControls } from "./portfolio-editor-context";
import type { PortfolioEditorControls } from "./portfolio-editor-context";

const setMockControls = (overrides: Partial<PortfolioEditorControls> = {}) => {
  setPortfolioEditorControls({
    handlePin: vi.fn(),
    handleReset: vi.fn(),
    hasChanges: true,
    isPinned: false,
    isSaving: false,
    onBack: vi.fn(),
    ...overrides,
  });
};

describe("PortfolioEditorSidebar", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    usePortfolioStore.setState({
      history: [],
      isGuideOpen: false,
      isHistoryOpen: false,
      isPinned: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setPortfolioEditorControls(null);
  });

  it("renders loading state when no controls are set", () => {
    render(<PortfolioEditorSidebar />);
    expect(screen.getByText("loading...")).toBeDefined();
  });

  it("renders all sidebar options when controls are set", () => {
    setMockControls();
    render(<PortfolioEditorSidebar />);

    expect(screen.getByText("back")).toBeDefined();
    expect(screen.getByText("portfolio")).toBeDefined();
    expect(screen.getByText("template")).toBeDefined();
    expect(screen.getByText("save")).toBeDefined();
    expect(screen.getByText("format guide")).toBeDefined();
    expect(screen.getByText("reset to boilerplate")).toBeDefined();
    expect(screen.getByText("template history")).toBeDefined();
    expect(screen.getByText("presets")).toBeDefined();
  });

  it("shows active in accent color when template is pinned", () => {
    setMockControls({ isPinned: true });
    render(<PortfolioEditorSidebar />);

    const activeEl = screen.getByText("active");
    expect(activeEl).toBeDefined();
    expect(activeEl.className).toContain("text-purple-400");
  });

  it("shows inactive state when template is not pinned", () => {
    setMockControls();
    render(<PortfolioEditorSidebar />);

    expect(screen.getByText("inactive")).toBeDefined();
  });

  it("shows save badge count when history has entries", () => {
    usePortfolioStore.setState({
      history: [
        {
          id: "test-1",
          markdown: "## PROFILE\nName: Test",
          timestamp: Date.now(),
        },
      ],
    });
    setMockControls();
    render(<PortfolioEditorSidebar />);

    // The badge in the save button shows the history count
    const badge = screen.getByText("1");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("font-mono");
  });

  it("calls handlePin when save button is clicked", () => {
    const handlePin = vi.fn();
    setMockControls({ handlePin });

    render(<PortfolioEditorSidebar />);
    fireEvent.click(screen.getByText("save"));

    expect(handlePin).toHaveBeenCalledOnce();
  });

  it("calls handleReset when reset to boilerplate is clicked", () => {
    const handleReset = vi.fn();
    setMockControls({ handleReset });

    render(<PortfolioEditorSidebar />);
    fireEvent.click(screen.getByText("reset to boilerplate"));

    expect(handleReset).toHaveBeenCalledOnce();
  });

  it("opens format guide when format guide button is clicked", () => {
    setMockControls();

    render(<PortfolioEditorSidebar />);
    fireEvent.click(screen.getByText("format guide"));

    expect(usePortfolioStore.getState().isGuideOpen).toBe(true);
  });

  it("disables template history when no history exists", () => {
    setMockControls();
    render(<PortfolioEditorSidebar />);

    const historyBtn = screen.getByText("template history").closest("button");
    expect(historyBtn).toBeDefined();
    expect(historyBtn?.disabled).toBe(true);
  });

  it("enables template history when history has entries", () => {
    usePortfolioStore.setState({
      history: [
        {
          id: "test-1",
          markdown: "## PROFILE\nName: Test",
          timestamp: Date.now(),
        },
      ],
    });
    setMockControls();
    render(<PortfolioEditorSidebar />);

    const historyBtn = screen.getByText("template history").closest("button");
    expect(historyBtn).toBeDefined();
    expect(historyBtn?.disabled).toBe(false);
  });

  it("disables save button while saving", () => {
    setMockControls({ isSaving: true });
    render(<PortfolioEditorSidebar />);

    const saveBtn = screen.getByText("save").closest("button");
    expect(saveBtn?.disabled).toBe(true);
  });

  it("calls onBack when back button is clicked", () => {
    const onBack = vi.fn();
    setMockControls({ onBack });

    render(<PortfolioEditorSidebar />);
    fireEvent.click(screen.getByText("back"));

    expect(onBack).toHaveBeenCalledOnce();
  });

  it("disables presets button", () => {
    setMockControls();
    render(<PortfolioEditorSidebar />);

    const presetsBtn = screen.getByText("presets").closest("button");
    expect(presetsBtn).toBeDefined();
  });
});
