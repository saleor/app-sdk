import { NextApiRequest } from "next";

export const getBaseURL = (req: NextApiRequest) => {
  const { host, "x-forwarded-proto": protocol = "http" } = req.headers;
  if (protocol && host) {
    return `${protocol}://${host}`;
  }
  return undefined;
};
