// Lightweight helper to build a Stripe PaymentIntent payload for GBP
// This file is intentionally dependency-free so it can be used as an example

'use strict';

function buildStripePayload(amountInPounds, currency = 'GBP') {
  if (typeof amountInPounds !== 'number' || Number.isNaN(amountInPounds)) {
    throw new Error('amount must be a number (pounds)');
  }

  const currencyLower = String(currency).toLowerCase();
  if (currencyLower !== 'gbp') {
    throw new Error('This example enforces GBP as the currency');
  }

  // Stripe expects the amount in the smallest currency unit (pence)
  const amount = Math.round(amountInPounds * 100);

  const payload = {
    amount,
    currency: currencyLower,
    // metadata or description may be added here
  };

  return payload;
}

module.exports = { buildStripePayload };
