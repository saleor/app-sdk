type TransactionActions = "CHARGE" | "REFUND" | "CANCEL";

type _320TransactionWebhookResponsesMap = {
  // https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#response
  TRANSACTION_CHARGE_REQUESTED: {
    result: "CHARGE_SUCCESS" | "CHARGE_FAILURE";
    amount: number;
    pspReference?: string;
    time?: string;
    externalUrl?: string;
    message?: string;
    actions?: readonly TransactionActions[];
  };
  // https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#sync-flow-2
  TRANSACTION_REFUND_REQUESTED: {
    result: "REFUND_SUCCESS" | "REFUND_FAILURE";
    amount: number;
    pspReference?: string;
    time?: string;
    externalUrl?: string;
    message?: string;
    actions?: readonly TransactionActions[];
  };
  // https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#response-1
  TRANSACTION_CANCELATION_REQUESTED: {
    result: "CANCEL_SUCCESS" | "CANCEL_FAILURE";
    amount: number;
    pspReference?: string;
    time?: string;
    externalUrl?: string;
    message?: string;
    actions?: readonly TransactionActions[];
  };
  // https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#response-4
  TRANSACTION_INITIALIZE_SESSION: {
    result:
      | "CHARGE_SUCCESS"
      | "CHARGE_FAILURE"
      | "CHARGE_REQUEST"
      | "CHARGE_ACTION_REQUIRED"
      | "AUTHORIZATION_SUCCESS"
      | "AUTHORIZATION_FAILURE"
      | "AUTHORIZATION_REQUEST"
      | "AUTHORIZATION_ACTION_REQUIRED";
    amount?: number;
    pspReference?: string;
    data?: unknown;
    time?: string;
    externalUrl?: string;
    message?: string;
    actions?: readonly TransactionActions[];
  };
  // https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#response-5
  TRANSACTION_PROCESS_SESSION: {
    result:
      | "CHARGE_SUCCESS"
      | "CHARGE_FAILURE"
      | "CHARGE_REQUEST"
      | "CHARGE_ACTION_REQUIRED"
      | "AUTHORIZATION_SUCCESS"
      | "AUTHORIZATION_FAILURE"
      | "AUTHORIZATION_REQUEST"
      | "AUTHORIZATION_ACTION_REQUIRED";
    amount: number;
    pspReference?: string;
    data?: unknown;
    time?: string;
    externalUrl?: string;
    message?: string;
    actions?: readonly TransactionActions[];
  };
};

type _321TransactionWebhookResponsesMap = {
  // https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#response
  TRANSACTION_CHARGE_REQUESTED: {
    result: "CHARGE_SUCCESS" | "CHARGE_FAILURE";
    amount?: number;
    pspReference?: string;
    time?: string;
    externalUrl?: string;
    message?: string;
    actions?: readonly TransactionActions[];
  };
  // https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#sync-flow-2
  TRANSACTION_REFUND_REQUESTED: {
    result: "REFUND_SUCCESS" | "REFUND_FAILURE";
    amount?: number;
    pspReference?: string;
    time?: string;
    externalUrl?: string;
    message?: string;
    actions?: readonly TransactionActions[];
  };
  // https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#response-1
  TRANSACTION_CANCELATION_REQUESTED: {
    result: "CANCEL_SUCCESS" | "CANCEL_FAILURE";
    amount?: number;
    pspReference?: string;
    time?: string;
    externalUrl?: string;
    message?: string;
    actions?: readonly TransactionActions[];
  };
  // https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#response-4
  TRANSACTION_INITIALIZE_SESSION: {
    result:
      | "CHARGE_SUCCESS"
      | "CHARGE_FAILURE"
      | "CHARGE_REQUEST"
      | "CHARGE_ACTION_REQUIRED"
      | "AUTHORIZATION_SUCCESS"
      | "AUTHORIZATION_FAILURE"
      | "AUTHORIZATION_REQUEST"
      | "AUTHORIZATION_ACTION_REQUIRED";
    amount?: number;
    pspReference?: string;
    data?: unknown;
    time?: string;
    externalUrl?: string;
    message?: string;
    actions?: readonly TransactionActions[];
  };
  // https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#response-5
  TRANSACTION_PROCESS_SESSION: {
    result:
      | "CHARGE_SUCCESS"
      | "CHARGE_FAILURE"
      | "CHARGE_REQUEST"
      | "CHARGE_ACTION_REQUIRED"
      | "AUTHORIZATION_SUCCESS"
      | "AUTHORIZATION_FAILURE"
      | "AUTHORIZATION_REQUEST"
      | "AUTHORIZATION_ACTION_REQUIRED";
    amount?: number;
    pspReference?: string;
    data?: unknown;
    time?: string;
    externalUrl?: string;
    message?: string;
    actions?: readonly TransactionActions[];
  };
};

type CoreSyncWebhookResponses = {
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
  PAYMENT_GATEWAY_INITIALIZE_SESSION: {
    data: unknown;
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
      supportedPaymentFlows: Array<"INTERACTIVE">;
      type: string;
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
};

type SaleorVersion = "3.20" | "3.21";

type TransactionWebhookResponses<V extends SaleorVersion> = V extends "3.21"
  ? _321TransactionWebhookResponsesMap
  : _320TransactionWebhookResponsesMap;

export type SyncWebhookResponsesMap<V extends SaleorVersion = "3.20"> = CoreSyncWebhookResponses & {
  // those two are extracted here to avoid circular dependency of types
  ORDER_CALCULATE_TAXES: CoreSyncWebhookResponses["CHECKOUT_CALCULATE_TAXES"];
  ORDER_FILTER_SHIPPING_METHODS: CoreSyncWebhookResponses["CHECKOUT_FILTER_SHIPPING_METHODS"];
} & TransactionWebhookResponses<V>;

/**
 * Identity function, but it works on Typescript level to pick right payload based on first param
 */
export const buildSyncWebhookResponsePayload = <
  E extends keyof SyncWebhookResponsesMap<V>,
  V extends SaleorVersion = "3.20",
>(
  payload: SyncWebhookResponsesMap<V>[E],
): SyncWebhookResponsesMap<V>[E] => payload;
