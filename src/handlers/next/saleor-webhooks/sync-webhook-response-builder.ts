import { SyncWebhookEventType } from "../../../types";

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
  // TODO: Update types for the payment responses
  PAYMENT_AUTHORIZE: { data: unknown };
  PAYMENT_CAPTURE: { data: unknown };
  PAYMENT_CONFIRM: { data: unknown };
  PAYMENT_LIST_GATEWAYS: { data: unknown };
  PAYMENT_PROCESS: { data: unknown };
  PAYMENT_REFUND: { data: unknown };
  PAYMENT_VOID: { data: unknown };
  SHIPPING_LIST_METHODS_FOR_CHECKOUT: Array<{
    id: string;
    name?: string;
    amount: number;
    currency: string; // or enum?
    /**
     * Integer
     */
    maximum_delivery_days?: number;
  }>;
  TRANSACTION_CHARGE_REQUESTED: {
    pspReference: string;
    result?: "CHARGE_SUCCESS" | "CHARGE_FAILURE";
    amount?: number;
    time?: string;
    externalUrl?: string;
    message?: string;
  };
  TRANSACTION_REFUND_REQUESTED: {
    pspReference: string;
    result?: "REFUND_SUCCESS" | "REFUND_FAILURE";
    amount?: number;
    time?: string;
    externalUrl?: string;
    message?: string;
  };
  TRANSACTION_CANCELATION_REQUESTED: {
    pspReference: string;
    result?: "CANCEL_SUCCESS" | "CANCEL_FAILURE";
    amount?: number;
    time?: string;
    externalUrl?: string;
    message?: string;
  };
  PAYMENT_GATEWAY_INITIALIZE_SESSION: {
    data: unknown;
  };
  TRANSACTION_INITIALIZE_SESSION: {
    pspReference?: string;
    data?: unknown;
    result:
      | "CHARGE_SUCCESS"
      | "CHARGE_FAILURE"
      | "CHARGE_REQUESTED"
      | "CHARGE_ACTION_REQUIRED"
      | "AUTHORIZATION_SUCCESS"
      | "AUTHORIZATION_FAILURE"
      | "AUTHORIZATION_REQUESTED"
      | "AUTHORIZATION_ACTION_REQUIRED";
    amount: number;
    time?: string;
    externalUrl?: string;
    message?: string;
  };
  TRANSACTION_PROCESS_SESSION: {
    pspReference?: string;
    data?: unknown;
    result:
      | "CHARGE_SUCCESS"
      | "CHARGE_FAILURE"
      | "CHARGE_REQUESTED"
      | "CHARGE_ACTION_REQUIRED"
      | "AUTHORIZATION_SUCCESS"
      | "AUTHORIZATION_FAILURE"
      | "AUTHORIZATION_REQUESTED"
      | "AUTHORIZATION_ACTION_REQUIRED";
    amount: number;
    time?: string;
    externalUrl?: string;
    message?: string;
  };
};

/**
 * Identity function, but it works on Typescript level to pick right payload based on first param
 */
export const buildSyncWebhookResponsePayload = <E extends SyncWebhookEventType>(
  payload: SyncWebhookResponsesMap[E]
): SyncWebhookResponsesMap[E] => payload;
