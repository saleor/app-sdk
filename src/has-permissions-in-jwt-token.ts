import { createDebug } from "./debug";
import { Permission } from "./types";
import { DashboardTokenPayload } from "./verify-jwt";

const debug = createDebug("checkJwtPermissions");

export const hasPermissionsInJwtToken = (
  tokenData?: Pick<DashboardTokenPayload, "user_permissions">,
  permissionsToCheckAgainst?: Permission[]
) => {
  debug(`Permissions required ${permissionsToCheckAgainst}`);

  if (!permissionsToCheckAgainst?.length) {
    debug("No permissions specified, check passed");
    return true;
  }

  const userPermissions = tokenData?.user_permissions || undefined;

  if (!userPermissions?.length) {
    debug("User has no permissions assigned. Rejected");
    return false;
  }

  const arePermissionsSatisfied = permissionsToCheckAgainst.every((permission) =>
    userPermissions.includes(permission)
  );

  if (!arePermissionsSatisfied) {
    debug("Permissions check not passed");
    return false;
  }

  debug("Permissions check successful");
  return true;
};
