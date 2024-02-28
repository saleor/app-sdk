export const parseSchemaVersion = (versionField: string | undefined | null): number | null => {
  if (!versionField) {
    return null;
  }

  const [major, minor] = versionField.split(".");
  if (major && minor) {
    return parseFloat(`${major}.${minor}`);
  }

  return null;
};
