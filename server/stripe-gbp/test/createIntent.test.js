const assert = require('assert');
const { buildStripePayload } = require('../payments');

function testBuildPayload() {
  // happy path: 12.34 pounds -> 1234 pence
  const payload = buildStripePayload(12.34, 'GBP');
  assert.strictEqual(payload.amount, 1234);
  assert.strictEqual(payload.currency, 'gbp');

  // rounding: 12.345 -> 1235
  const payload2 = buildStripePayload(12.345, 'GBP');
  assert.strictEqual(payload2.amount, 1235);

  // invalid currency should throw
  let threw = false;
  try {
    buildStripePayload(10, 'USD');
  } catch (err) {
    threw = true;
  }
  assert.ok(threw, 'Expected error when using non-GBP currency');

  console.log('createIntent.test.js: all tests passed');
}

testBuildPayload();
