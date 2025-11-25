// Example Express endpoint that demonstrates creating a Stripe PaymentIntent payload in GBP
// This example DOES NOT call Stripe directly; it shows the server-side conversion and payload

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { buildStripePayload } = require('./payments');

const app = express();
app.use(bodyParser.json());

app.post('/create-payment-intent', (req, res) => {
  try {
    const { amount, currency = 'GBP' } = req.body;
    // amount expected in pounds (number)
    const payload = buildStripePayload(Number(amount), currency);

    // In a real integration you'd call stripe.paymentIntents.create(payload)
    // and return the client secret. For this example we return the payload.
    res.json({ ok: true, payload });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Stripe GBP example server listening on http://localhost:${port}`));
}

module.exports = app;
