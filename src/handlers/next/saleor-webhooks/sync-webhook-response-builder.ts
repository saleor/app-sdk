import { SyncWebhookEventType } from "../../../types";

const SyncResponsesMap = {
  "CHECKOUT_CALCULATE_TAXES": {
    foo :"bar"
  }
} satisfies Partial<Record<SyncWebhookEventType, object>> // todo implement all fields

type SyncResponseBuilder = <E extends "CHECKOUT_CALCULATE_TAXES">() => typeof SyncResponsesMap[E]