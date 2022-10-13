import { NextPage } from "next";
import * as React from "react";
import { PropsWithChildren, ReactNode } from "react";

import { isInIframe, useIsMounted } from "../util";
import { useDashboardToken } from "./use-dashboard-token";

function SimpleError({ children }: PropsWithChildren<{}>) {
  return (
    <div style={{ padding: 32, color: "red" }}>
      <p>{children}</p>
    </div>
  );
}

type Props = {
  unmounted?: ReactNode;
  notIframe?: ReactNode;
  noDashboardToken?: ReactNode;
  dashboardTokenInvalid?: ReactNode;
};

const defaultProps: Props = {
  dashboardTokenInvalid: <SimpleError>Dashboard token is invalid</SimpleError>,
  noDashboardToken: <SimpleError>Dashboard token doesn&quot;t exist</SimpleError>,
  notIframe: <SimpleError>The view can only be displayed inside iframe.</SimpleError>,
  unmounted: <p>Loading</p>,
};

type WithAuthorizationHOC<P> = React.FunctionComponent<P> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

/**
 * Most likely, views from your app will be only accessibly inside Dashboard iframe.
 * This HOC can be used to handle all checks, with default messages included.
 * Each error screen can be passed into HOC factory
 *
 * If screen can be accessible outside Dashboard - omit this HOC on this page
 * */
export const withAuthorization =
  (props: Props = defaultProps) =>
  <BaseProps extends React.ComponentProps<NextPage>>(
    BaseComponent: React.FunctionComponent<BaseProps>
  ): WithAuthorizationHOC<BaseProps> => {
    const { dashboardTokenInvalid, noDashboardToken, notIframe, unmounted } = {
      ...defaultProps,
      ...props,
    };

    function AuthorizedPage(innerProps: BaseProps) {
      const mounted = useIsMounted();
      const { isTokenValid, hasAppToken } = useDashboardToken();

      if (!mounted) {
        return unmounted;
      }

      if (!isInIframe()) {
        return notIframe;
      }

      if (!hasAppToken) {
        return noDashboardToken;
      }

      if (!isTokenValid) {
        return dashboardTokenInvalid;
      }

      return <BaseComponent {...innerProps} />;
    }

    return AuthorizedPage as WithAuthorizationHOC<BaseProps>;
  };
