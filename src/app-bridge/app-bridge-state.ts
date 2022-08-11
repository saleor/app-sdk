import { ThemeType } from "./events";

export type AppBridgeState = {
  token?: string;
  id: string;
  ready: boolean;
  domain: string;
  path: string;
  theme: ThemeType;
};

export class AppBridgeStateContainer {
  private state: AppBridgeState = {
    id: "",
    domain: "",
    ready: false,
    path: "/",
    theme: "light",
  };

  getState() {
    return this.state;
  }

  setState(newState: Partial<AppBridgeState>) {
    this.state = {
      ...this.state,
      ...newState,
    };

    return this.state;
  }
}
