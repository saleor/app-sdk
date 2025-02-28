import { SaleorSchemaVersion } from "@/types";

export const parseSchemaVersion = (
  rawVersion: string | undefined | null,
): SaleorSchemaVersion | null => {
  if (!rawVersion) {
    return null;
  }

  const [majorString, minorString] = rawVersion.split(".");
  const major = parseInt(majorString, 10);
  const minor = parseInt(minorString, 10);

  if (major && minor) {
    return [major, minor];
  }

  return null;
};
