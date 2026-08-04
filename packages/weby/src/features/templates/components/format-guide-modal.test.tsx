import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FormatGuideModal } from "./format-guide-modal";

describe("FormatGuideModal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when not open", () => {
    const onClose = vi.fn();
    const { container } = render(<FormatGuideModal isOpen={false} onClose={onClose} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders modal with header when open", () => {
    const onClose = vi.fn();
    render(<FormatGuideModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("format guide")).toBeDefined();
  });

  it("renders all section headings", () => {
    const onClose = vi.fn();
    render(<FormatGuideModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText("section headers")).toBeDefined();
    expect(screen.getByText("profile section")).toBeDefined();
    expect(screen.getByText("experience section")).toBeDefined();
    expect(screen.getByText("projects section")).toBeDefined();
    expect(screen.getByText("tips")).toBeDefined();
  });

  it("renders code blocks with markdown examples", () => {
    const onClose = vi.fn();
    const { container } = render(<FormatGuideModal isOpen={true} onClose={onClose} />);

    const textContent = container.textContent ?? "";
    expect(textContent).toContain("## PROFILE");
    expect(textContent).toContain("## EXPERIENCE");
    expect(textContent).toContain("## PROJECTS");
  });

  it("calls onClose when X button is clicked", () => {
    const onClose = vi.fn();
    render(<FormatGuideModal isOpen={true} onClose={onClose} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
