import React, { useState } from 'react';
import { Search, Sparkles, Info, CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import { PoolMarket, Vault, LiquidityPosition } from '../types/index.ts';
import { formatUsd } from '../utils/liquidityMath.ts';

interface PoolsOverviewProps {
  pools: PoolMarket[];
  vaults: Vault[];
  positions: LiquidityPosition[];
  onSelectPool: (pool: PoolMarket, initialTab?: 'details' | 'add-liquidity') => void;
  onSelectVault: (vault: Vault) => void;
  onWithdrawPosition: (positionId: string) => void;
}

export const PoolsOverview: React.FC<PoolsOverviewProps> = ({
  pools,
  vaults,
  positions,
  onSelectPool,
  onSelectVault,
  onWithdrawPosition,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'explore' | 'positions'>('explore');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPools = pools.filter(
    (p) =>
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 py-8">
      {/* SECTION 1: Explore Vaults */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-5 tracking-tight">Explore vaults</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vaults.map((vault) => (
            <div
              key={vault.id}
              onClick={() => onSelectVault(vault)}
              className="group cursor-pointer bg-[#13141a] hover:bg-[#181922] border border-[#232533] hover:border-[#35384d] rounded-2xl p-5 transition-all duration-200"
            >
              {/* Header: Pair + APR */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white border-2 border-[#13141a] shadow-md"
                      style={{ backgroundColor: vault.baseToken.iconBg }}
                    >
                      {vault.baseToken.iconText || vault.baseToken.symbol[0]}
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white border-2 border-[#13141a] shadow-md"
                      style={{ backgroundColor: vault.quoteToken.iconBg }}
                    >
                      {vault.quoteToken.iconText || vault.quoteToken.symbol[0]}
                    </div>
                  </div>
                  <span className="font-bold text-base text-white tracking-tight">
                    {vault.symbol}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">
                    APR {vault.apr.toFixed(1)}%
                  </span>
                  {vault.isBoosted ? (
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-[#1f2b1d] text-[#b4f04c] border border-[#2e5233]">
                      <Sparkles className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="text-[#6c7083]">
                      <Info className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>

              {/* Stats: TVL & 24h Vol */}
              <div className="flex items-center gap-8 text-xs text-[#8e92a4] pt-2 border-t border-[#1e202c]">
                <div>
                  <span className="mr-2">TVL</span>
                  <span className="font-semibold text-white font-mono">
                    {formatUsd(vault.tvl)}
                  </span>
                </div>
                <div>
                  <span className="mr-2">24h Vol.</span>
                  <span className="font-semibold text-white font-mono">
                    {formatUsd(vault.volume24h)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Pools & Positions Tabs */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-[#202230] sm:border-0 pb-2 sm:pb-0">
            <button
              onClick={() => setActiveSubTab('explore')}
              className={`text-xl font-bold transition-colors pb-1 relative ${
                activeSubTab === 'explore' ? 'text-white' : 'text-[#707489] hover:text-white'
              }`}
            >
              Explore pools
              {activeSubTab === 'explore' && (
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('positions')}
              className={`text-xl font-bold transition-colors pb-1 relative flex items-center gap-2 ${
                activeSubTab === 'positions' ? 'text-white' : 'text-[#707489] hover:text-white'
              }`}
            >
              Your positions
              {positions.length > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1e2f1e] text-[#b4f04c] border border-[#2d5232]">
                  {positions.length}
                </span>
              )}
              {activeSubTab === 'positions' && (
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          </div>

          {/* Search bar */}
          {activeSubTab === 'explore' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6c7083]" />
              <input
                type="text"
                placeholder="Search pools"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121319] hover:bg-[#161722] focus:bg-[#161722] border border-[#212330] focus:border-[#383b50] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#686c82] transition-colors focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Explore pools table */}
        {activeSubTab === 'explore' && (
          <div className="bg-[#121319] border border-[#202230] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1f212f] text-[#71768c] font-medium">
                    <th className="py-4 px-6">Market</th>
                    <th className="py-4 px-6">TVL</th>
                    <th className="py-4 px-6">Volume (24h)</th>
                    <th className="py-4 px-6">Fees (24h)</th>
                    <th className="py-4 px-6">Pool APR</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b1c28]">
                  {filteredPools.map((pool) => (
                    <tr
                      key={pool.id}
                      onClick={() => onSelectPool(pool, 'details')}
                      className="hover:bg-[#181a24] transition-colors cursor-pointer group"
                    >
                      {/* Market / Symbol */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white border-2 border-[#121319]"
                              style={{ backgroundColor: pool.baseToken.iconBg }}
                            >
                              {pool.baseToken.iconText || pool.baseToken.symbol[0]}
                            </div>
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white border-2 border-[#121319]"
                              style={{ backgroundColor: pool.quoteToken.iconBg }}
                            >
                              {pool.quoteToken.iconText || pool.quoteToken.symbol[0]}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white group-hover:text-[#b4f04c] transition-colors flex items-center gap-1.5">
                              {pool.symbol}
                              {pool.verified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399]" />
                              )}
                            </div>
                            <div className="text-[11px] text-[#6b6f84] font-mono mt-0.5">
                              {pool.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* TVL */}
                      <td className="py-4 px-6 font-mono font-medium text-white">
                        {formatUsd(pool.tvl)}
                      </td>

                      {/* Volume (24h) */}
                      <td className="py-4 px-6 font-mono font-medium text-white">
                        {formatUsd(pool.volume24h)}
                      </td>

                      {/* Fees (24h) */}
                      <td className="py-4 px-6 font-mono font-medium text-white">
                        ${pool.fees24h.toLocaleString()}
                      </td>

                      {/* Pool APR */}
                      <td className="py-4 px-6 font-mono font-medium text-white">
                        {pool.poolApr}%
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPool(pool, 'add-liquidity');
                          }}
                          className="bg-[#1b1c26] hover:bg-[#b4f04c] text-white hover:text-black border border-[#2b2d3d] hover:border-[#b4f04c] font-semibold px-4 py-2 rounded-xl transition-all"
                        >
                          Add liquidity
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPools.length === 0 && (
              <div className="py-12 text-center text-xs text-[#6e7287]">
                No markets match your query "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Your positions list */}
        {activeSubTab === 'positions' && (
          <div>
            {positions.length === 0 ? (
              <div className="bg-[#121319] border border-[#202230] rounded-2xl p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#1b1d28] text-[#8e92a4] flex items-center justify-center mx-auto mb-3">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">No open positions yet</h3>
                <p className="text-xs text-[#8e92a4] max-w-sm mx-auto mb-6">
                  Select a pool or automated vault above to provision liquidity and earn fee revenue on Kuru CLOB.
                </p>
                <button
                  onClick={() => setActiveSubTab('explore')}
                  className="bg-[#b4f04c] hover:bg-[#c4f85e] text-black font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Explore Pools
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {positions.map((pos) => (
                  <div
                    key={pos.id}
                    className="bg-[#121319] border border-[#202230] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#1a1c26] border border-[#262838] flex items-center justify-center text-sm font-bold text-white">
                        {pos.marketSymbol.split('/')[0]?.trim()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            {pos.marketSymbol}
                          </span>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-[#182a1b] text-[#4ade80] border border-[#294c2d]">
                            {pos.status === 'in-range' ? '● In Range' : '○ Out of Range'}
                          </span>
                          <span className="text-xs text-[#707489]">
                            {pos.type === 'pool' ? `Strategy: ${pos.strategy?.toUpperCase()}` : 'Automated Vault'}
                          </span>
                        </div>
                        <div className="text-xs text-[#8e92a4] mt-1 flex items-center gap-3">
                          {pos.minPrice && pos.maxPrice ? (
                            <span>
                              Range: <strong className="text-white font-mono">{pos.minPrice.toFixed(2)}</strong> - <strong className="text-white font-mono">{pos.maxPrice.toFixed(2)}</strong>
                            </span>
                          ) : (
                            <span>Managed Volatility Spread</span>
                          )}
                          <span>· Created {pos.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end md:self-center">
                      <div className="text-right">
                        <div className="text-xs text-[#8e92a4]">Position Value</div>
                        <div className="font-mono text-sm font-bold text-white">
                          ${pos.totalValueUsd.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#8e92a4]">Fees Earned</div>
                        <div className="font-mono text-sm font-bold text-[#b4f04c]">
                          +${pos.earnedFeesUsd.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => onWithdrawPosition(pos.id)}
                        className="bg-[#1e202d] hover:bg-[#2b2e40] text-white hover:text-[#f87171] border border-[#2b2d3d] text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
