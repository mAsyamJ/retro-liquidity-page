import React, { useState } from 'react';
import {
  ChevronRight,
  Copy,
  ExternalLink,
  Plus,
  ArrowLeftRight,
  Check,
  ChevronDown,
  Info,
} from 'lucide-react';
import { PoolMarket, OrderbookRow, LiquidityPosition } from '../types/index.ts';
import {
  WETH_ORDERBOOK_ASKS,
  WETH_ORDERBOOK_BIDS,
  SAMPLE_PRICE_HISTORY,
  SAMPLE_VOLUME_HISTORY,
} from '../data/mockData.ts';
import { formatUsd } from '../utils/liquidityMath.ts';

interface PoolDetailProps {
  pool: PoolMarket;
  positions: LiquidityPosition[];
  onBackToMarkets: () => void;
  onOpenAddLiquidity: () => void;
  onWithdrawPosition: (id: string) => void;
}

export const PoolDetail: React.FC<PoolDetailProps> = ({
  pool,
  positions,
  onBackToMarkets,
  onOpenAddLiquidity,
  onWithdrawPosition,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'positions'>('details');
  const [chartMode, setChartMode] = useState<'price' | 'volume'>('price');
  const [timeframe, setTimeframe] = useState<string>('1H');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [tickPrecision, setTickPrecision] = useState('0.01');
  const [sizeUnit, setSizeUnit] = useState(pool.baseToken.symbol);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ label: string; val: number } | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const poolPositions = positions.filter((p) => p.marketId === pool.id);

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 280;
  const padding = { top: 20, right: 60, bottom: 30, left: 20 };

  const prices = SAMPLE_PRICE_HISTORY.map((d) => d.price);
  const minPrice = Math.min(...prices) * 0.999;
  const maxPrice = Math.max(...prices) * 1.001;

  // Build SVG path for smooth price area
  const getPriceX = (index: number) =>
    padding.left + (index / (SAMPLE_PRICE_HISTORY.length - 1)) * (chartWidth - padding.left - padding.right);
  const getPriceY = (val: number) =>
    chartHeight - padding.bottom - ((val - minPrice) / (maxPrice - minPrice || 1)) * (chartHeight - padding.top - padding.bottom);

  let pathD = `M ${getPriceX(0)} ${getPriceY(SAMPLE_PRICE_HISTORY[0].price)}`;
  for (let i = 1; i < SAMPLE_PRICE_HISTORY.length; i++) {
    const prevX = getPriceX(i - 1);
    const prevY = getPriceY(SAMPLE_PRICE_HISTORY[i - 1].price);
    const currX = getPriceX(i);
    const currY = getPriceY(SAMPLE_PRICE_HISTORY[i].price);
    const cpX = (prevX + currX) / 2;
    pathD += ` C ${cpX} ${prevY}, ${cpX} ${currY}, ${currX} ${currY}`;
  }
  const areaD = `${pathD} L ${getPriceX(SAMPLE_PRICE_HISTORY.length - 1)} ${chartHeight - padding.bottom} L ${getPriceX(0)} ${chartHeight - padding.bottom} Z`;

  // Volume chart calculations
  const maxVol = Math.max(...SAMPLE_VOLUME_HISTORY.map((v) => v.volume));

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 py-6 text-white">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#71768c] mb-6">
        <button
          onClick={onBackToMarkets}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Markets
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#525667]" />
        <span className="text-white font-medium">{pool.symbol}</span>
      </nav>

      {/* Header Bar: Market Identity + Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1f212d]">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Overlapping Token Icons */}
          <div className="flex -space-x-2.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white border-2 border-[#0c0d10] shadow-md"
              style={{ backgroundColor: pool.baseToken.iconBg }}
            >
              {pool.baseToken.iconText || pool.baseToken.symbol[0]}
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white border-2 border-[#0c0d10] shadow-md"
              style={{ backgroundColor: pool.quoteToken.iconBg }}
            >
              {pool.quoteToken.iconText || pool.quoteToken.symbol[0]}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">{pool.symbol}</h1>
              <span className="bg-[#1b1d28] text-[#8e92a4] border border-[#262838] text-xs font-mono px-2 py-0.5 rounded-lg">
                ID: {pool.id}
              </span>
              <button
                onClick={() => copyToClipboard(pool.marketAddress)}
                className="flex items-center gap-1.5 bg-[#171822] hover:bg-[#1f202d] border border-[#262838] text-xs text-[#8e92a4] hover:text-white px-2.5 py-1 rounded-lg transition-colors font-mono"
                title="Copy Market Contract Address"
              >
                <span>{pool.marketAddress.slice(0, 6)}...{pool.marketAddress.slice(-4)}</span>
                {copiedAddress ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Action CTAs: + Add Liquidity & Trade */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddLiquidity}
            className="flex items-center gap-2 bg-[#b4f04c] hover:bg-[#c2f85b] text-black font-semibold text-xs px-4 py-2.5 rounded-full shadow-lg transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add liquidity</span>
          </button>
          <button
            onClick={() => alert(`Redirecting to Trade interface for ${pool.symbol}`)}
            className="flex items-center gap-2 bg-[#1b1d28] hover:bg-[#242636] text-white border border-[#2b2d3d] font-semibold text-xs px-4 py-2.5 rounded-full transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Trade</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-[#1f212d] mt-4 mb-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'details' ? 'text-white' : 'text-[#707489] hover:text-white'
          }`}
        >
          Details
          {activeTab === 'details' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
          )}
        </button>
        <button
          onClick={onOpenAddLiquidity}
          className="pb-3 text-[#707489] hover:text-white transition-colors"
        >
          Add Liquidity
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`pb-3 relative transition-colors flex items-center gap-2 ${
            activeTab === 'positions' ? 'text-white' : 'text-[#707489] hover:text-white'
          }`}
        >
          Your positions
          {poolPositions.length > 0 && (
            <span className="bg-[#1d2d1f] text-[#b4f04c] border border-[#2a4d2c] text-[10px] px-1.5 py-0.5 rounded-full">
              {poolPositions.length}
            </span>
          )}
          {activeTab === 'positions' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
          )}
        </button>
      </div>

      {/* Tab: Details */}
      {activeTab === 'details' && (
        <div className="space-y-8">
          {/* Main Grid: Chart on Left, CLOB Orderbook on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Interactive Chart */}
            <div className="lg:col-span-8 bg-[#121319] border border-[#202230] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                {/* Chart Mode Controls: Price vs Volume */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 bg-[#171822] p-1 rounded-full border border-[#242634]">
                    <button
                      onClick={() => setChartMode('price')}
                      className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
                        chartMode === 'price' ? 'bg-[#252838] text-white shadow' : 'text-[#82869c] hover:text-white'
                      }`}
                    >
                      Price
                    </button>
                    <button
                      onClick={() => setChartMode('volume')}
                      className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
                        chartMode === 'volume' ? 'bg-[#252838] text-white shadow' : 'text-[#82869c] hover:text-white'
                      }`}
                    >
                      Volume
                    </button>
                  </div>

                  <div className="text-right text-xs text-[#707489]">
                    Kuru CLOB Index
                  </div>
                </div>

                {/* Primary Metric Display */}
                <div className="mb-4">
                  {chartMode === 'price' ? (
                    <div>
                      <div className="text-2xl font-extrabold tracking-tight font-mono text-white">
                        {hoveredDataPoint ? `${hoveredDataPoint.val.toFixed(2)} USDC/WETH` : '2.68K USDC/WETH'}
                      </div>
                      <div className="text-xs text-[#8e92a4] mt-0.5">
                        {hoveredDataPoint ? hoveredDataPoint.label : 'Current price'}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl font-extrabold tracking-tight font-mono text-white">
                        {hoveredDataPoint ? `${hoveredDataPoint.val.toFixed(1)}K USDC` : '66.5K USDC'}
                      </div>
                      <div className="text-xs text-[#8e92a4] mt-0.5">
                        {hoveredDataPoint ? hoveredDataPoint.label : 'Total volume'}
                      </div>
                    </div>
                  )}
                </div>

                {/* SVG Chart Render */}
                <div className="relative w-full overflow-hidden">
                  {chartMode === 'price' ? (
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      className="w-full h-64 overflow-visible"
                    >
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#4ade80" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line
                        x1={padding.left}
                        y1={padding.top}
                        x2={chartWidth - padding.right}
                        y2={padding.top}
                        stroke="#1f212f"
                        strokeDasharray="4 4"
                      />
                      <line
                        x1={padding.left}
                        y1={chartHeight / 2}
                        x2={chartWidth - padding.right}
                        y2={chartHeight / 2}
                        stroke="#1f212f"
                        strokeDasharray="4 4"
                      />
                      <line
                        x1={padding.left}
                        y1={chartHeight - padding.bottom}
                        x2={chartWidth - padding.right}
                        y2={chartHeight - padding.bottom}
                        stroke="#1f212f"
                      />

                      {/* Area Fill */}
                      <path d={areaD} fill="url(#priceGradient)" />

                      {/* Price Line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Y-axis Labels on Right */}
                      <text
                        x={chartWidth - padding.right + 10}
                        y={padding.top + 5}
                        fill="#707489"
                        fontSize="11"
                        fontFamily="monospace"
                      >
                        2,499.9
                      </text>
                      <text
                        x={chartWidth - padding.right + 10}
                        y={chartHeight / 2}
                        fill="#707489"
                        fontSize="11"
                        fontFamily="monospace"
                      >
                        2,474.0
                      </text>
                      <text
                        x={chartWidth - padding.right + 10}
                        y={chartHeight - padding.bottom}
                        fill="#707489"
                        fontSize="11"
                        fontFamily="monospace"
                      >
                        2,448.1
                      </text>

                      {/* X-axis Time Labels */}
                      {SAMPLE_PRICE_HISTORY.filter((_, idx) => idx % 3 === 0).map((d, i) => {
                        const originalIndex = i * 3;
                        return (
                          <text
                            key={d.time}
                            x={getPriceX(originalIndex)}
                            y={chartHeight - 8}
                            fill="#707489"
                            fontSize="11"
                            textAnchor="middle"
                          >
                            {d.time}
                          </text>
                        );
                      })}

                      {/* Interactive Hover Dots */}
                      {SAMPLE_PRICE_HISTORY.map((d, i) => (
                        <circle
                          key={d.time}
                          cx={getPriceX(i)}
                          cy={getPriceY(d.price)}
                          r="6"
                          className="opacity-0 hover:opacity-100 fill-[#b4f04c] stroke-black stroke-2 cursor-pointer transition-opacity"
                          onMouseEnter={() => setHoveredDataPoint({ label: `At ${d.time}`, val: d.price })}
                          onMouseLeave={() => setHoveredDataPoint(null)}
                        />
                      ))}
                    </svg>
                  ) : (
                    /* Volume Histogram matching Screenshot 3 */
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      className="w-full h-64 overflow-visible"
                    >
                      {/* Horizontal Grid lines */}
                      <line
                        x1={padding.left}
                        y1={padding.top}
                        x2={chartWidth - padding.right}
                        y2={padding.top}
                        stroke="#1f212f"
                        strokeDasharray="4 4"
                      />
                      <line
                        x1={padding.left}
                        y1={chartHeight / 2}
                        x2={chartWidth - padding.right}
                        y2={chartHeight / 2}
                        stroke="#1f212f"
                        strokeDasharray="4 4"
                      />

                      {/* Volume Bars */}
                      {SAMPLE_VOLUME_HISTORY.map((v, i) => {
                        const barWidth = 14;
                        const x = getPriceX(i) - barWidth / 2;
                        const barHeight = ((v.volume / maxVol) * (chartHeight - padding.top - padding.bottom)) || 4;
                        const y = chartHeight - padding.bottom - barHeight;
                        return (
                          <g key={v.time}>
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              rx="3"
                              className="fill-[#b4f04c] hover:fill-[#d2ff7b] transition-colors cursor-pointer"
                              onMouseEnter={() => setHoveredDataPoint({ label: `Volume at ${v.time}`, val: v.volume })}
                              onMouseLeave={() => setHoveredDataPoint(null)}
                            />
                            {i % 3 === 0 && (
                              <text
                                x={getPriceX(i)}
                                y={chartHeight - 8}
                                fill="#707489"
                                fontSize="11"
                                textAnchor="middle"
                              >
                                {v.time}
                              </text>
                            )}
                          </g>
                        );
                      })}

                      {/* Volume Y-axis labels */}
                      <text
                        x={chartWidth - padding.right + 10}
                        y={padding.top + 5}
                        fill="#707489"
                        fontSize="11"
                        fontFamily="monospace"
                      >
                        28.9K
                      </text>
                      <text
                        x={chartWidth - padding.right + 10}
                        y={chartHeight / 2}
                        fill="#707489"
                        fontSize="11"
                        fontFamily="monospace"
                      >
                        14.4K
                      </text>
                      <text
                        x={chartWidth - padding.right + 10}
                        y={chartHeight - padding.bottom}
                        fill="#707489"
                        fontSize="11"
                        fontFamily="monospace"
                      >
                        0
                      </text>
                    </svg>
                  )}
                </div>
              </div>

              {/* Timeframe selector bar on bottom */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1e202c] mt-4 flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  {['1H', '1D', '1W', '1M', '3M', '6M', '1Y', 'All'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                        timeframe === tf
                          ? 'bg-[#1f212f] text-white border border-[#2d3042]'
                          : 'text-[#707489] hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 bg-[#171822] border border-[#232533] text-xs text-[#a0a4b8] px-3 py-1 rounded-lg hover:text-white">
                    <span>Native</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right 4 cols: CLOB Orderbook */}
            <div className="lg:col-span-4 bg-[#121319] border border-[#202230] rounded-2xl p-5 flex flex-col justify-between">
              <div>
                {/* Orderbook Header Controls */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1f212d]">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTickPrecision(tickPrecision === '0.01' ? '0.1' : '0.01')}
                      className="flex items-center gap-1 text-xs text-[#9ea3ba] hover:text-white bg-[#181923] border border-[#242636] px-2 py-1 rounded-lg"
                    >
                      <span>{tickPrecision}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSizeUnit(sizeUnit === 'WETH' ? 'USDC' : 'WETH')}
                      className="flex items-center gap-1 text-xs text-[#9ea3ba] hover:text-white bg-[#181923] border border-[#242636] px-2 py-1 rounded-lg"
                    >
                      <span>{sizeUnit}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-3 text-[11px] font-medium text-[#71768c] py-2">
                  <div>Price (USDC)</div>
                  <div className="text-right">Size</div>
                  <div className="text-right">Total</div>
                </div>

                {/* ASKS (Red) */}
                <div className="space-y-1">
                  {WETH_ORDERBOOK_ASKS.map((row) => (
                    <div
                      key={row.price}
                      className="relative grid grid-cols-3 text-xs py-1 px-1 rounded hover:bg-[#1a1b26] cursor-pointer font-mono group"
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-[#f45b69]/10 rounded-r"
                        style={{ width: `${row.depthPercent}%` }}
                      />
                      <span className="relative z-10 text-[#f87171] font-semibold">
                        {row.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="relative z-10 text-right text-[#a2a6be]">
                        {row.size}
                      </span>
                      <span className="relative z-10 text-right text-white">
                        {row.total}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Spread Divider */}
                <div className="flex items-center justify-between py-2.5 my-1 px-1 border-y border-[#1e202c] text-xs">
                  <span className="text-[#71768c]">Spread</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-[#d1d5db]">1.36</span>
                    <span className="text-[#71768c]">0.05%</span>
                  </div>
                </div>

                {/* BIDS (Green) */}
                <div className="space-y-1">
                  {WETH_ORDERBOOK_BIDS.map((row) => (
                    <div
                      key={row.price}
                      className="relative grid grid-cols-3 text-xs py-1 px-1 rounded hover:bg-[#1a1b26] cursor-pointer font-mono group"
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-[#4ade80]/10 rounded-r"
                        style={{ width: `${row.depthPercent}%` }}
                      />
                      <span className="relative z-10 text-[#4ade80] font-semibold">
                        {row.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="relative z-10 text-right text-[#a2a6be]">
                        {row.size}
                      </span>
                      <span className="relative z-10 text-right text-white">
                        {row.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1e202c] mt-3 text-[11px] text-[#6f7387] flex items-center justify-between">
                <span>Real-time CLOB stream</span>
                <span className="flex items-center gap-1 text-[#4ade80]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" /> Live
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Row (4 Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#121319] border border-[#202230] rounded-2xl p-6">
            <div className="text-center md:text-left">
              <div className="text-xs text-[#71768c] mb-1">APR (24h)</div>
              <div className="text-xl font-bold font-mono text-white">{pool.poolApr}%</div>
            </div>
            <div className="text-center md:text-left md:border-l md:border-[#1f212f] md:pl-6">
              <div className="text-xs text-[#71768c] mb-1">TVL</div>
              <div className="text-xl font-bold font-mono text-white">{formatUsd(pool.tvl)}</div>
            </div>
            <div className="text-center md:text-left md:border-l md:border-[#1f212f] md:pl-6">
              <div className="text-xs text-[#71768c] mb-1">Fees earned 24h</div>
              <div className="text-xl font-bold font-mono text-white">${pool.fees24h}</div>
            </div>
            <div className="text-center md:text-left md:border-l md:border-[#1f212f] md:pl-6">
              <div className="text-xs text-[#71768c] mb-1">24h volume</div>
              <div className="text-xl font-bold font-mono text-white">{formatUsd(pool.volume24h)}</div>
            </div>
          </div>

          {/* Addresses Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#121319] border border-[#202230] rounded-2xl p-6">
            <div>
              <div className="text-xs text-[#71768c] mb-1">Market ID</div>
              <div className="text-sm font-semibold font-mono text-white">{pool.id}</div>
            </div>
            <div>
              <div className="text-xs text-[#71768c] mb-1">Market address</div>
              <div className="text-sm font-semibold font-mono text-white">
                {pool.marketAddress.slice(0, 6)}...{pool.marketAddress.slice(-4)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#71768c] mb-1">{pool.baseToken.symbol}</div>
              <div className="text-sm font-semibold font-mono text-white">
                {pool.baseToken.address.slice(0, 6)}...{pool.baseToken.address.slice(-4)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#71768c] mb-1">{pool.quoteToken.symbol}</div>
              <div className="text-sm font-semibold font-mono text-white">
                {pool.quoteToken.address.slice(0, 6)}...{pool.quoteToken.address.slice(-4)}
              </div>
            </div>
          </div>

          {/* Market Info Grid */}
          <div className="bg-[#121319] border border-[#202230] rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-6">Market Info</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 text-xs">
              <div>
                <div className="text-[#71768c] mb-1">Size precision</div>
                <div className="text-sm font-bold font-mono text-white">{pool.sizePrecision}</div>
              </div>
              <div>
                <div className="text-[#71768c] mb-1">Min size</div>
                <div className="text-sm font-bold font-mono text-white">{pool.minSize}</div>
              </div>
              <div>
                <div className="text-[#71768c] mb-1">Taker fee bps</div>
                <div className="text-sm font-bold font-mono text-white">{pool.takerFeeBps}</div>
              </div>
              <div>
                <div className="text-[#71768c] mb-1">Tick size</div>
                <div className="text-sm font-bold font-mono text-white">{pool.tickSize}</div>
              </div>
              <div>
                <div className="text-[#71768c] mb-1">Price precision</div>
                <div className="text-sm font-bold font-mono text-white">{pool.pricePrecision}</div>
              </div>
              <div>
                <div className="text-[#71768c] mb-1">Max size</div>
                <div className="text-sm font-bold font-mono text-white">{pool.maxSize}</div>
              </div>
              <div>
                <div className="text-[#71768c] mb-1">Maker fee bps</div>
                <div className="text-sm font-bold font-mono text-white">{pool.makerFeeBps}</div>
              </div>
              <div>
                <div className="text-[#71768c] mb-1">Kuru AMM spread</div>
                <div className="text-sm font-bold font-mono text-white">{pool.kuruAmmSpread}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Your Positions for this market */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {poolPositions.length === 0 ? (
            <div className="bg-[#121319] border border-[#202230] rounded-2xl p-12 text-center">
              <p className="text-sm text-[#8e92a4] mb-4">
                You don't have any active liquidity positions in {pool.symbol}.
              </p>
              <button
                onClick={onOpenAddLiquidity}
                className="bg-[#b4f04c] text-black text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-[#c4f85e] transition-colors"
              >
                + Add Liquidity Now
              </button>
            </div>
          ) : (
            poolPositions.map((pos) => (
              <div
                key={pos.id}
                className="bg-[#121319] border border-[#202230] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{pos.marketSymbol}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-[#182a1b] text-[#4ade80] border border-[#294c2d]">
                      ● In Range
                    </span>
                    <span className="text-xs text-[#707489]">Strategy: {pos.strategy?.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-[#8e92a4] mt-1 font-mono">
                    Range: ${pos.minPrice?.toFixed(2)} - ${pos.maxPrice?.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-xs text-[#8e92a4]">Position Value</div>
                    <div className="text-sm font-bold text-white font-mono">${pos.totalValueUsd.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#8e92a4]">Fees Earned</div>
                    <div className="text-sm font-bold text-[#b4f04c] font-mono">+${pos.earnedFeesUsd.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => onWithdrawPosition(pos.id)}
                    className="bg-[#1e202d] hover:bg-[#2b2e40] text-white hover:text-[#f87171] border border-[#2b2d3d] text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
