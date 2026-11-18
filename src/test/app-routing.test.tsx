import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the homepage under a GitHub Pages repository subdirectory", () => {
    const router = createRouter({
      routeTree,
      basepath: "/financial-health-checker",
      history: createMemoryHistory({ initialEntries: ["/financial-health-checker/"] }),
      context: { queryClient: new QueryClient() },
    });

    expect(router.matchRoutes(router.latestLocation).at(-1)?.routeId).toBe("/");
    expect(router.buildLocation({ to: "/" }).href).toBe("/financial-health-checker/");
  });
});
