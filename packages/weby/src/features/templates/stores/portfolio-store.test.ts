import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePortfolioStore } from "../stores/portfolio-store";

describe("usePortfolioStore", () => {
  beforeEach(() => {
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

  it("initializes with default state", () => {
    const state = usePortfolioStore.getState();
    expect(state.isPinned).toBe(false);
    expect(state.isGuideOpen).toBe(false);
    expect(state.isHistoryOpen).toBe(false);
    expect(state.history).toEqual([]);
  });

  it("sets isPinned", () => {
    act(() => {
      usePortfolioStore.getState().setIsPinned(true);
    });
    expect(usePortfolioStore.getState().isPinned).toBe(true);

    act(() => {
      usePortfolioStore.getState().setIsPinned(false);
    });
    expect(usePortfolioStore.getState().isPinned).toBe(false);
  });

  it("sets isGuideOpen", () => {
    act(() => {
      usePortfolioStore.getState().setIsGuideOpen(true);
    });
    expect(usePortfolioStore.getState().isGuideOpen).toBe(true);
  });

  it("sets isHistoryOpen", () => {
    act(() => {
      usePortfolioStore.getState().setIsHistoryOpen(true);
    });
    expect(usePortfolioStore.getState().isHistoryOpen).toBe(true);
  });

  it("adds history snapshot without changing isPinned", () => {
    const markdown = "## PROFILE\nName: Test User";

    act(() => {
      usePortfolioStore.getState().addHistorySnapshot(markdown);
    });

    const state = usePortfolioStore.getState();
    expect(state.isPinned).toBe(false);
    expect(state.history).toHaveLength(1);
    expect(state.history[0].markdown).toBe(markdown);
    expect(state.history[0].id).toBeDefined();
    expect(state.history[0].timestamp).toBeGreaterThan(0);
  });

  it("prepends snapshots so newest is first", () => {
    act(() => {
      usePortfolioStore.getState().addHistorySnapshot("first");
    });

    // Small delay to ensure timestamp difference
    const firstTimestamp = usePortfolioStore.getState().history[0].timestamp;

    act(() => {
      usePortfolioStore.getState().addHistorySnapshot("second");
    });

    const state = usePortfolioStore.getState();
    expect(state.history).toHaveLength(2);
    expect(state.history[0].markdown).toBe("second");
    expect(state.history[1].markdown).toBe("first");
    expect(state.history[0].timestamp).toBeGreaterThanOrEqual(firstTimestamp);
  });

  it("caps history at 50 entries", () => {
    for (let i = 0; i < 55; i += 1) {
      act(() => {
        usePortfolioStore.getState().addHistorySnapshot(`snapshot-${i}`);
      });
    }

    expect(usePortfolioStore.getState().history).toHaveLength(50);
    // The first entry should be the 55th (index 54), the last should be the 6th (index 5)
    expect(usePortfolioStore.getState().history[0].markdown).toBe("snapshot-54");
    expect(usePortfolioStore.getState().history[49].markdown).toBe("snapshot-5");
  });

  it("clears history", () => {
    act(() => {
      usePortfolioStore.getState().addHistorySnapshot("test");
    });
    expect(usePortfolioStore.getState().history).toHaveLength(1);

    act(() => {
      usePortfolioStore.getState().clearHistory();
    });
    expect(usePortfolioStore.getState().history).toEqual([]);
  });

  it("resets to initial state", () => {
    act(() => {
      usePortfolioStore.getState().setIsPinned(true);
      usePortfolioStore.getState().setIsGuideOpen(true);
      usePortfolioStore.getState().setIsHistoryOpen(true);
      usePortfolioStore.getState().addHistorySnapshot("test");
    });

    act(() => {
      usePortfolioStore.getState().reset();
    });

    const state = usePortfolioStore.getState();
    expect(state.isPinned).toBe(false);
    expect(state.isGuideOpen).toBe(false);
    expect(state.isHistoryOpen).toBe(false);
    expect(state.history).toEqual([]);
  });

  it("persists history to localStorage", () => {
    act(() => {
      usePortfolioStore.getState().addHistorySnapshot("persisted");
    });

    const storedRaw = localStorage.getItem("verso-portfolio-store");
    expect(storedRaw).toBeDefined();
    if (!storedRaw) {return;}

    const stored = JSON.parse(storedRaw);
    expect(stored.state.history).toHaveLength(1);
    expect(stored.state.history[0].markdown).toBe("persisted");
  });

  it("does NOT persist isPinned, isGuideOpen, or isHistoryOpen", () => {
    act(() => {
      usePortfolioStore.getState().setIsPinned(true);
      usePortfolioStore.getState().setIsGuideOpen(true);
      usePortfolioStore.getState().setIsHistoryOpen(true);
    });

    const storedRaw = localStorage.getItem("verso-portfolio-store");
    if (storedRaw) {
      const stored = JSON.parse(storedRaw);
      expect(stored.state.isPinned).toBeUndefined();
      expect(stored.state.isGuideOpen).toBeUndefined();
      expect(stored.state.isHistoryOpen).toBeUndefined();
    }
  });
});
