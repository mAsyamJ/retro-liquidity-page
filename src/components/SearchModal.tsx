import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp, ShieldCheck } from 'lucide-react';
import { PoolMarket, Vault } from '../types/index.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pools: PoolMarket[];
  vaults: Vault[];
  onSelectPool: (pool: PoolMarket) => void;
  onSelectVault: (vault: Vault) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  pools,
  vaults,
  onSelectPool,
  onSelectVault,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open handled in parent
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredPools = pools.filter(
    (p) =>
      p.symbol.toLowerCase().includes(query.toLowerCase()) ||
      p.id.toLowerCase().includes(query.toLowerCase()) ||
      p.marketAddress.toLowerCase().includes(query.toLowerCase())
  );

  const filteredVaults = vaults.filter((v) =>
    v.symbol.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#121319] border border-[#242636] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#202230]">
          <Search className="w-5 h-5 text-[#868aa0]" />
          <input
            type="text"
            placeholder="Search by market, symbol (e.g. WETH, USDC), or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white placeholder-[#686c82] text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-[#868aa0] hover:text-white rounded-lg hover:bg-[#1c1d27]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-4">
          {/* Pools Section */}
          {filteredPools.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-[#6e7287] px-2 mb-1.5 uppercase tracking-wider">
                Liquidity Pools
              </div>
              <div className="space-y-1">
                {filteredPools.map((pool) => (
                  <button
                    key={pool.id}
                    onClick={() => {
                      onSelectPool(pool);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1a1b25] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1.5">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-[#121319]"
                          style={{ backgroundColor: pool.baseToken.iconBg }}
                        >
                          {pool.baseToken.iconText || pool.baseToken.symbol[0]}
                        </div>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-[#121319]"
                          style={{ backgroundColor: pool.quoteToken.iconBg }}
                        >
                          {pool.quoteToken.iconText || pool.quoteToken.symbol[0]}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-[#b4f04c] transition-colors flex items-center gap-1.5">
                          {pool.symbol}
                          <span className="text-[11px] text-[#6e7287] font-mono">{pool.id}</span>
                        </div>
                        <div className="text-xs text-[#8e92a4]">
                          ${pool.currentPrice.toLocaleString()} · TVL ${(pool.tvl / 1000).toFixed(1)}K
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-[#b4f04c] bg-[#1d2d1f] px-2 py-0.5 rounded-full border border-[#2b4c2e]">
                        Add Liquidity
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vaults Section */}
          {filteredVaults.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-[#6e7287] px-2 mb-1.5 uppercase tracking-wider">
                Yield Vaults
              </div>
              <div className="space-y-1">
                {filteredVaults.map((vault) => (
                  <button
                    key={vault.id}
                    onClick={() => {
                      onSelectVault(vault);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1a1b25] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1.5">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-[#121319]"
                          style={{ backgroundColor: vault.baseToken.iconBg }}
                        >
                          {vault.baseToken.iconText || vault.baseToken.symbol[0]}
                        </div>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-[#121319]"
                          style={{ backgroundColor: vault.quoteToken.iconBg }}
                        >
                          {vault.quoteToken.iconText || vault.quoteToken.symbol[0]}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-[#b4f04c] transition-colors flex items-center gap-1.5">
                          {vault.symbol} Vault
                          {vault.isBoosted && (
                            <span className="text-[10px] font-medium text-[#b4f04c] bg-[#1e2f1f] px-1.5 py-0.5 rounded border border-[#2e5233]">
                              Boosted
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#8e92a4]">
                          APR {vault.apr}% · TVL ${(vault.tvl / 1000).toFixed(1)}K
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#8e92a4]">Explore ↗</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredPools.length === 0 && filteredVaults.length === 0 && (
            <div className="py-8 text-center text-xs text-[#6e7287]">
              No pools or vaults found matching "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
