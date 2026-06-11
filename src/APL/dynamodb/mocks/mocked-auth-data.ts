import { AuthData } from "@/APL";

export const mockedAuthData = {
  appId: "app-id-1",
  saleorApiUrl: "http://localhost:8080/graphql/",
  token: "mock-app-token",
  updatedAt: new Date(2020, 1, 1),
} satisfies AuthData;
