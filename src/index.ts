import path from 'path';
import fg from 'fast-glob';
import { print } from "graphql/language/printer";

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
export const dropFileExtension = (filename: string) => path.parse(filename).name;

export const inferWebhooks = async (baseURL: string, generatedGraphQL: any) => {
  const entries = await fg(["*.ts"], { cwd: "pages/api/webhooks" });

  return entries.map(dropFileExtension).map((name: string) => {
    const camelcaseName = name.split("-").map(capitalize).join("");

    const eventName = name.toUpperCase().replace(new RegExp("-", "g"), "_");
    let eventType: string;
    if (Object.values(generatedGraphQL.WebhookEventTypeAsyncEnum).includes(eventName)) {
      eventType = "asyncEvents";
    } else if (Object.values(generatedGraphQL.WebhookEventTypeSyncEnum).includes(eventName)) {
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