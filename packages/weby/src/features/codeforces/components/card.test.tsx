import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CodeforcesCard } from "./card";
import { createWrapper } from "#/shared/test/utils";

const createMockResponse = (data: unknown, ok = true): Response =>
  ({
    json: () => Promise.resolve(data),
    ok,
  }) as Response;

const sampleUser = {
  handle: "parazeeknova",
  maxRank: "newbie",
  maxRating: 847,
  rank: "newbie",
  rating: 847,
};

const nowSeconds = () => Math.floor(Date.now() / 1000);
const secondsAgo = (days: number) => nowSeconds() - days * 24 * 60 * 60;

const sampleRatings = [
  {
    contestName: "Round A",
    newRating: 379,
    oldRating: 0,
    rank: 9546,
    ratingUpdateTimeSeconds: secondsAgo(70),
  },
  {
    contestName: "Round B",
    newRating: 613,
    oldRating: 379,
    rank: 10_817,
    ratingUpdateTimeSeconds: secondsAgo(40),
  },
  {
    contestName: "Round C",
    newRating: 847,
    oldRating: 613,
    rank: 6662,
    ratingUpdateTimeSeconds: secondsAgo(10),
  },
];

describe("CodeforcesCard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a loading skeleton while data is being fetched", async () => {
    // Never-resolving fetch keeps the query in the loading state.
    // eslint-disable-next-line promise/avoid-new -- need never-resolving promise to keep query pending
    const pending = new Promise(() => {});
    const mockFetch = vi.fn().mockReturnValue(pending);
    vi.stubGlobal("fetch", mockFetch);

    const { container } = render(<CodeforcesCard username="parazeeknova" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(container.querySelector(".skeleton-shimmer")).toBeTruthy();
    });

    // The handle and the unavailable fallback are not shown while loading.
    expect(screen.queryByText("parazeeknova")).toBeNull();
    expect(screen.queryByText("data unavailable")).toBeNull();
  });

  it("renders an unavailable state when the handle is not found", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(createMockResponse({ ratings: [], user: null }));
    vi.stubGlobal("fetch", mockFetch);

    render(<CodeforcesCard username="does-not-exist" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText("data unavailable")).toBeDefined();
    });

    expect(screen.queryByText("parazeeknova")).toBeNull();
  });

  it("renders the user handle, rating and contest bars when data loads", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(
      createMockResponse({
        lastSolved: [
          { contestId: 2250, index: "A", name: "Watermelon", solvedTimeSeconds: secondsAgo(0.5) },
          {
            contestId: 2245,
            index: "B",
            name: "Bear and Prime 100",
            solvedTimeSeconds: secondsAgo(1.5),
          },
          { contestId: 2247, index: "C", name: "Queue", solvedTimeSeconds: secondsAgo(12) },
        ],
        ratings: sampleRatings,
        solvedCount: 12,
        user: sampleUser,
      }),
    );
    vi.stubGlobal("fetch", mockFetch);

    const { container } = render(<CodeforcesCard username="parazeeknova" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText("parazeeknova")).toBeDefined();
    });

    // Rating is rendered (top-right value + max stat block).
    expect(screen.getAllByText("847").length).toBeGreaterThan(0);

    // The month heatmap always renders 12 boxes (one per month).
    const boxes = container.querySelectorAll(".cf-month-box");
    expect(boxes.length).toBe(12);

    // GitHub-style stat labels render.
    expect(screen.getByText("solved")).toBeDefined();
    expect(screen.getByText("contests")).toBeDefined();
    expect(screen.getByText("max rating")).toBeDefined();

    // Recently-solved list renders the last 3 distinct problems.
    expect(screen.getByText("recently solved")).toBeDefined();
    expect(screen.getByText("Watermelon")).toBeDefined();
    expect(screen.getByText("Bear and Prime 100")).toBeDefined();
    expect(screen.getByText("Queue")).toBeDefined();

    // No loading skeleton or unavailable fallback remains.
    expect(container.querySelector(".animate-pulse")).toBeNull();
    expect(screen.queryByText("data unavailable")).toBeNull();
  });

  it("renders an unavailable state when the proxied fetch errors", async () => {
    const mockFetch = vi.fn().mockRejectedValueOnce(new Error("network error"));
    vi.stubGlobal("fetch", mockFetch);

    render(<CodeforcesCard username="parazeeknova" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText("data unavailable")).toBeDefined();
    });
  });

  it("requests data through the proxied /api/cf/data endpoint", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(createMockResponse({ ratings: [], user: sampleUser }));
    vi.stubGlobal("fetch", mockFetch);

    render(<CodeforcesCard username="parazeeknova" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/cf/data?handle=parazeeknova");
    });
  });
});
