import React, { useState, useEffect } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Info,
  Edit2,
  FileText,
  AlertCircle,
  HelpCircle,
  X,
  ArrowLeft,
} from 'lucide-react';
import { PoolMarket, VolatilityStrategy, LiquidityPosition } from '../types/index.ts';
import {
  calculateDefaultPriceRange,
  generateDistributionBars,
  calculateDepositAmounts,
  DistributionBar,
} from '../utils/liquidityMath.ts';

interface AddLiquidityFlowProps {
  pool: PoolMarket;
  userBalances: { [token: string]: number };
  onBackToPool: () => void;
  onSuccess: (newPosition: LiquidityPosition) => void;
}

export const AddLiquidityFlow: React.FC<AddLiquidityFlowProps> = ({
  pool,
  userBalances,
  onBackToPool,
  onSuccess,
}) => {
  // Stepper state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Strategy & Fee tier state
  const [strategy, setStrategy] = useState<VolatilityStrategy>('spot');
  const [feeTier, setFeeTier] = useState<number>(0.05);
  const [showMoreStrategy, setShowMoreStrategy] = useState<boolean>(true);
  const [showMoreFee, setShowMoreFee] = useState<boolean>(true);

  // Step 2: Range & Deposit state
  const [minPrice, setMinPrice] = useState<number>(2455.55);
  const [maxPrice, setMaxPrice] = useState<number>(2515.2);
  const [numOrders, setNumOrders] = useState<number>(49);
  const [baseInput, setBaseInput] = useState<string>('0.04875864');
  const [quoteInput, setQuoteInput] = useState<string>('125.496024');
  const [activeInput, setActiveInput] = useState<'base' | 'quote'>('base');
  const [autoFill, setAutoFill] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [guideModal, setGuideModal] = useState<string | null>(null);

  // Re-calculate default range on strategy change
  useEffect(() => {
    const range = calculateDefaultPriceRange(pool.currentPrice, strategy, feeTier);
    setMinPrice(range.minPrice);
    setMaxPrice(range.maxPrice);
    setNumOrders(range.numOrders);
  }, [strategy, feeTier, pool.currentPrice]);

  // Generate visual distribution bars
  const distributionBars: DistributionBar[] = generateDistributionBars(
    minPrice,
    maxPrice,
    pool.currentPrice,
    strategy,
    24
  );

  // Calculate required counterpart amount based on autoFill
  useEffect(() => {
    if (!autoFill) return;
    const baseVal = parseFloat(baseInput) || 0;
    const quoteVal = parseFloat(quoteInput) || 0;

    if (activeInput === 'base' && baseVal > 0) {
      const amounts = calculateDepositAmounts(
        baseVal,
        0,
        pool.currentPrice,
        minPrice,
        maxPrice,
        'base'
      );
      setQuoteInput(amounts.quoteRequired.toString());
    } else if (activeInput === 'quote' && quoteVal > 0) {
      const amounts = calculateDepositAmounts(
        0,
        quoteVal,
        pool.currentPrice,
        minPrice,
        maxPrice,
        'quote'
      );
      setBaseInput(amounts.baseRequired.toString());
    }
  }, [baseInput, quoteInput, activeInput, minPrice, maxPrice, autoFill, pool.currentPrice]);

  // Balance checks
  const baseNum = parseFloat(baseInput) || 0;
  const quoteNum = parseFloat(quoteInput) || 0;
  const currentBaseBal = userBalances[pool.baseToken.symbol] || 0;
  const currentQuoteBal = userBalances[pool.quoteToken.symbol] || 0;

  const hasInsufficientBase = baseNum > currentBaseBal;
  const hasInsufficientQuote = quoteNum > currentQuoteBal;
  const hasInsufficientBalance = hasInsufficientBase || hasInsufficientQuote;

  const minPercentOffset = (((minPrice - pool.currentPrice) / pool.currentPrice) * 100).toFixed(5);
  const maxPercentOffset = (((maxPrice - pool.currentPrice) / pool.currentPrice) * 100).toFixed(5);

  const handleResetPrice = () => {
    const range = calculateDefaultPriceRange(pool.currentPrice, strategy, feeTier);
    setMinPrice(range.minPrice);
    setMaxPrice(range.maxPrice);
  };

  const handleMaxBase = () => {
    setActiveInput('base');
    setBaseInput(currentBaseBal.toString());
  };

  const handleMaxQuote = () => {
    setActiveInput('quote');
    setQuoteInput(currentQuoteBal.toString());
  };

  const handleSubmitDeposit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newPos: LiquidityPosition = {
        id: `pos-${Date.now()}`,
        type: 'pool',
        marketId: pool.id,
        marketSymbol: pool.symbol,
        strategy,
        feeTierPercent: feeTier,
        minPrice,
        maxPrice,
        currentPriceAtDeposit: pool.currentPrice,
        baseDeposited: baseNum,
        quoteDeposited: quoteNum,
        baseTokenSymbol: pool.baseToken.symbol,
        quoteTokenSymbol: pool.quoteToken.symbol,
        totalValueUsd: baseNum * pool.currentPrice + quoteNum,
        earnedFeesUsd: 0,
        status: 'in-range',
        createdAt: 'Just now',
      };
      setIsSubmitting(false);
      setShowSuccessToast(true);
      setTimeout(() => {
        onSuccess(newPos);
      }, 1200);
    }, 800);
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 py-6 text-white">
      {/* Back to market header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBackToPool}
          className="flex items-center gap-2 text-xs text-[#8e92a4] hover:text-white transition-colors bg-[#171822] px-3 py-1.5 rounded-xl border border-[#242636]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {pool.symbol}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stepper & Educational Links */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <div className="text-xs font-semibold text-[#6e7287] uppercase tracking-wider mb-4">
              Steps
            </div>

            <div className="relative pl-6 space-y-8">
              {/* Vertical connector line */}
              <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-[#252837]" />

              {/* Step 1 */}
              <div
                onClick={() => setCurrentStep(1)}
                className={`relative flex items-start gap-3 cursor-pointer group`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold -ml-[25px] z-10 transition-colors ${
                    currentStep === 1
                      ? 'bg-white text-black'
                      : currentStep === 2
                      ? 'bg-[#b4f04c] text-black'
                      : 'bg-[#222432] text-[#8e92a4]'
                  }`}
                >
                  {currentStep === 2 ? <Check className="w-3.5 h-3.5" /> : '1'}
                </div>
                <div>
                  <div
                    className={`text-sm font-semibold transition-colors ${
                      currentStep === 1 ? 'text-white' : 'text-[#8e92a4] group-hover:text-white'
                    }`}
                  >
                    Select strategy and fee
                  </div>
                  {currentStep === 2 && (
                    <div className="text-xs text-[#b4f04c] mt-0.5">
                      {strategy.toUpperCase()} · {feeTier}%
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2 */}
              <div
                onClick={() => setCurrentStep(2)}
                className={`relative flex items-start gap-3 cursor-pointer group`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold -ml-[25px] z-10 transition-colors ${
                    currentStep === 2
                      ? 'bg-white text-black ring-4 ring-[#b4f04c]/20'
                      : 'bg-[#222432] text-[#8e92a4]'
                  }`}
                >
                  2
                </div>
                <div>
                  <div
                    className={`text-sm font-semibold transition-colors ${
                      currentStep === 2 ? 'text-white' : 'text-[#8e92a4] group-hover:text-white'
                    }`}
                  >
                    Set price range and deposit amounts
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Sidebar Links matching screenshot */}
          <div className="pt-6 border-t border-[#1f212f]">
            <div className="text-xs font-semibold text-[#8e92a4] mb-3">
              Learn more about liquidity
            </div>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => setGuideModal('quick-start')}
                className="w-full flex items-center gap-2 text-[#7f849c] hover:text-white py-1.5 transition-colors text-left"
              >
                <FileText className="w-3.5 h-3.5 text-[#595d72]" />
                <span>Quick start guide</span>
              </button>
              <button
                onClick={() => setGuideModal('shapes')}
                className="w-full flex items-center gap-2 text-[#7f849c] hover:text-white py-1.5 transition-colors text-left"
              >
                <FileText className="w-3.5 h-3.5 text-[#595d72]" />
                <span>Liquidity shapes explained</span>
              </button>
              <button
                onClick={() => setGuideModal('fees')}
                className="w-full flex items-center gap-2 text-[#7f849c] hover:text-white py-1.5 transition-colors text-left"
              >
                <FileText className="w-3.5 h-3.5 text-[#595d72]" />
                <span>How fees work on Kuru</span>
              </button>
              <button
                onClick={() => setGuideModal('clob')}
                className="w-full flex items-center gap-2 text-[#7f849c] hover:text-white py-1.5 transition-colors text-left"
              >
                <FileText className="w-3.5 h-3.5 text-[#595d72]" />
                <span>Liquidity provisioning on Kuru</span>
              </button>
              {currentStep === 2 && (
                <>
                  <button
                    onClick={() => setGuideModal('single-sided')}
                    className="w-full flex items-center gap-2 text-[#7f849c] hover:text-white py-1.5 transition-colors text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#595d72]" />
                    <span>Single-sided vs balanced liquidity</span>
                  </button>
                  <button
                    onClick={() => setGuideModal('impermanent-loss')}
                    className="w-full flex items-center gap-2 text-[#7f849c] hover:text-white py-1.5 transition-colors text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#595d72]" />
                    <span>Understanding risks & impermanent loss</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Step 1 or Step 2 Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* STEP 1: Select Strategy & Fee */}
          {currentStep === 1 && (
            <div className="bg-[#121319] border border-[#202230] rounded-2xl p-6 sm:p-8 space-y-8 animate-in fade-in duration-150">
              {/* Section 1: Volatility Strategy */}
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Select volatility strategy</h2>
                <p className="text-xs text-[#8e92a4] mb-6">
                  The spread is the gap between two flip orders on the order book. It works like earning a fee on your liquidity position.
                </p>

                {/* Selected header row */}
                <div className="bg-[#171822] border border-[#232534] rounded-xl p-4 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#202230] flex items-center justify-center text-xs font-mono">
                      |||
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white capitalize">{strategy}</div>
                      <div className="text-xs text-[#8e92a4]">
                        {strategy === 'spot'
                          ? 'Ideal For Volatile Pairs With Large Range'
                          : strategy === 'curve'
                          ? 'Ideal for stables or pairs'
                          : 'Ideal for volatile pairs'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMoreStrategy(!showMoreStrategy)}
                    className="text-xs text-[#8e92a4] hover:text-white flex items-center gap-1"
                  >
                    <span>{showMoreStrategy ? 'Hide more options' : 'Show more options'}</span>
                    {showMoreStrategy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strategy Cards Grid */}
                {showMoreStrategy && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Spot Card */}
                    <button
                      onClick={() => setStrategy('spot')}
                      className={`p-4 rounded-xl text-left border transition-all relative ${
                        strategy === 'spot'
                          ? 'bg-[#181a24] border-[#3b3e54] ring-1 ring-[#b4f04c]'
                          : 'bg-[#15161f] border-[#222432] hover:border-[#303346]'
                      }`}
                    >
                      {strategy === 'spot' && (
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#b4f04c] text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      {/* Uniform bars visual */}
                      <div className="flex items-end gap-1 h-12 mb-3 px-1">
                        {[40, 50, 45, 55, 48, 52, 46, 50].map((h, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 rounded-t ${
                              idx < 4 ? 'bg-[#5b8df8]' : 'bg-[#4ade80]'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="text-sm font-bold text-white">Spot</div>
                      <div className="text-xs text-[#8e92a4] mt-1">
                        Ideal for volatile pairs with large range
                      </div>
                    </button>

                    {/* Curve Card */}
                    <button
                      onClick={() => setStrategy('curve')}
                      className={`p-4 rounded-xl text-left border transition-all relative ${
                        strategy === 'curve'
                          ? 'bg-[#181a24] border-[#3b3e54] ring-1 ring-[#b4f04c]'
                          : 'bg-[#15161f] border-[#222432] hover:border-[#303346]'
                      }`}
                    >
                      {strategy === 'curve' && (
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#b4f04c] text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      {/* Gaussian curve visual */}
                      <div className="flex items-end gap-1 h-12 mb-3 px-1">
                        {[20, 35, 65, 95, 90, 60, 30, 18].map((h, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 rounded-t ${
                              idx < 4 ? 'bg-[#5b8df8]' : 'bg-[#4ade80]'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="text-sm font-bold text-white">Curve</div>
                      <div className="text-xs text-[#8e92a4] mt-1">
                        Ideal for stables or correlated pairs
                      </div>
                    </button>

                    {/* BidAsk Card */}
                    <button
                      onClick={() => setStrategy('bidask')}
                      className={`p-4 rounded-xl text-left border transition-all relative ${
                        strategy === 'bidask'
                          ? 'bg-[#181a24] border-[#3b3e54] ring-1 ring-[#b4f04c]'
                          : 'bg-[#15161f] border-[#222432] hover:border-[#303346]'
                      }`}
                    >
                      {strategy === 'bidask' && (
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#b4f04c] text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      {/* Bimodal visual */}
                      <div className="flex items-end gap-1 h-12 mb-3 px-1">
                        {[75, 45, 30, 20, 22, 35, 55, 80].map((h, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 rounded-t ${
                              idx < 4 ? 'bg-[#5b8df8]' : 'bg-[#4ade80]'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="text-sm font-bold text-white">BidAsk</div>
                      <div className="text-xs text-[#8e92a4] mt-1">
                        Ideal for volatile pairs & momentum
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Section 2: Fee Tier */}
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Select a fee</h2>
                <p className="text-xs text-[#8e92a4] mb-6">
                  The spread is the gap between two flip orders on the order book. It works like earning a fee on your liquidity position.
                </p>

                {/* Selected Fee Row */}
                <div className="bg-[#171822] border border-[#232534] rounded-xl p-4 flex items-center justify-between mb-4">
                  <div className="text-sm font-bold text-white">{feeTier}% fee tier</div>
                  <button
                    onClick={() => setShowMoreFee(!showMoreFee)}
                    className="text-xs text-[#8e92a4] hover:text-white flex items-center gap-1"
                  >
                    <span>{showMoreFee ? 'Hide more options' : 'Show more options'}</span>
                    {showMoreFee ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Fee Cards Grid */}
                {showMoreFee && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { rate: 0.05, label: '0.05%', recommended: true },
                      { rate: 0.1, label: '0.1%' },
                      { rate: 0.3, label: '0.3%' },
                      { rate: 0.5, label: '0.5%', editable: true },
                    ].map((tier) => (
                      <button
                        key={tier.rate}
                        onClick={() => setFeeTier(tier.rate)}
                        className={`p-4 rounded-xl text-left border transition-all relative flex items-center justify-between ${
                          feeTier === tier.rate
                            ? 'bg-[#181a24] border-[#3b3e54] ring-1 ring-[#b4f04c]'
                            : 'bg-[#15161f] border-[#222432] hover:border-[#303346]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{tier.label}</span>
                          {tier.recommended && (
                            <span className="text-[10px] font-semibold text-[#8e92a4] bg-[#222432] px-1.5 py-0.5 rounded">
                              Recommended
                            </span>
                          )}
                          {tier.editable && (
                            <Edit2 className="w-3 h-3 text-[#6f7387]" />
                          )}
                        </div>
                        {feeTier === tier.rate && (
                          <div className="w-4 h-4 rounded-full bg-[#b4f04c] text-black flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button: Proceed */}
              <div className="pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-3.5 bg-[#b4f04c] hover:bg-[#c2f85b] text-black font-bold text-sm rounded-xl transition-all shadow-lg active:scale-[0.99]"
                >
                  Proceed
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Set Price Range & Deposit Amounts */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Completed Step 1 Summary Banner */}
              <div className="bg-[#14151c] border border-[#242636] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1e2f1e] text-[#4ade80] flex items-center justify-center border border-[#2c4e2e]">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-[#707489]">Strategy selected</div>
                    <div className="text-sm font-bold text-white capitalize">
                      {strategy} · {feeTier}%
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#8e92a4] hover:text-white bg-[#1a1b26] hover:bg-[#222432] px-3 py-1.5 rounded-xl border border-[#2b2d3d] transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Modify</span>
                </button>
              </div>

              {/* Card 1: Set Price Range */}
              <div className="bg-[#121319] border border-[#202230] rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Set price range</h3>
                    <p className="text-xs text-[#8e92a4]">
                      Adjust the slider or type in your preferred Min and Max price to set the price range for your liquidity position.
                    </p>
                  </div>
                </div>

                {/* Token Legend & Reset Price */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1b1c28]">
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-[#a1a5bd]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" /> {pool.baseToken.symbol}
                    </span>
                    <span className="flex items-center gap-1.5 text-[#a1a5bd]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5b8df8]" /> {pool.quoteToken.symbol}
                    </span>
                  </div>

                  <button
                    onClick={handleResetPrice}
                    className="flex items-center gap-1.5 text-xs text-[#8e92a4] hover:text-white bg-[#171822] hover:bg-[#202230] px-2.5 py-1 rounded-lg border border-[#262836] transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Price</span>
                  </button>
                </div>

                {/* Visual Orderbook Distribution Chart matching screenshot */}
                <div className="bg-[#0e0f14] border border-[#1b1d26] rounded-xl p-4 mb-6">
                  {/* Labels: Bids on left, Asks on right */}
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-[#5b8df8]">Bids</span>
                    <span className="text-[#4ade80]">Asks</span>
                  </div>

                  {/* Distribution Columns */}
                  <div className="relative flex items-end justify-between gap-1 h-32 pt-2 px-1">
                    {/* Mid Price Dashed Divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px border-l-2 border-dashed border-white/70 z-20 flex flex-col items-center">
                      <div className="bg-white text-black text-[9px] font-mono px-1 rounded-sm -mt-2 shadow">
                        |||
                      </div>
                    </div>

                    {distributionBars.map((bar, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative"
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-[#1c1e2b] text-[10px] text-white px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity font-mono z-30">
                          {bar.price}
                        </div>
                        {/* Bar */}
                        <div
                          className={`w-full rounded-t transition-all ${
                            bar.type === 'bid'
                              ? 'bg-[#5b8df8] hover:bg-[#7ba6ff]'
                              : 'bg-[#4ade80] hover:bg-[#6ef09d]'
                          }`}
                          style={{ height: `${bar.heightPercent}%` }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Ticks along axis */}
                  <div className="flex justify-between text-[10px] text-[#696d83] font-mono mt-2 px-1 border-t border-[#1a1b24] pt-1">
                    <span>{minPrice.toFixed(2)}</span>
                    <span>{((minPrice + pool.currentPrice) / 2).toFixed(2)}</span>
                    <span className="text-white font-bold">{pool.currentPrice.toFixed(2)}</span>
                    <span>{((maxPrice + pool.currentPrice) / 2).toFixed(2)}</span>
                    <span>{maxPrice.toFixed(2)}</span>
                  </div>

                  {/* Existing order book depth histogram below */}
                  <div className="flex items-end justify-between gap-1 h-10 mt-3 pt-1 px-1 border-t border-[#1a1b24]">
                    {[12, 10, 15, 8, 20, 25, 90, 85, 20, 15, 10, 8].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-[#232532] rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Min / Max inputs & Number of orders */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Min price */}
                  <div className="bg-[#171822] border border-[#242636] rounded-xl p-3">
                    <div className="text-[11px] text-[#71768c] mb-1">Min price</div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        step="0.01"
                        value={minPrice}
                        onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
                        className="w-28 bg-transparent text-sm font-mono font-bold text-white focus:outline-none"
                      />
                      <span className="text-xs font-mono font-medium text-[#f87171] bg-[#241a1f] px-2 py-0.5 rounded border border-[#3b2128]">
                        {minPercentOffset}%
                      </span>
                    </div>
                  </div>

                  {/* Max price */}
                  <div className="bg-[#171822] border border-[#242636] rounded-xl p-3">
                    <div className="text-[11px] text-[#71768c] mb-1">Max price</div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        step="0.01"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 0)}
                        className="w-28 bg-transparent text-sm font-mono font-bold text-white focus:outline-none"
                      />
                      <span className="text-xs font-mono font-medium text-[#4ade80] bg-[#1a251f] px-2 py-0.5 rounded border border-[#233f2a]">
                        +{maxPercentOffset}%
                      </span>
                    </div>
                  </div>

                  {/* No. of orders */}
                  <div className="bg-[#171822] border border-[#242636] rounded-xl p-3">
                    <div className="text-[11px] text-[#71768c] mb-1">No. of orders</div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        value={numOrders}
                        onChange={(e) => setNumOrders(parseInt(e.target.value) || 49)}
                        className="w-full bg-transparent text-sm font-mono font-bold text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Deposit Liquidity & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left 7 cols: Deposit Inputs */}
                <div className="md:col-span-7 bg-[#121319] border border-[#202230] rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-white mb-2">Deposit liquidity</h3>

                  {/* Base Token Input */}
                  <div className="bg-[#171822] border border-[#242636] rounded-xl p-4">
                    <div className="text-xs text-[#71768c] mb-1.5">You deposit</div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 bg-[#202230] border border-[#2c2f42] px-2.5 py-1 rounded-xl">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ backgroundColor: pool.baseToken.iconBg }}
                        >
                          {pool.baseToken.symbol[0]}
                        </div>
                        <span className="text-xs font-bold text-white">{pool.baseToken.symbol}</span>
                      </div>

                      <input
                        type="text"
                        value={baseInput}
                        onChange={(e) => {
                          setActiveInput('base');
                          setBaseInput(e.target.value);
                        }}
                        className="w-full text-right bg-transparent text-lg font-mono font-bold text-white focus:outline-none"
                        placeholder="0.0"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#71768c] mt-2 pt-2 border-t border-[#202230]">
                      <div className="flex items-center gap-1.5">
                        <span>Bal: {currentBaseBal.toFixed(4)} {pool.baseToken.symbol}</span>
                        <button
                          onClick={handleMaxBase}
                          className="text-[#b4f04c] font-bold hover:underline"
                        >
                          MAX
                        </button>
                      </div>
                      <span className="font-mono">
                        ${(baseNum * pool.currentPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Plus Divider */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="w-7 h-7 rounded-full bg-[#202230] border border-[#2e3144] flex items-center justify-center text-white text-xs font-bold">
                      +
                    </div>
                  </div>

                  {/* Quote Token Input */}
                  <div className="bg-[#171822] border border-[#242636] rounded-xl p-4">
                    <div className="text-xs text-[#71768c] mb-1.5">You deposit</div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 bg-[#202230] border border-[#2c2f42] px-2.5 py-1 rounded-xl">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ backgroundColor: pool.quoteToken.iconBg }}
                        >
                          $
                        </div>
                        <span className="text-xs font-bold text-white">{pool.quoteToken.symbol}</span>
                      </div>

                      <input
                        type="text"
                        value={quoteInput}
                        onChange={(e) => {
                          setActiveInput('quote');
                          setQuoteInput(e.target.value);
                        }}
                        className="w-full text-right bg-transparent text-lg font-mono font-bold text-white focus:outline-none"
                        placeholder="0.0"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#71768c] mt-2 pt-2 border-t border-[#202230]">
                      <div className="flex items-center gap-1.5">
                        <span>Bal: {currentQuoteBal.toFixed(2)} {pool.quoteToken.symbol}</span>
                        <button
                          onClick={handleMaxQuote}
                          className="text-[#b4f04c] font-bold hover:underline"
                        >
                          MAX
                        </button>
                      </div>
                      <span className="font-mono">${quoteNum.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Auto Fill Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-[#8e92a4]">Enable auto fill</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoFill}
                      onClick={() => setAutoFill(!autoFill)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoFill ? 'bg-[#b4f04c]' : 'bg-[#282a38]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                          autoFill ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Right 5 cols: Summary Card */}
                <div className="md:col-span-5 bg-[#121319] border border-[#202230] rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-4">Summary</h3>

                    <div className="space-y-4 text-xs">
                      <div>
                        <div className="text-[#71768c]">Range selected</div>
                        <div className="text-white font-mono font-semibold mt-0.5">
                          {minPrice.toFixed(2)} - {maxPrice.toFixed(2)} {pool.quoteToken.symbol} per {pool.baseToken.symbol}
                        </div>
                      </div>

                      <div className="border-t border-[#1e202c] pt-3">
                        <div className="flex items-center justify-between text-white font-semibold mb-1">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
                            No. of Asks ({pool.baseToken.symbol})
                          </span>
                          <span className="font-mono">24</span>
                        </div>
                        <div className="text-[#71768c] pl-4 font-mono">
                          ↳ Min. ({pool.baseToken.symbol}) required: 0.048 {pool.baseToken.symbol}
                        </div>
                      </div>

                      <div className="border-t border-[#1e202c] pt-3">
                        <div className="flex items-center justify-between text-white font-semibold mb-1">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#5b8df8]" />
                            No. of Bids ({pool.quoteToken.symbol})
                          </span>
                          <span className="font-mono">25</span>
                        </div>
                        <div className="text-[#71768c] pl-4 font-mono">
                          ↳ Min. ({pool.quoteToken.symbol}) required: 124.25 {pool.quoteToken.symbol}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    {/* Insufficient Balance warning matching screenshot */}
                    {hasInsufficientBalance && (
                      <div className="mb-4 bg-[#26171b] border border-[#4d1f27] text-[#f87171] text-xs p-3 rounded-xl flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>
                          {hasInsufficientBase
                            ? `Insufficient ${pool.baseToken.symbol} balance`
                            : `Insufficient ${pool.quoteToken.symbol} balance`}
                        </span>
                      </div>
                    )}

                    {/* Add Liquidity Button */}
                    <button
                      onClick={handleSubmitDeposit}
                      disabled={hasInsufficientBalance || isSubmitting || baseNum <= 0}
                      className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        hasInsufficientBalance || baseNum <= 0
                          ? 'bg-[#1e202d] text-[#696d83] cursor-not-allowed border border-[#282a3c]'
                          : 'bg-[#b4f04c] hover:bg-[#c2f85b] text-black shadow-lg active:scale-[0.99]'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Provisioning CLOB Orders...</span>
                        </>
                      ) : (
                        <span>Add liquidity</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guide / Educational Modal */}
      {guideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setGuideModal(null)}
        >
          <div
            className="w-full max-w-lg bg-[#14151d] border border-[#242636] rounded-2xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#202230]">
              <h3 className="text-base font-bold text-white capitalize">
                {guideModal.replace('-', ' ')}
              </h3>
              <button
                onClick={() => setGuideModal(null)}
                className="p-1 text-[#868aa0] hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 text-xs text-[#a0a5be] leading-relaxed space-y-3">
              <p>
                Kuru is an on-chain Central Limit Order Book (CLOB) built for Monad and next-gen high performance EVM chains.
              </p>
              <p>
                Unlike traditional constant-product AMMs (xy=k), liquidity providers on Kuru place real resting limit orders across customizable volatility curves (Spot, Curve, BidAsk).
              </p>
              <p>
                As traders execute market orders against your liquidity, you earn maker fee rebates and flip-order spreads with zero slippage penalty for takers.
              </p>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setGuideModal(null)}
                className="px-4 py-2 bg-[#b4f04c] text-black text-xs font-bold rounded-xl"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
