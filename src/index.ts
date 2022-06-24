import path from "path";
import fg from "fast-glob";

import { print } from "graphql/language/printer.js";

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const dropFileExtension = (filename: string) => path.parse(filename).name;

export const inferWebhooks = async (
  baseURL: string,
  webhooksPath: string,
  generatedGraphQL: any
) => {
  let entries;
  if (process.env.NODE_ENV === "production") {
    entries = await fg(["*.js"], { cwd: `${__dirname}/${webhooksPath}` });
  } else {
    entries = await fg(["*.ts"], { cwd: webhooksPath });
  }

  return entries.map(dropFileExtension).map((name: string) => {
    const camelcaseName = name.split("-").map(capitalize).join("");

    const eventName = name.toUpperCase().replace(new RegExp("-", "g"), "_");
    let eventType: string;
    if (
      Object.values(generatedGraphQL.WebhookEventTypeAsyncEnum).includes(
        eventName
      )
    ) {
      eventType = "asyncEvents";
    } else if (
      Object.values(generatedGraphQL.WebhookEventTypeSyncEnum).includes(
        eventName
      )
    ) {
      eventType = "syncEvents";
    } else {
      throw Error("Event type not found.");
    }

    const statement = `${camelcaseName}SubscriptionDocument`;
    let query: string;
    if (statement in generatedGraphQL) {
      query = print((generatedGraphQL as any)[statement]);
    } else {
      throw Error("Subscription not found.");
    }

    return {
      name,
      [eventType]: [eventName],
      query,
      targetUrl: `${baseURL}/api/webhooks/${name}`,
    };
  });
};
