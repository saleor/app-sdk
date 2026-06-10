import { render, screen } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isInIframe } from "@/util/is-in-iframe";
import { useIsMounted } from "@/util/use-is-mounted";

import { useDashboardToken } from "./use-dashboard-token";
import { withAuthorization } from "./with-authorization";

vi.mock("@/util/is-in-iframe", () => ({ isInIframe: vi.fn() }));
vi.mock("@/util/use-is-mounted", () => ({ useIsMounted: vi.fn() }));
vi.mock("./use-dashboard-token", () => ({ useDashboardToken: vi.fn() }));

function BaseComponent() {
  return <div>Authorized content</div>;
}

const setState = (state: {
  mounted: boolean;
  inIframe: boolean;
  hasAppToken: boolean;
  isTokenValid: boolean;
}) => {
  vi.mocked(useIsMounted).mockReturnValue(state.mounted);
  vi.mocked(isInIframe).mockReturnValue(state.inIframe);
  vi.mocked(useDashboardToken).mockReturnValue({
    hasAppToken: state.hasAppToken,
    isTokenValid: state.isTokenValid,
    tokenClaims: null,
  });
};

describe("withAuthorization", () => {
  beforeEach(() => {
    setState({ mounted: true, inIframe: true, hasAppToken: true, isTokenValid: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the wrapped component when all authorization checks pass", () => {
    const Wrapped = withAuthorization()(BaseComponent);
    render(<Wrapped />);

    expect(screen.getByText("Authorized content")).toBeDefined();
  });

  it("renders the unmounted fallback before the component is mounted", () => {
    setState({ mounted: false, inIframe: true, hasAppToken: true, isTokenValid: true });

    const Wrapped = withAuthorization({ unmounted: <p>custom loading</p> })(BaseComponent);
    render(<Wrapped />);

    expect(screen.getByText("custom loading")).toBeDefined();
  });

  it("renders the notIframe fallback when not running inside an iframe", () => {
    setState({ mounted: true, inIframe: false, hasAppToken: true, isTokenValid: true });

    const Wrapped = withAuthorization({ notIframe: <p>not in iframe</p> })(BaseComponent);
    render(<Wrapped />);

    expect(screen.getByText("not in iframe")).toBeDefined();
  });

  it("renders the noDashboardToken fallback when the app token is missing", () => {
    setState({ mounted: true, inIframe: true, hasAppToken: false, isTokenValid: false });

    const Wrapped = withAuthorization({ noDashboardToken: <p>no token</p> })(BaseComponent);
    render(<Wrapped />);

    expect(screen.getByText("no token")).toBeDefined();
  });

  it("renders the dashboardTokenInvalid fallback when the token is invalid", () => {
    setState({ mounted: true, inIframe: true, hasAppToken: true, isTokenValid: false });

    const Wrapped = withAuthorization({ dashboardTokenInvalid: <p>invalid token</p> })(
      BaseComponent,
    );
    render(<Wrapped />);

    expect(screen.getByText("invalid token")).toBeDefined();
  });

  it("falls back to the default error screens when no overrides are provided", () => {
    setState({ mounted: true, inIframe: false, hasAppToken: true, isTokenValid: true });

    const Wrapped = withAuthorization()(BaseComponent);
    render(<Wrapped />);

    expect(screen.getByText("The view can only be displayed inside iframe.")).toBeDefined();
  });
});
