import { SyncWebhookEventType } from "../../../types";

/**
 * TODO implement types
 */
const SyncWebhookResponsesMap = {
  "CHECKOUT_CALCULATE_TAXES": {
    foo :"bar"
  },
  CHECKOUT_FILTER_SHIPPING_METHODS: {},
  ORDER_CALCULATE_TAXES: {},
  ORDER_FILTER_SHIPPING_METHODS: {},
  PAYMENT_AUTHORIZE: {},
  PAYMENT_CAPTURE: {},
  PAYMENT_CONFIRM: {},
  PAYMENT_LIST_GATEWAYS: {},
  PAYMENT_PROCESS: {},
  PAYMENT_REFUND: {},
  PAYMENT_VOID: {},
  SHIPPING_LIST_METHODS_FOR_CHECKOUT: {}

} satisfies Record<SyncWebhookEventType, object>

/**
 * Identity function, but it works on Typescript level to pick right payload based on first param
 */
export const buildSyncWebhookResponsePayload = <E extends  SyncWebhookEventType>(payload: typeof SyncWebhookResponsesMap[E]): typeof SyncWebhookResponsesMap[E] => payload
