import React, { useState } from 'react';
import {
  ChevronRight,
  Sparkles,
  Info,
  ExternalLink,
  ChevronDown,
  Settings,
  AlertTriangle,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { Vault, LiquidityPosition } from '../types/index.ts';
import { VAULT_SIMULATION_DATA, VAULT_PNL_DATA } from '../data/mockData.ts';
import { formatUsd } from '../utils/liquidityMath.ts';

interface VaultDetailProps {
  vault: Vault;
  positions: LiquidityPosition[];
  userBalances: { [token: string]: number };
  isWalletConnected: boolean;
  onConnectWallet: () => void;
  onBackToOverview: () => void;
  onDepositVault: (baseAmount: number, quoteAmount: number) => void;
  onWithdrawVault: (positionId: string) => void;
}

export const VaultDetail: React.FC<VaultDetailProps> = ({
  vault,
  positions,
  userBalances,
  isWalletConnected,
  onConnectWallet,
  onBackToOverview,
  onDepositVault,
  onWithdrawVault,
}) => {
  const [benchmark, setBenchmark] = useState<'vs UniV2' | 'vs Hodl'>('vs UniV2');
  const [simTimeframe, setSimTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [pnlTimeframe, setPnlTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [widgetTab, setWidgetTab] = useState<'deposit' | 'withdraw'>('deposit');

  const [baseInput, setBaseInput] = useState<string>('0');
  const [quoteInput, setQuoteInput] = useState<string>('0');
  const [singleAsset, setSingleAsset] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [slippage, setSlippage] = useState<string>('0.5%');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // User vault position if any
  const userVaultPos = positions.find((p) => p.marketId === vault.id && p.type === 'vault');
  const userVaultBalance = userVaultPos ? userVaultPos.totalValueUsd : 0;
  const userEarned = userVaultPos ? userVaultPos.earnedFeesUsd : 0;

  const baseBal = userBalances[vault.baseToken.symbol] || 0;
  const quoteBal = userBalances[vault.quoteToken.symbol] || 0;

  const baseNum = parseFloat(baseInput) || 0;
  const quoteNum = parseFloat(quoteInput) || 0;

  const handleDeposit = () => {
    if (!isWalletConnected) {
      onConnectWallet();
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onDepositVault(baseNum, quoteNum);
      setIsSubmitting(false);
      setBaseInput('0');
      setQuoteInput('0');
    }, 800);
  };

  // Simulation Chart SVG Math
  const simChartWidth = 560;
  const simChartHeight = 220;
  const simPadding = { top: 20, right: 30, bottom: 30, left: 50 };

  const currentSimData = VAULT_SIMULATION_DATA[simTimeframe];
  const allSimVals = currentSimData.flatMap((d) => [d.vault, d.benchmark]);
  const minSimY = Math.min(...allSimVals) - 2;
  const maxSimY = Math.max(...allSimVals) + 2;

  const getSimX = (idx: number) =>
    simPadding.left + (idx / (currentSimData.length - 1)) * (simChartWidth - simPadding.left - simPadding.right);
  const getSimY = (val: number) =>
    simChartHeight - simPadding.bottom - ((val - minSimY) / (maxSimY - minSimY || 1)) * (simChartHeight - simPadding.top - simPadding.bottom);

  const vaultPathD = currentSimData.reduce((acc, curr, idx) => {
    const x = getSimX(idx);
    const y = getSimY(curr.vault);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const benchPathD = currentSimData.reduce((acc, curr, idx) => {
    const x = getSimX(idx);
    const y = getSimY(curr.benchmark);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // PnL Chart SVG Math
  const pnlData = VAULT_PNL_DATA[pnlTimeframe];
  const pnlVals = pnlData.map((d) => d.pnl);
  const minPnl = Math.min(...pnlVals) - 5;
  const maxPnl = Math.max(...pnlVals) + 5;

  const getPnlX = (idx: number) =>
    simPadding.left + (idx / (pnlData.length - 1)) * (simChartWidth - simPadding.left - simPadding.right);
  const getPnlY = (val: number) =>
    simChartHeight - simPadding.bottom - ((val - minPnl) / (maxPnl - minPnl || 1)) * (simChartHeight - simPadding.top - simPadding.bottom);

  const pnlPathD = pnlData.reduce((acc, curr, idx) => {
    const x = getPnlX(idx);
    const y = getPnlY(curr.pnl);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const pnlAreaD = `${pnlPathD} L ${getPnlX(pnlData.length - 1)} ${getPnlY(0)} L ${getPnlX(0)} ${getPnlY(0)} Z`;

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 py-6 text-white">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#71768c] mb-6">
        <button
          onClick={onBackToOverview}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Vaults
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#525667]" />
        <span className="text-white font-medium">{vault.symbol}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1f212d] mb-6">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white border-2 border-[#0c0d10]"
              style={{ backgroundColor: vault.baseToken.iconBg }}
            >
              {vault.baseToken.iconText || vault.baseToken.symbol[0]}
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white border-2 border-[#0c0d10]"
              style={{ backgroundColor: vault.quoteToken.iconBg }}
            >
              {vault.quoteToken.iconText || vault.quoteToken.symbol[0]}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">{vault.symbol}</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white">
            APR <span className="font-mono">{vault.apr.toFixed(1)}%</span>
          </span>
          {vault.isBoosted && (
            <span className="flex items-center gap-1 bg-[#1e2f1f] text-[#b4f04c] border border-[#2d5232] text-xs font-semibold px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> Boosted
            </span>
          )}
        </div>
      </div>

      {/* Top 2 Cards Row: TVL & 24h Volume */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#121319] border border-[#202230] rounded-2xl p-5">
          <div className="text-xs text-[#71768c] mb-1">TVL</div>
          <div className="text-2xl font-bold font-mono text-white">{formatUsd(vault.tvl)}</div>
        </div>
        <div className="bg-[#121319] border border-[#202230] rounded-2xl p-5">
          <div className="text-xs text-[#71768c] mb-1">24h volume</div>
          <div className="text-2xl font-bold font-mono text-white">{formatUsd(vault.volume24h)}</div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Description, Historical Simulation, PnL, Info, Risks */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Vault Description */}
          <div className="bg-[#121319] border border-[#202230] rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-3">Vault description</h3>
            <p className="text-xs text-[#9ea3ba] leading-relaxed">
              {vault.description}
            </p>
          </div>

          {/* 2. Historical Performance Simulation */}
          <div className="bg-[#121319] border border-[#202230] rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">
              Historical performance simulation
            </h3>
            <div className="text-xs text-[#8e92a4] mb-4">
              Assuming initial deposit <strong className="text-white font-mono">$1,000 USD</strong>, invested{' '}
              <strong className="text-white font-mono">{vault.historicalSimulation.investedAgo}</strong> ago
            </div>

            {/* Dropdown & Timeframe Tabs */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1f212f] mb-4">
              <button
                onClick={() => setBenchmark(benchmark === 'vs UniV2' ? 'vs Hodl' : 'vs UniV2')}
                className="flex items-center gap-1.5 bg-[#171822] border border-[#242634] text-xs text-white px-3 py-1.5 rounded-xl hover:bg-[#1f212d] transition-colors"
              >
                <span>{benchmark}</span>
                <ChevronDown className="w-3 h-3 text-[#71768c]" />
              </button>

              <div className="flex items-center gap-1 bg-[#171822] p-1 rounded-xl border border-[#242634]">
                {(['24h', '7d', '30d'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSimTimeframe(tf)}
                    className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                      simTimeframe === tf
                        ? 'bg-[#242636] text-white shadow'
                        : 'text-[#71768c] hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Line Chart */}
            <div className="relative w-full">
              <svg
                viewBox={`0 0 ${simChartWidth} ${simChartHeight}`}
                className="w-full h-56 overflow-visible"
              >
                {/* Horizontal grid lines */}
                <line
                  x1={simPadding.left}
                  y1={simPadding.top}
                  x2={simChartWidth - simPadding.right}
                  y2={simPadding.top}
                  stroke="#1c1e29"
                  strokeDasharray="3 3"
                />
                <line
                  x1={simPadding.left}
                  y1={simChartHeight / 2}
                  x2={simChartWidth - simPadding.right}
                  y2={simChartHeight / 2}
                  stroke="#1c1e29"
                  strokeDasharray="3 3"
                />
                <line
                  x1={simPadding.left}
                  y1={simChartHeight - simPadding.bottom}
                  x2={simChartWidth - simPadding.right}
                  y2={simChartHeight - simPadding.bottom}
                  stroke="#1c1e29"
                />

                {/* Benchmark Line (Blue) */}
                <path
                  d={benchPathD}
                  fill="none"
                  stroke="#5b8df8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Vault Line (Lime Green) */}
                <path
                  d={vaultPathD}
                  fill="none"
                  stroke="#b4f04c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Y-axis labels */}
                <text
                  x={simPadding.left - 8}
                  y={simPadding.top + 5}
                  fill="#71768c"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {maxSimY.toFixed(1)}%
                </text>
                <text
                  x={simPadding.left - 8}
                  y={simChartHeight / 2 + 3}
                  fill="#71768c"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {((maxSimY + minSimY) / 2).toFixed(1)}%
                </text>
                <text
                  x={simPadding.left - 8}
                  y={simChartHeight - simPadding.bottom}
                  fill="#71768c"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {minSimY.toFixed(1)}%
                </text>

                {/* X-axis labels */}
                {currentSimData.map((d, i) => (
                  <text
                    key={d.label}
                    x={getSimX(i)}
                    y={simChartHeight - 8}
                    fill="#71768c"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {d.label}
                  </text>
                ))}
              </svg>

              {/* Legend */}
              <div className="flex items-center justify-end gap-6 text-xs text-[#8e92a4] pt-2 border-t border-[#1e202c]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b4f04c]" />
                  <span>Kuru Vault</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5b8df8]" />
                  <span>{benchmark}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Vault PnL Card */}
          <div className="bg-[#121319] border border-[#202230] rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1f212f] mb-4">
              <h3 className="text-base font-bold text-white">Vault PnL</h3>
              <div className="flex items-center gap-1 bg-[#171822] p-1 rounded-xl border border-[#242634]">
                {(['24h', '7d', '30d'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setPnlTimeframe(tf)}
                    className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                      pnlTimeframe === tf
                        ? 'bg-[#242636] text-white shadow'
                        : 'text-[#71768c] hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* PnL SVG with Green Gradient Area */}
            <div className="relative w-full">
              <svg
                viewBox={`0 0 ${simChartWidth} ${simChartHeight}`}
                className="w-full h-52 overflow-visible"
              >
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Zero line */}
                <line
                  x1={simPadding.left}
                  y1={getPnlY(0)}
                  x2={simChartWidth - simPadding.right}
                  y2={getPnlY(0)}
                  stroke="#2c3042"
                  strokeWidth="1.5"
                />

                {/* Area and Line */}
                <path d={pnlAreaD} fill="url(#pnlGradient)" />
                <path
                  d={pnlPathD}
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Y-axis labels */}
                <text
                  x={simPadding.left - 8}
                  y={simPadding.top + 5}
                  fill="#71768c"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {maxPnl.toFixed(2)}
                </text>
                <text
                  x={simPadding.left - 8}
                  y={getPnlY(0) + 3}
                  fill="#71768c"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  0.00
                </text>
                <text
                  x={simPadding.left - 8}
                  y={simChartHeight - simPadding.bottom}
                  fill="#71768c"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {minPnl.toFixed(2)}
                </text>

                {/* X-axis labels */}
                {pnlData.filter((_, i) => i % 2 === 0).map((d) => (
                  <text
                    key={d.label}
                    x={getPnlX(pnlData.indexOf(d))}
                    y={simChartHeight - 8}
                    fill="#71768c"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    {d.label.split(' ')[0]}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* 4. Vault Info Grid */}
          <div className="bg-[#121319] border border-[#202230] rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-5">Vault info</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
              <div>
                <div className="text-[#71768c] mb-1">Tokens</div>
                <div className="text-sm font-bold text-white">
                  {vault.baseToken.symbol}, {vault.quoteToken.symbol}
                </div>
              </div>
              <div>
                <div className="text-[#71768c] mb-1">Total APR</div>
                <div className="text-sm font-bold text-white flex items-center gap-1 font-mono">
                  {vault.apr}%
                  {vault.isBoosted && <Sparkles className="w-3.5 h-3.5 text-[#b4f04c]" />}
                </div>
              </div>
              <div>
                <div className="text-[#71768c] mb-1">Management fee</div>
                <div className="text-sm font-bold text-white font-mono">{vault.managementFee}%</div>
              </div>
              <div>
                <div className="text-[#71768c] mb-1">Vault address</div>
                <div className="text-sm font-bold text-white flex items-center gap-1 font-mono">
                  <span>{vault.vaultAddress.slice(0, 6)}...{vault.vaultAddress.slice(-4)}</span>
                  <ExternalLink className="w-3 h-3 text-[#71768c]" />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Boosted Rewards */}
          <div className="bg-[#121319] border border-[#202230] rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2">Boosted rewards</h3>
            <p className="text-xs text-[#8e92a4]">
              Earn bonus MON and KURU governance token rewards distributed weekly to active liquidity providers.
            </p>
          </div>

          {/* 6. Risk Warning */}
          <div className="bg-[#121319] border border-[#202230] rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4" /> Risk warning
            </h3>
            <p className="text-xs text-[#8e92a4] leading-relaxed">
              Vaults allocate user deposits for market making on a specific Kuru order book. While these strategies can generate trading fees, adverse market conditions may reduce returns or cause losses. The displayed APY is indicative only and not a guarantee of future performance. Please consider your risk tolerance before depositing.
            </p>
          </div>
        </div>

        {/* Right Column (5 cols): Interactive Deposit / Withdraw Widget */}
        <div className="lg:col-span-5">
          <div className="bg-[#121319] border border-[#202230] rounded-2xl p-6 sticky top-24 space-y-6">
            {/* Position Metric Box */}
            <div className="bg-[#171822] border border-[#232534] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#71768c]">Your balance</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  ${userVaultBalance.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#71768c]">All time earned</div>
                <div className="text-xl font-bold font-mono text-[#b4f04c] mt-0.5">
                  {userEarned > 0 ? `+$${userEarned.toFixed(2)}` : '--'}
                </div>
              </div>
            </div>

            {/* Segmented Deposit / Withdraw Tabs */}
            <div className="flex items-center p-1 bg-[#171822] rounded-xl border border-[#232534]">
              <button
                onClick={() => setWidgetTab('deposit')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  widgetTab === 'deposit'
                    ? 'bg-[#232535] text-white shadow'
                    : 'text-[#71768c] hover:text-white'
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => setWidgetTab('withdraw')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  widgetTab === 'withdraw'
                    ? 'bg-[#232535] text-white shadow'
                    : 'text-[#71768c] hover:text-white'
                }`}
              >
                Withdraw
              </button>
            </div>

            {/* Lock-up Period Notice */}
            <div className="bg-[#171923] border border-[#232637] rounded-xl p-3 flex items-center gap-2 text-xs text-[#8e92a4]">
              <Info className="w-4 h-4 text-[#71768c] shrink-0" />
              <span>The deposit lock-up period is {vault.lockupDays} days</span>
            </div>

            {widgetTab === 'deposit' ? (
              <div className="space-y-4">
                {/* Pay Token 1 (MON) */}
                <div className="bg-[#171822] border border-[#232534] rounded-xl p-4">
                  <div className="text-xs text-[#71768c] mb-1.5">You pay</div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 bg-[#202230] border border-[#2a2d3e] px-2.5 py-1 rounded-xl">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: vault.baseToken.iconBg }}
                      >
                        {vault.baseToken.iconText || vault.baseToken.symbol[0]}
                      </div>
                      <span className="text-xs font-bold text-white">{vault.baseToken.symbol}</span>
                    </div>

                    <input
                      type="text"
                      value={baseInput}
                      onChange={(e) => setBaseInput(e.target.value)}
                      className="w-full text-right bg-transparent text-lg font-mono font-bold text-white focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#71768c] mt-2 pt-2 border-t border-[#1f212f]">
                    <div className="flex items-center gap-1.5">
                      <span>Bal: {baseBal.toFixed(2)} {vault.baseToken.symbol}</span>
                      <button
                        onClick={() => setBaseInput(baseBal.toString())}
                        className="text-[#b4f04c] font-bold hover:underline"
                      >
                        MAX
                      </button>
                    </div>
                    <span className="font-mono">
                      ${(baseNum * vault.baseToken.price).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Plus Separator */}
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="w-7 h-7 rounded-full bg-[#202230] border border-[#2a2d3e] flex items-center justify-center text-white text-xs font-bold">
                    +
                  </div>
                </div>

                {/* Pay Token 2 (USDC) */}
                <div className="bg-[#171822] border border-[#232534] rounded-xl p-4">
                  <div className="text-xs text-[#71768c] mb-1.5">You pay</div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 bg-[#202230] border border-[#2a2d3e] px-2.5 py-1 rounded-xl">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: vault.quoteToken.iconBg }}
                      >
                        $
                      </div>
                      <span className="text-xs font-bold text-white">{vault.quoteToken.symbol}</span>
                    </div>

                    <input
                      type="text"
                      value={quoteInput}
                      onChange={(e) => setQuoteInput(e.target.value)}
                      className="w-full text-right bg-transparent text-lg font-mono font-bold text-white focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#71768c] mt-2 pt-2 border-t border-[#1f212f]">
                    <div className="flex items-center gap-1.5">
                      <span>Bal: {quoteBal.toFixed(2)} {vault.quoteToken.symbol}</span>
                      <button
                        onClick={() => setQuoteInput(quoteBal.toString())}
                        className="text-[#b4f04c] font-bold hover:underline"
                      >
                        MAX
                      </button>
                    </div>
                    <span className="font-mono">${quoteNum.toFixed(2)}</span>
                  </div>
                </div>

                {/* Advanced Settings Disclosure */}
                <div className="pt-1">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center justify-between w-full text-xs text-[#8e92a4] hover:text-white"
                  >
                    <span className="flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5" /> Advanced settings
                    </span>
                    <span>{slippage}</span>
                  </button>

                  {showSettings && (
                    <div className="mt-2 p-3 bg-[#171822] rounded-xl border border-[#232534] text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[#71768c]">Slippage Tolerance</span>
                        <div className="flex items-center gap-1">
                          {['0.1%', '0.5%', '1.0%'].map((s) => (
                            <button
                              key={s}
                              onClick={() => setSlippage(s)}
                              className={`px-2 py-0.5 rounded font-mono ${
                                slippage === s ? 'bg-[#b4f04c] text-black font-bold' : 'text-[#8e92a4] bg-[#202230]'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    onClick={handleDeposit}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#b4f04c] hover:bg-[#c2f85b] text-black font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Processing Deposit...</span>
                      </>
                    ) : isWalletConnected ? (
                      <span>Deposit into Vault</span>
                    ) : (
                      <span>Connect wallet</span>
                    )}
                  </button>
                </div>

                {/* Enable Single Asset Deposit Switch */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#8e92a4]">Enable single asset deposit</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={singleAsset}
                    onClick={() => setSingleAsset(!singleAsset)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      singleAsset ? 'bg-[#b4f04c]' : 'bg-[#282a38]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                        singleAsset ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Summary */}
                <div className="pt-3 border-t border-[#1f212f] space-y-2 text-xs">
                  <div className="text-[#71768c]">Summary</div>
                  <div className="flex items-center justify-between text-[#a0a4be]">
                    <span>{vault.baseToken.symbol} to be deposited</span>
                    <span className="font-mono text-white font-semibold">
                      {baseNum} {vault.baseToken.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#a0a4be]">
                    <span>{vault.quoteToken.symbol} to be deposited</span>
                    <span className="font-mono text-white font-semibold">
                      {quoteNum} {vault.quoteToken.symbol}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Withdraw Tab */
              <div className="space-y-4 text-xs">
                {userVaultBalance <= 0 ? (
                  <div className="py-8 text-center text-[#71768c]">
                    You do not have any deposited balance in this vault to withdraw.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-[#171822] p-4 rounded-xl border border-[#232534]">
                      <div className="text-[#71768c] mb-1">Withdrawable Balance</div>
                      <div className="text-xl font-bold font-mono text-white">
                        ${userVaultBalance.toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (userVaultPos) onWithdrawVault(userVaultPos.id);
                      }}
                      className="w-full py-3 bg-[#f87171] hover:bg-red-400 text-black font-bold text-xs rounded-xl transition-all"
                    >
                      Withdraw All Funds & Rewards
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
