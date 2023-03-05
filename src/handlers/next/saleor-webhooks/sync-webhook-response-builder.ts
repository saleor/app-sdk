import { SyncWebhookEventType } from "../../../types";

/**
 * TODO Confirm with Saleor Core source (not the docs) to check if its 100% accurate
 */
type SyncWebhookResponsesMap = {
  CHECKOUT_CALCULATE_TAXES: {
    shipping_price_gross_amount: number;
    shipping_price_net_amount: number;
    shipping_tax_rate: string;
    lines: Array<{
      total_gross_amount: number;
      total_net_amount: number;
      tax_rate: string;
    }>;
  };
  CHECKOUT_FILTER_SHIPPING_METHODS: {
    excluded_methods: Array<{
      id: string;
      reason: string;
    }>;
  };
  ORDER_CALCULATE_TAXES: SyncWebhookResponsesMap["CHECKOUT_CALCULATE_TAXES"];
  ORDER_FILTER_SHIPPING_METHODS: SyncWebhookResponsesMap["CHECKOUT_FILTER_SHIPPING_METHODS"];
  /**
   * TODO
   */
  PAYMENT_AUTHORIZE: {};
  /**
   * TODO
   */
  PAYMENT_CAPTURE: {};
  /**
   * TODO
   */
  PAYMENT_CONFIRM: {};
  PAYMENT_LIST_GATEWAYS: Array<{
    id: string;
    name: string;
    currencies: string[]; // or enums?
    config?: Array<{
      field: string;
      value: string;
    }>;
  }>;
  PAYMENT_PROCESS: {
    action_required: true;
    action_required_data: {
      confirmation_url: "https://www.example.com/3ds-confirmation/";
    };
    customer_id: "customer-1234";
    payment_method: {
      brand: "Visa";
      exp_month: "01";
      exp_year: "2025";
      last_4: "4242";
      name: "John Doe";
      type: "Credit card";
    };
    transaction_id: "transaction-1234";
  };
  /**
   * TODO
   */
  PAYMENT_REFUND: {};
  /**
   * TODO
   */
  PAYMENT_VOID: {};
  SHIPPING_LIST_METHODS_FOR_CHECKOUT: Array<{
    id: string;
    name: string;
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
