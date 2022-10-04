import { useEffect, useState } from "react";

export const useIsMounted = (): boolean => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return mounted;
};
