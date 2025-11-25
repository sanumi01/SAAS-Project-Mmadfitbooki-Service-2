Stripe GBP example
==================

This small example shows how to convert an amount in pounds (GBP) to pence and build a payload suitable for creating a Stripe PaymentIntent.

How to run (from repository root):

1. Install dependencies for the example server (optional if you only want to run tests):

```powershell
cd server/stripe-gbp
npm install
```

2. Run the example server:

```powershell
npm start
# server will listen on http://localhost:4000
```

3. Run the small test (no test framework required):

```powershell
cd server/stripe-gbp
npm test
```

Notes:
- This example does not call Stripe's API. Replace the `buildStripePayload` usage with a real `stripe.paymentIntents.create(...)` call and securely store your Stripe secret key when integrating.
