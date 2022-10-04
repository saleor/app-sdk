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

export const withAuthorization =
  ({
    dashboardTokenInvalid = <SimpleError>Dashboard token is invalid</SimpleError>,
    noDashboardToken = <SimpleError>Dashboard token doesn&quot;t exist</SimpleError>,
    notIframe = <SimpleError>The view can only be displayed inside iframe.</SimpleError>,
    unmounted = <p>Loading</p>,
  }: Props) =>
  <BaseProps extends React.ComponentProps<NextPage>>(
    BaseComponent: React.FunctionComponent<BaseProps>
  ) => {
    function AuthorizedPage(props: BaseProps) {
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

      return <BaseComponent {...props} />;
    }

    return AuthorizedPage;
  };
