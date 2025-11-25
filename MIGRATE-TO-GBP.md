Migration notes: Switch primary currency to GBP (pounds) — backend checklist

Purpose

This document lists the backend changes required when switching the app's primary currency from USD to GBP. The frontend now defaults to GBP in the payment service, but you must ensure backend/payment provider configuration and related systems fully support GBP.

Checklist

1. Stripe/Payment Provider

- Ensure your Stripe account is enabled for GBP payments. Some Stripe accounts require manual activation for certain currencies.
- Update server-side payment intent creation to use currency 'gbp' (lowercase) or accept the currency provided by the client.
- Ensure amounts are sent in the smallest currency unit (pence) — multiply GBP amounts by 100 before sending to Stripe.
- If storing or displaying amounts in the DB, note whether values are stored in pence or pounds and convert where necessary.
- Update plan/product objects in Stripe to reflect GBP prices and billing intervals if using Stripe Subscriptions.

2. Webhooks & Reconciliation

- Verify webhook handling (payment_intent.succeeded, invoice.payment_succeeded, charge.refunded) continues to work when currency is GBP — compare amounts and currencies in webhook payloads.
- Update any reconciliation scripts or export templates that assume USD formatting.

3. Backend API

- Update API endpoints that create payment intents/subscriptions to default to 'gbp' (or accept currency param from the client). Example pseudo-code:

  const amountInPence = Math.round(amount * 100);
  await stripe.paymentIntents.create({ amount: amountInPence, currency: 'gbp', metadata });

- Ensure any validation or permitted-currencies lists include 'gbp'.

4. Accounting & Reports

- Update reporting, accounting exports and CSV headers to indicate GBP and convert any USD-only logic.
- Confirm tax calculations if they depend on currency locale or thresholds.

5. Localization & Formatting

- Use en-GB locale when formatting GBP to display "£12.34" properly.
- Ensure server-generated receipts/invoices use correct locale and currency symbol.

6. Tests & Staging

- Add or update unit/integration tests that assert currency and amount values.
- Deploy changes to staging and run end-to-end tests using a Stripe test account configured for GBP.

7. Rollout Plan

- Coordinate a short maintenance window or deploy at low-traffic time.
- Monitor payments and webhooks closely for the first 24–48 hours.
- Have a rollback plan to revert to USD if critical issues arise.

Notes

- The frontend has been updated to default to GBP (see `src/services/paymentService.ts`). The PayPal client and PayPal options also need actual live client IDs set in environment variables or a secure vault.
- If you rely on historical USD data, consider adding a migration script/report to re-evaluate pricing and analytics.

If you'd like, I can prepare a small backend patch (example Node/Express snippet) to show exactly how to create a Stripe PaymentIntent in GBP and tests to validate behavior.
