import { SaleorSchemaVersion } from "@/types";

const cantParseError = new Error("Cant parse Saleor schema version");

export const parseSchemaVersion = (rawVersion: string | undefined | null): SaleorSchemaVersion => {
  try {
    if (!rawVersion) {
      throw cantParseError;
    }

    const [majorString, minorString] = rawVersion.split(".");
    const major = parseInt(majorString, 10);
    const minor = parseInt(minorString, 10);

    if (major && minor) {
      return [major, minor];
    }
  } catch (e) {
    throw cantParseError;
  }

  throw cantParseError;
};
