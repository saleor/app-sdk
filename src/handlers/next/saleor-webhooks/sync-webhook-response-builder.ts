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
  PAYMENT_METHOD_PROCESS_TOKENIZATION_SESSION:
    | {
        result: "SUCCESSFULLY_TOKENIZED";
        id: string;
        data: unknown;
      }
    | {
        result: "ADDITIONAL_ACTION_REQUIRED";
        id: string;
        data: unknown;
      }
    | {
        result: "PENDING";
        data: unknown;
      }
    | {
        result: "FAILED_TO_TOKENIZE";
        error: string;
      };
  PAYMENT_METHOD_INITIALIZE_TOKENIZATION_SESSION:
    | {
        result: "SUCCESSFULLY_TOKENIZED";
        id: string;
        data: unknown;
      }
    | {
        result: "ADDITIONAL_ACTION_REQUIRED";
        id: string;
        data: unknown;
      }
    | {
        result: "PENDING";
        data: unknown;
      }
    | {
        result: "FAILED_TO_TOKENIZE";
        error: string;
      };
  PAYMENT_GATEWAY_INITIALIZE_TOKENIZATION_SESSION:
    | {
        result: "SUCCESSFULLY_INITIALIZED";
        data: unknown;
      }
    | {
        result: "FAILED_TO_INITIALIZE";
        error: string;
      };
  STORED_PAYMENT_METHOD_DELETE_REQUESTED:
    | {
        result: "SUCCESSFULLY_DELETED";
      }
    | {
        result: "FAILED_TO_DELETE";
        error: string;
      };
  LIST_STORED_PAYMENT_METHODS: {
    paymentMethods: Array<{
      id: string;
      supportedPaymentFlows: Array<"INTERACTIVE">; // todo confirm
      type: string;
      // todo confirm which are optional, also numbers vs strings
      creditCardInfo?: {
        brand: string;
        lastDigits: string;
        expMonth: string;
        expYear: string;
        firstDigits?: string;
      };
      name?: string;
      data?: unknown;
    }>;
  };
  // todo
  PAYMENT_VOID: {};
  // todo
  PAYMENT_REFUND: {};
  PAYMENT_PROCESS:
    | {
        action_required: true;
        // todo verify
        action_required_data: {
          confirmation_url: "https://www.example.com/3ds-confirmation/";
        };
        customer_id: string;
        // todo - confirm if all required
        payment_method: {
          brand: string;
          exp_month: string;
          exp_year: string;
          last_4: string;
          name: string;
          type: string; // enum?
        };
        transaction_id: string;
      }
    | {
        action_required: false;
        kind: "auth"; // todo enum?
        customer_id: string;
        // todo - check if required all fields
        payment_method: {
          brand: string;
          exp_month: string;
          exp_year: string;
          last_4: string;
          name: string;
          type: string; // enum?
        };
        transaction_id: string;
      };
  PAYMENT_LIST_GATEWAYS: Array<{
    id: string;
    name: string;
    currencies: string[];
    config: unknown;
  }>;
  PAYMENT_CONFIRM: unknown; // todo
  PAYMENT_CAPTURE: unknown; // todo
  PAYMENT_AUTHORIZE: unknown; // todo
};

/**
 * Identity function, but it works on Typescript level to pick right payload based on first param
 */
export const buildSyncWebhookResponsePayload = <E extends SyncWebhookEventType>(
  payload: SyncWebhookResponsesMap[E]
): SyncWebhookResponsesMap[E] => payload;
