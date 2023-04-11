---
"@saleor/app-sdk": patch
---

processProtectedHandler no longer requires a full NextApiRequest object as an argument. Now only the `headers` property is required to satisfy the type safety.

Thanks to that, some requests like HTML <form> with tokens in BODY can be validated. Till now only fetch/ajax calls could have been validated
