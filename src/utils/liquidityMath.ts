export type VolatilityStrategy = 'spot' | 'curve' | 'bidask';

/**
 * Calculates order book spread and spread percentage.
 */
export function calculateOrderbookSpread(
  bestBid: number,
  bestAsk: number
): { spread: number; spreadPercent: number } {
  if (bestAsk <= 0 || bestBid <= 0) return { spread: 0, spreadPercent: 0 };
  const spread = Math.max(0, bestAsk - bestBid);
  const midPrice = (bestAsk + bestBid) / 2;
  const spreadPercent = midPrice > 0 ? (spread / midPrice) * 100 : 0;
  return {
    spread: Number(spread.toFixed(2)),
    spreadPercent: Number(spreadPercent.toFixed(2)),
  };
}

/**
 * Calculates default min/max prices based on strategy and fee tier.
 */
export function calculateDefaultPriceRange(
  currentPrice: number,
  strategy: VolatilityStrategy = 'spot',
  feeTierPercent: number = 0.05
): { minPrice: number; maxPrice: number; numOrders: number } {
  let rangePercent = 1.2; // default ~1.2% each way
  let numOrders = 49;

  if (strategy === 'spot') {
    rangePercent = 1.2 + feeTierPercent * 2;
    numOrders = 49;
  } else if (strategy === 'curve') {
    rangePercent = 0.6 + feeTierPercent;
    numOrders = 39;
  } else if (strategy === 'bidask') {
    rangePercent = 2.0 + feeTierPercent * 4;
    numOrders = 59;
  }

  const minPrice = Number((currentPrice * (1 - rangePercent / 100)).toFixed(2));
  const maxPrice = Number((currentPrice * (1 + rangePercent / 100)).toFixed(2));

  return { minPrice, maxPrice, numOrders };
}

export interface DistributionBar {
  price: number;
  type: 'bid' | 'ask';
  heightPercent: number; // 0 to 100
  size: number;
  label: string;
}

/**
 * Generates the order book visual distribution bars (like in Kuru's Step 2).
 */
export function generateDistributionBars(
  minPrice: number,
  maxPrice: number,
  currentPrice: number,
  strategy: VolatilityStrategy = 'spot',
  totalBars: number = 24
): DistributionBar[] {
  const bars: DistributionBar[] = [];
  const step = (maxPrice - minPrice) / (totalBars - 1);

  for (let i = 0; i < totalBars; i++) {
    const price = Number((minPrice + i * step).toFixed(2));
    const isBid = price < currentPrice;
    const type: 'bid' | 'ask' = isBid ? 'bid' : 'ask';

    let weight = 1;
    const normDist = Math.abs(price - currentPrice) / (maxPrice - minPrice || 1);

    if (strategy === 'spot') {
      // Flat / uniform distribution with slight random micro variation
      weight = 0.85 + Math.sin(i * 1.5) * 0.08;
    } else if (strategy === 'curve') {
      // Gaussian / bell curve concentrated around current price
      weight = Math.exp(-Math.pow(normDist * 3, 2));
    } else if (strategy === 'bidask') {
      // Bimodal / steeper on extremes
      weight = 0.4 + normDist * 0.8;
    }

    const heightPercent = Math.min(100, Math.max(20, Math.round(weight * 85)));
    const size = Number((0.02 * (heightPercent / 100)).toFixed(4));

    bars.push({
      price,
      type,
      heightPercent,
      size,
      label: price.toFixed(2),
    });
  }

  return bars;
}

/**
 * Calculates required opposite side deposit for a balanced or single-sided position in CLOB AMM.
 */
export function calculateDepositAmounts(
  baseInput: number,
  quoteInput: number,
  currentPrice: number,
  minPrice: number,
  maxPrice: number,
  activeInput: 'base' | 'quote'
): { baseRequired: number; quoteRequired: number; baseUsd: number; quoteUsd: number; totalUsd: number } {
  // If price is completely below minPrice, 100% quote
  // If price is completely above maxPrice, 100% base
  // If inside range, proportional to position within range
  let baseRequired = 0;
  let quoteRequired = 0;

  if (currentPrice <= minPrice) {
    // Current price below range: requires 100% quote
    if (activeInput === 'quote') {
      quoteRequired = quoteInput;
      baseRequired = 0;
    } else {
      baseRequired = 0;
      quoteRequired = baseInput * currentPrice;
    }
  } else if (currentPrice >= maxPrice) {
    // Current price above range: requires 100% base
    if (activeInput === 'base') {
      baseRequired = baseInput;
      quoteRequired = 0;
    } else {
      quoteRequired = 0;
      baseRequired = quoteInput / currentPrice;
    }
  } else {
    // In range: balanced between bids and asks
    const bidRange = currentPrice - minPrice;
    const askRange = maxPrice - currentPrice;
    const ratio = askRange / (bidRange || 1);

    if (activeInput === 'base') {
      baseRequired = baseInput;
      quoteRequired = baseInput * currentPrice * (1 / (ratio || 1));
    } else {
      quoteRequired = quoteInput;
      baseRequired = (quoteInput / currentPrice) * ratio;
    }
  }

  const baseUsd = baseRequired * currentPrice;
  const quoteUsd = quoteRequired; // 1 USDC = $1
  const totalUsd = baseUsd + quoteUsd;

  return {
    baseRequired: Number(baseRequired.toFixed(8)),
    quoteRequired: Number(quoteRequired.toFixed(6)),
    baseUsd: Number(baseUsd.toFixed(2)),
    quoteUsd: Number(quoteUsd.toFixed(2)),
    totalUsd: Number(totalUsd.toFixed(2)),
  };
}

/**
 * Formats USD currency.
 */
export function formatUsd(val: number): string {
  if (val === 0) return '$0';
  if (val >= 1_000_000) {
    const formatted = (val / 1_000_000).toFixed(2).replace(/\.00$/, '');
    return `$${formatted}M`;
  }
  if (val >= 1_000) {
    const formatted = (val / 1_000).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
    return `$${formatted}K`;
  }
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Formats numbers with commas and reasonable precision.
 */
export function formatNumber(val: number, maxDecimals: number = 4): string {
  if (isNaN(val)) return '0';
  return val.toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals,
  });
}
