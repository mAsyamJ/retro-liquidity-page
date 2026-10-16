import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderbookSpread,
  calculateDefaultPriceRange,
  generateDistributionBars,
  calculateDepositAmounts,
  formatUsd,
} from './liquidityMath.ts';

test('calculateOrderbookSpread accurately calculates spread and percent', () => {
  const result = calculateOrderbookSpread(2480.25, 2481.61);
  assert.equal(result.spread, 1.36);
  assert.equal(result.spreadPercent, 0.05);
});

test('calculateDefaultPriceRange generates valid bounds centered around price', () => {
  const currentPrice = 2480;
  const spotRange = calculateDefaultPriceRange(currentPrice, 'spot', 0.05);
  assert.ok(spotRange.minPrice < currentPrice);
  assert.ok(spotRange.maxPrice > currentPrice);
  assert.equal(spotRange.numOrders, 49);

  const curveRange = calculateDefaultPriceRange(currentPrice, 'curve', 0.05);
  assert.ok(curveRange.minPrice > spotRange.minPrice); // Curve is tighter
  assert.ok(curveRange.maxPrice < spotRange.maxPrice);
});

test('generateDistributionBars creates bids below and asks above current price', () => {
  const bars = generateDistributionBars(2450, 2510, 2480, 'spot', 20);
  assert.equal(bars.length, 20);
  const firstBar = bars[0];
  const lastBar = bars[bars.length - 1];
  assert.equal(firstBar.type, 'bid');
  assert.equal(lastBar.type, 'ask');
});

test('calculateDepositAmounts calculates symmetric requirements when price is mid-range', () => {
  const currentPrice = 2500;
  const minPrice = 2400;
  const maxPrice = 2600;
  const result = calculateDepositAmounts(0.1, 0, currentPrice, minPrice, maxPrice, 'base');
  assert.equal(result.baseRequired, 0.1);
  assert.equal(result.quoteRequired, 250); // 0.1 * 2500
  assert.equal(result.totalUsd, 500);
});

test('formatUsd formats values into clean K/M strings or dollar amounts', () => {
  assert.equal(formatUsd(1060000), '$1.06M');
  assert.equal(formatUsd(491000), '$491K');
  assert.equal(formatUsd(9590), '$9.59K');
  assert.equal(formatUsd(37900), '$37.9K');
  assert.equal(formatUsd(0), '$0');
});
