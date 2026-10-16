export interface Token {
  symbol: string;
  name: string;
  iconBg: string;
  iconColor: string;
  iconText?: string;
  address: string;
  decimals: number;
  price: number;
}

export interface PoolMarket {
  id: string; // e.g. "#00718"
  symbol: string; // e.g. "WETH / USDC"
  baseToken: Token;
  quoteToken: Token;
  marketAddress: string;
  tvl: number;
  volume24h: number;
  fees24h: number;
  poolApr: number;
  currentPrice: number;
  priceChange24h: number;
  sizePrecision: string;
  minSize: string;
  takerFeeBps: number;
  tickSize: string;
  pricePrecision: string;
  maxSize: string;
  makerFeeBps: number;
  kuruAmmSpread: string;
  verified: boolean;
}

export interface Vault {
  id: string;
  symbol: string;
  baseToken: Token;
  quoteToken: Token;
  apr: number;
  isBoosted: boolean;
  tvl: number;
  volume24h: number;
  managementFee: number;
  vaultAddress: string;
  lockupDays: number;
  description: string;
  historicalSimulation: {
    investedAgo: string;
    initialDepositUsd: number;
  };
}

export type VolatilityStrategy = 'spot' | 'curve' | 'bidask';

export interface StrategyOption {
  id: VolatilityStrategy;
  title: string;
  tagline: string;
  description: string;
}

export interface FeeTierOption {
  feePercent: number; // e.g. 0.05
  label: string;
  recommended?: boolean;
}

export interface LiquidityPosition {
  id: string;
  type: 'pool' | 'vault';
  marketId: string;
  marketSymbol: string;
  strategy?: VolatilityStrategy;
  feeTierPercent?: number;
  minPrice?: number;
  maxPrice?: number;
  currentPriceAtDeposit?: number;
  baseDeposited: number;
  quoteDeposited: number;
  baseTokenSymbol: string;
  quoteTokenSymbol: string;
  totalValueUsd: number;
  earnedFeesUsd: number;
  status: 'in-range' | 'out-of-range';
  createdAt: string;
}

export interface OrderbookRow {
  price: number;
  size: number;
  total: number;
  depthPercent: number; // 0 to 100 for background bar
  type: 'ask' | 'bid';
}
