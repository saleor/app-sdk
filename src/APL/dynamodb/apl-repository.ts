import { AuthData } from "@/APL";

export interface APLRepository {
  getEntry(args: { saleorApiUrl: string }): Promise<AuthData | null>;
  setEntry(args: { authData: AuthData }): Promise<void>;
  deleteEntry(args: { saleorApiUrl: string }): Promise<void>;
  getAllEntries(): Promise<AuthData[] | null>;
}
