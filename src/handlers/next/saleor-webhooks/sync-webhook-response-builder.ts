import { SyncWebhookEventType } from "../../../types";

/**
 * TODO Confirm with Saleor Core source (not the docs) to check if its 100% accurate
 */
export type SyncWebhookResponsesMap = {
  CHECKOUT_CALCULATE_TAXES: {
    shipping_price_gross_amount: number;
    shipping_price_net_amount: number;
    shipping_tax_rate: number;
    lines: Array<{
      total_gross_amount: number;
      total_net_amount: number;
      tax_rate: number;
    }>;
  };
  CHECKOUT_FILTER_SHIPPING_METHODS: {
    excluded_methods: Array<{
      id: string;
      reason?: string;
    }>;
  };
  ORDER_CALCULATE_TAXES: SyncWebhookResponsesMap["CHECKOUT_CALCULATE_TAXES"];
  ORDER_FILTER_SHIPPING_METHODS: SyncWebhookResponsesMap["CHECKOUT_FILTER_SHIPPING_METHODS"];
  SHIPPING_LIST_METHODS_FOR_CHECKOUT: Array<{
    id: string;
    name?: string;
    amount: number;
    currency: string; // or enum?
    maximum_delivery_days?: number;
  }>;
};

/**
 * Identity function, but it works on Typescript level to pick right payload based on first param
 */
export const buildSyncWebhookResponsePayload = <E extends SyncWebhookEventType>(
  payload: SyncWebhookResponsesMap[E]
): SyncWebhookResponsesMap[E] => payload;
