import React, { useState } from 'react';
import { Search, MoreVertical, Wallet, Check, ExternalLink, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'liquidity' | 'trade' | 'swap' | 'discover' | 'portfolio';
  onTabChange: (tab: 'liquidity' | 'trade' | 'swap' | 'discover' | 'portfolio') => void;
  onOpenSearch: () => void;
  onOpenWallet: () => void;
  isWalletConnected: boolean;
  walletAddress: string;
  userBalanceUsd: number;
  onResetFaucet: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenSearch,
  onOpenWallet,
  isWalletConnected,
  walletAddress,
  userBalanceUsd,
  onResetFaucet,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0d10]/95 backdrop-blur-md border-b border-[#1b1d24]">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Kuru Brand + Navigation */}
        <div className="flex items-center gap-8">
          {/* Kuru Logo */}
          <button
            onClick={() => onTabChange('liquidity')}
            className="flex items-center gap-2 text-white group focus:outline-none"
            aria-label="Kuru Home"
          >
            {/* Exact Kuru Stylized 4-petal asterisk symbol */}
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7 text-white transition-transform group-hover:scale-105">
                <path
                  d="M14 0C14 7.73199 7.73199 14 0 14C7.73199 14 14 20.268 14 28C14 20.268 20.268 14 28 14C20.268 14 14 7.73199 14 0Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white font-sans">kuru</span>
          </button>

          {/* Primary Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => onTabChange('discover')}
              className={`transition-colors py-1 ${
                activeTab === 'discover' ? 'text-white' : 'text-[#8e92a4] hover:text-white'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => onTabChange('trade')}
              className={`transition-colors py-1 ${
                activeTab === 'trade' ? 'text-white' : 'text-[#8e92a4] hover:text-white'
              }`}
            >
              Trade
            </button>
            <button
              onClick={() => onTabChange('swap')}
              className={`transition-colors py-1 ${
                activeTab === 'swap' ? 'text-white' : 'text-[#8e92a4] hover:text-white'
              }`}
            >
              Swap
            </button>
            <button
              onClick={() => onTabChange('liquidity')}
              className={`relative py-1 font-semibold transition-colors ${
                activeTab === 'liquidity' ? 'text-white' : 'text-[#8e92a4] hover:text-white'
              }`}
            >
              Liquidity
              {activeTab === 'liquidity' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b4f04c] rounded-full" />
              )}
            </button>
            <button
              onClick={() => onTabChange('portfolio')}
              className={`transition-colors py-1 ${
                activeTab === 'portfolio' ? 'text-white' : 'text-[#8e92a4] hover:text-white'
              }`}
            >
              Portfolio
            </button>
            <div className="flex items-center gap-1.5 cursor-pointer text-[#8e92a4] hover:text-white transition-colors">
              <span>Weekly contest</span>
              <span className="bg-[#1b2f1e] text-[#4ade80] border border-[#2b5930] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                New
              </span>
            </div>
          </nav>
        </div>

        {/* Mobile quick nav for small screens */}
        <div className="flex md:hidden items-center gap-3 text-xs font-semibold">
          <button
            onClick={() => onTabChange('liquidity')}
            className={`py-1 ${activeTab === 'liquidity' ? 'text-[#b4f04c] border-b-2 border-[#b4f04c]' : 'text-[#8e92a4]'}`}
          >
            Liquidity
          </button>
          <button
            onClick={() => onTabChange('trade')}
            className={`py-1 ${activeTab === 'trade' ? 'text-[#b4f04c] border-b-2 border-[#b4f04c]' : 'text-[#8e92a4]'}`}
          >
            Trade
          </button>
          <button
            onClick={() => onTabChange('swap')}
            className={`py-1 ${activeTab === 'swap' ? 'text-[#b4f04c] border-b-2 border-[#b4f04c]' : 'text-[#8e92a4]'}`}
          >
            Swap
          </button>
        </div>

        {/* Right: Search, Wallet & Options */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="flex items-center justify-between gap-3 bg-[#14151b] hover:bg-[#1a1b24] text-[#8e92a4] hover:text-white text-xs px-3.5 py-2 rounded-xl border border-[#22242f] transition-all w-36 sm:w-56"
            aria-label="Search markets and pools"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-[#6c7082]" />
              <span className="truncate">Search</span>
            </div>
            <kbd className="hidden sm:inline-block bg-[#1f202b] text-[#9da2b8] text-[10px] px-1.5 py-0.5 rounded border border-[#2b2d3d] font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Testnet Faucet refill helper */}
          {isWalletConnected && (
            <button
              onClick={onResetFaucet}
              title="Refill testnet tokens for testing"
              className="hidden lg:flex items-center gap-1.5 bg-[#171822] hover:bg-[#1e202d] text-[#b4f04c] text-xs px-2.5 py-2 rounded-xl border border-[#252838] transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Faucet</span>
            </button>
          )}

          {/* Wallet Button */}
          {isWalletConnected ? (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2 bg-[#171821] hover:bg-[#1d1f2b] border border-[#282a38] text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-all"
            >
              <div className="w-2 h-2 rounded-full bg-[#b4f04c] animate-pulse" />
              <span className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              <span className="text-[#8e92a4] border-l border-[#2e3142] pl-2">
                ${userBalanceUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenWallet}
              className="bg-[#1f202a] hover:bg-[#282a38] text-white hover:text-white border border-[#2d2f3e] text-xs font-semibold px-4 py-2 rounded-full transition-all"
            >
              Connect wallet
            </button>
          )}

          {/* More options menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-[#8e92a4] hover:text-white hover:bg-[#161720] rounded-lg transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-[#14151c] border border-[#242634] rounded-xl shadow-2xl py-1.5 z-50 text-xs text-[#a3a7be]"
                onMouseLeave={() => setShowMenu(false)}
              >
                <a
                  href="https://docs.kuru.io"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3.5 py-2 hover:bg-[#1b1d28] hover:text-white transition-colors"
                >
                  <span>Documentation</span>
                  <ExternalLink className="w-3 h-3 text-[#6f7387]" />
                </a>
                <a
                  href="https://discord.gg/kuru"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3.5 py-2 hover:bg-[#1b1d28] hover:text-white transition-colors"
                >
                  <span>Discord Community</span>
                  <ExternalLink className="w-3 h-3 text-[#6f7387]" />
                </a>
                <a
                  href="https://twitter.com/kuru_io"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3.5 py-2 hover:bg-[#1b1d28] hover:text-white transition-colors"
                >
                  <span>X / Twitter</span>
                  <ExternalLink className="w-3 h-3 text-[#6f7387]" />
                </a>
                <div className="border-t border-[#222432] my-1" />
                <div className="px-3.5 py-1.5 text-[11px] text-[#63677a]">
                  Kuru CLOB AMM v1.4.0
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
