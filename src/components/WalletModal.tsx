import React from 'react';
import { X, Check, ExternalLink, RefreshCw, LogOut } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  walletAddress: string;
  balances: { [token: string]: number };
  onConnect: (address?: string) => void;
  onDisconnect: () => void;
  onFaucetRefill: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  walletAddress,
  balances,
  onConnect,
  onDisconnect,
  onFaucetRefill,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#13141a] border border-[#232533] rounded-2xl p-6 shadow-2xl relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#202230]">
          <h3 className="text-lg font-semibold tracking-tight">
            {isConnected ? 'Account & Balances' : 'Connect a Wallet'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#83879e] hover:text-white rounded-lg hover:bg-[#1c1d27] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isConnected ? (
          <div className="mt-4 space-y-4">
            {/* Connected Info */}
            <div className="bg-[#181922] p-4 rounded-xl border border-[#262838] flex items-center justify-between">
              <div>
                <div className="text-xs text-[#83879e]">Connected Address</div>
                <div className="font-mono text-sm font-medium text-[#b4f04c] mt-0.5">
                  {walletAddress}
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-[#b4f04c] shadow-[0_0_10px_#b4f04c]" />
            </div>

            {/* Testnet Balances */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#83879e] mb-2 px-1">
                <span>Available Assets</span>
                <button
                  onClick={onFaucetRefill}
                  className="flex items-center gap-1 text-[#b4f04c] hover:underline"
                >
                  <RefreshCw className="w-3 h-3" /> Refill Demo Funds
                </button>
              </div>

              <div className="space-y-1.5 bg-[#171822] p-2.5 rounded-xl border border-[#232534] max-h-52 overflow-y-auto">
                {Object.entries(balances).map(([symbol, balance]) => (
                  <div
                    key={symbol}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1e202d] text-xs transition-colors"
                  >
                    <span className="font-semibold text-white">{symbol}</span>
                    <span className="font-mono text-[#cbd0e3]">
                      {balance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  onDisconnect();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#232432] hover:bg-[#2e3042] text-[#f87171] hover:text-red-300 text-xs font-semibold rounded-xl border border-[#303244] transition-all"
              >
                <LogOut className="w-4 h-4" /> Disconnect
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-[#b4f04c] hover:bg-[#c2f85b] text-black text-xs font-semibold rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-[#8e92a4] mb-2">
              Connect your wallet to provision CLOB liquidity, earn trading fees, and interact with automated vaults.
            </p>

            {/* Quick Demo Wallet option */}
            <button
              onClick={() => {
                onConnect('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-[#1a231b] to-[#161a22] hover:from-[#213023] hover:to-[#1d222e] border border-[#2b4c2e] rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#b4f04c] text-black font-extrabold flex items-center justify-center text-xs">
                  KD
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-[#b4f04c] transition-colors">
                    1-Click Demo Wallet
                  </div>
                  <div className="text-[11px] text-[#8e92a4]">
                    Preloaded with 2.5 WETH, $5,000 USDC, 250 MON
                  </div>
                </div>
              </div>
              <span className="text-xs text-[#b4f04c] font-semibold bg-[#213824] px-2 py-0.5 rounded-full border border-[#315736]">
                Instant
              </span>
            </button>

            {/* Simulated Web3 Wallet options */}
            <button
              onClick={() => {
                onConnect('0xa6afb5113d7890981977e2056faeef0cd354d132');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 bg-[#171822] hover:bg-[#1f202e] border border-[#242635] rounded-xl text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#e2761b]/20 text-[#e2761b] flex items-center justify-center font-bold text-xs">
                  🦊
                </div>
                <div className="text-sm font-medium text-white">MetaMask</div>
              </div>
              <span className="text-xs text-[#6e7287]">Detected</span>
            </button>

            <button
              onClick={() => {
                onConnect('0x98cf451a42b109881877e2056faeef0cd123a99b');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 bg-[#171822] hover:bg-[#1f202e] border border-[#242635] rounded-xl text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#8697db]/20 text-[#8697db] flex items-center justify-center font-bold text-xs">
                  🐰
                </div>
                <div className="text-sm font-medium text-white">Rabby Wallet</div>
              </div>
            </button>

            <button
              onClick={() => {
                onConnect('0x38ba4c107e3240eef671d44ebadcd0f878b301c2');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 bg-[#171822] hover:bg-[#1f202e] border border-[#242635] rounded-xl text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ab9ff2]/20 text-[#ab9ff2] flex items-center justify-center font-bold text-xs">
                  👻
                </div>
                <div className="text-sm font-medium text-white">Phantom</div>
              </div>
            </button>

            <div className="pt-2 text-[11px] text-center text-[#6e7287]">
              By connecting, you agree to Kuru Terms of Service & Privacy Policy.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
