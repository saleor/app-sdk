---
"@saleor/app-sdk": patch
---

processProtectedHandler no longer requires full NextApiRequest as an argument. It only needs headers now to check. Thanks to that, some requests like HTML <form> with tokens in BODY can be validated. Till now only fetch/ajax calls could have been validated
