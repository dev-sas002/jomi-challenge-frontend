import "@testing-library/jest-dom";

/**
 * `jest-environment-jsdom` does not provide a global `fetch`, but Apollo
 * Client's `HttpLink` asserts that one exists the moment a client is
 * constructed. Tests must never reach the network either, so install a stub
 * that rejects loudly. A test that needs a specific response can overwrite
 * `global.fetch` with its own mock, or use Apollo's `MockedProvider`.
 */
const unexpectedFetch = () =>
  Promise.reject(
    new Error(
      "Unexpected network request during a test. Mock it (e.g. with MockedProvider) instead of hitting the network."
    )
  );

const installFetchStub = () => {
  (globalThis as unknown as { fetch: unknown }).fetch =
    jest.fn(unexpectedFetch);
};

installFetchStub();
beforeEach(installFetchStub);

/**
 * `next/image` lazy-loads through `IntersectionObserver`, which jsdom does not
 * implement — without this the component would never swap its placeholder for
 * the real source and image assertions would test nothing. The stub reports
 * every observed element as immediately visible.
 */
class ImmediateIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element): void {
    this.callback(
      [
        {
          target,
          isIntersecting: true,
          intersectionRatio: 1,
        } as IntersectionObserverEntry,
      ],
      this
    );
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
  ImmediateIntersectionObserver;
