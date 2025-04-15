---
"@saleor/app-sdk": patch
---

Fixed `TRANSACTION_CHARGE_REQUESTED`, `TRANSACTION_REFUND_REQUESTED`, `TRANSACTION_CANCELATION_REQUESTED`, `TRANSACTION_INITIALIZE_SESSION` and `TRANSACTION_PROCESS_SESSION` webhook response builder params. After this change `buildSyncWebhookResponsePayload` for those events should be the same as in Saleor docs.
