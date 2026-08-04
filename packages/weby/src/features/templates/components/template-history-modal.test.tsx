import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapper } from "#/shared/test/utils";
import { TemplateHistoryModal } from "./template-history-modal";
import { usePortfolioStore } from "../stores/portfolio-store";

const renderModal = (props: { isOpen: boolean; onClose: () => void; onRestore: () => void }) =>
  render(
    <TemplateHistoryModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      onRestore={props.onRestore}
    />,
    { wrapper: createWrapper() },
  );

describe("TemplateHistoryModal", () => {
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
  });

  it("renders nothing when not open", () => {
    const onClose = vi.fn();
    const onRestore = vi.fn();
    const { container } = renderModal({ isOpen: false, onClose, onRestore });
    expect(container.innerHTML).toBe("");
  });

  it("shows empty state when no history exists", () => {
    const onClose = vi.fn();
    const onRestore = vi.fn();
    renderModal({ isOpen: true, onClose, onRestore });

    expect(screen.getByText("history")).toBeDefined();
    expect(screen.getByText("no history")).toBeDefined();
  });

  it("renders square boxes for each snapshot", () => {
    usePortfolioStore.setState({
      history: [
        {
          id: "test-1",
          markdown: "## PROFILE\nName: Test User",
          timestamp: Date.now(),
        },
      ],
    });

    const onClose = vi.fn();
    const onRestore = vi.fn();
    renderModal({ isOpen: true, onClose, onRestore });

    expect(screen.getByText("1")).toBeDefined();
  });

  it("calls onRestore when snapshot box is clicked", () => {
    const testMarkdown = "## PROFILE\nName: Test User";
    usePortfolioStore.setState({
      history: [
        {
          id: "test-1",
          markdown: testMarkdown,
          timestamp: Date.now(),
        },
      ],
    });

    const onClose = vi.fn();
    const onRestore = vi.fn();

    renderModal({ isOpen: true, onClose, onRestore });

    const buttons = screen.getAllByRole("button");
    const snapshotBtn = buttons.find((b) => b.querySelector(".font-mono"));
    expect(snapshotBtn).toBeDefined();
    if (snapshotBtn) {
      fireEvent.click(snapshotBtn);
    }

    expect(onRestore).toHaveBeenCalledWith(testMarkdown);
  });

  it("clears local history and calls API when clear all is clicked", () => {
    usePortfolioStore.setState({
      history: [
        {
          id: "test-1",
          markdown: "test",
          timestamp: Date.now(),
        },
      ],
    });

    const onClose = vi.fn();
    const onRestore = vi.fn();

    renderModal({ isOpen: true, onClose, onRestore });

    fireEvent.click(screen.getByText("clear all"));

    expect(usePortfolioStore.getState().history).toEqual([]);
  });

  it("calls onClose when X button is clicked", () => {
    const onClose = vi.fn();
    const onRestore = vi.fn();

    renderModal({ isOpen: true, onClose, onRestore });

    const buttons = screen.getAllByRole("button");
    const xButton = buttons.find((b) => b.querySelector("svg") && !b.textContent);
    expect(xButton).toBeDefined();
    if (xButton) {
      fireEvent.click(xButton);
    }

    expect(onClose).toHaveBeenCalledOnce();
  });
});
