import React, { useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { WalletModal } from './components/WalletModal.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { PoolsOverview } from './components/PoolsOverview.tsx';
import { PoolDetail } from './components/PoolDetail.tsx';
import { AddLiquidityFlow } from './components/AddLiquidityFlow.tsx';
import { VaultDetail } from './components/VaultDetail.tsx';
import { POOLS_DATA, VAULTS_DATA, INITIAL_POSITIONS } from './data/mockData.ts';
import { PoolMarket, Vault, LiquidityPosition } from './types/index.ts';

export default function App() {
  // Navigation & View Routing
  const [activeNav, setActiveNav] = useState<'liquidity' | 'trade' | 'swap' | 'discover' | 'portfolio'>('liquidity');
  const [currentView, setCurrentView] = useState<'overview' | 'pool-detail' | 'add-liquidity' | 'vault-detail'>('overview');

  // Selected Entities
  const [selectedPool, setSelectedPool] = useState<PoolMarket>(POOLS_DATA[0]); // WETH / USDC
  const [selectedVault, setSelectedVault] = useState<Vault>(VAULTS_DATA[0]); // MON / USDC

  // Modals
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // User State
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
  const [balances, setBalances] = useState<{ [token: string]: number }>({
    WETH: 2.548,
    USDC: 5420.5,
    MON: 240.0,
    AUSD: 1000.0,
    cbBTC: 0.12,
    XAU0: 1.5,
  });
  const [positions, setPositions] = useState<LiquidityPosition[]>(INITIAL_POSITIONS);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Wallet Handlers
  const handleConnectWallet = (addr?: string) => {
    setIsWalletConnected(true);
    setWalletAddress(addr || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
    showToast('Wallet connected successfully');
  };

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
    showToast('Wallet disconnected');
  };

  const handleFaucetRefill = () => {
    setBalances({
      WETH: 5.0,
      USDC: 10000.0,
      MON: 500.0,
      AUSD: 2500.0,
      cbBTC: 0.25,
      XAU0: 3.0,
    });
    showToast('Demo faucet balance refilled: +5 WETH, +$10,000 USDC, +500 MON');
  };

  // Selection Handlers
  const handleSelectPool = (pool: PoolMarket, initialTab: 'details' | 'add-liquidity' = 'details') => {
    setSelectedPool(pool);
    if (initialTab === 'add-liquidity') {
      setCurrentView('add-liquidity');
    } else {
      setCurrentView('pool-detail');
    }
  };

  const handleSelectVault = (vault: Vault) => {
    setSelectedVault(vault);
    setCurrentView('vault-detail');
  };

  // Position Management
  const handleAddLiquiditySuccess = (newPos: LiquidityPosition) => {
    // Deduct balances
    setBalances((prev) => ({
      ...prev,
      [newPos.baseTokenSymbol]: Math.max(0, (prev[newPos.baseTokenSymbol] || 0) - newPos.baseDeposited),
      [newPos.quoteTokenSymbol]: Math.max(0, (prev[newPos.quoteTokenSymbol] || 0) - newPos.quoteDeposited),
    }));

    setPositions([newPos, ...positions]);
    showToast(`Successfully added liquidity to ${newPos.marketSymbol}!`);
    setCurrentView('pool-detail');
  };

  const handleDepositVault = (baseAmount: number, quoteAmount: number) => {
    const totalVal = baseAmount * selectedVault.baseToken.price + quoteAmount;
    const newPos: LiquidityPosition = {
      id: `vault-pos-${Date.now()}`,
      type: 'vault',
      marketId: selectedVault.id,
      marketSymbol: selectedVault.symbol,
      baseDeposited: baseAmount,
      quoteDeposited: quoteAmount,
      baseTokenSymbol: selectedVault.baseToken.symbol,
      quoteTokenSymbol: selectedVault.quoteToken.symbol,
      totalValueUsd: totalVal,
      earnedFeesUsd: 0,
      status: 'in-range',
      createdAt: 'Just now',
    };

    setBalances((prev) => ({
      ...prev,
      [selectedVault.baseToken.symbol]: Math.max(0, (prev[selectedVault.baseToken.symbol] || 0) - baseAmount),
      [selectedVault.quoteToken.symbol]: Math.max(0, (prev[selectedVault.quoteToken.symbol] || 0) - quoteAmount),
    }));

    setPositions([newPos, ...positions]);
    showToast(`Successfully deposited into ${selectedVault.symbol} Vault!`);
  };

  const handleWithdrawPosition = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;

    // Refund balances
    setBalances((prev) => ({
      ...prev,
      [pos.baseTokenSymbol]: (prev[pos.baseTokenSymbol] || 0) + pos.baseDeposited,
      [pos.quoteTokenSymbol]: (prev[pos.quoteTokenSymbol] || 0) + pos.quoteDeposited + pos.earnedFeesUsd,
    }));

    setPositions(positions.filter((p) => p.id !== positionId));
    showToast(`Withdrew position & collected earned fees for ${pos.marketSymbol}!`);
  };

  // Total balance calculation in USD
  const userBalanceUsd =
    (balances.WETH || 0) * 2480.92 +
    (balances.USDC || 0) +
    (balances.MON || 0) * 14.28 +
    (balances.cbBTC || 0) * 68420.0 +
    (balances.AUSD || 0);

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#f1f3f7] flex flex-col font-sans selection:bg-[#b4f04c] selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#16291a] text-[#b4f04c] border border-[#2b5930] px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#b4f04c] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Top Navbar */}
      <Navbar
        activeTab={activeNav}
        onTabChange={(tab) => {
          setActiveNav(tab);
          if (tab === 'liquidity') setCurrentView('overview');
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        isWalletConnected={isWalletConnected}
        walletAddress={walletAddress}
        userBalanceUsd={userBalanceUsd}
        onResetFaucet={handleFaucetRefill}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeNav !== 'liquidity' ? (
          /* Non-liquidity secondary views */
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#171822] border border-[#262836] flex items-center justify-center mx-auto mb-4 text-[#b4f04c] text-2xl font-bold">
              ✦
            </div>
            <h2 className="text-2xl font-bold text-white capitalize mb-2">
              Kuru {activeNav}
            </h2>
            <p className="text-xs text-[#8e92a4] max-w-md mx-auto mb-6">
              You are currently viewing the {activeNav} section. Switch back to Liquidity to explore central limit order book pools, order depth charts, and automated yield vaults.
            </p>
            <button
              onClick={() => {
                setActiveNav('liquidity');
                setCurrentView('overview');
              }}
              className="bg-[#b4f04c] text-black text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#c4f85e] transition-colors"
            >
              Go to Kuru Liquidity
            </button>
          </div>
        ) : (
          /* Liquidity Views */
          <>
            {currentView === 'overview' && (
              <PoolsOverview
                pools={POOLS_DATA}
                vaults={VAULTS_DATA}
                positions={positions}
                onSelectPool={handleSelectPool}
                onSelectVault={handleSelectVault}
                onWithdrawPosition={handleWithdrawPosition}
              />
            )}

            {currentView === 'pool-detail' && (
              <PoolDetail
                pool={selectedPool}
                positions={positions}
                onBackToMarkets={() => setCurrentView('overview')}
                onOpenAddLiquidity={() => setCurrentView('add-liquidity')}
                onWithdrawPosition={handleWithdrawPosition}
              />
            )}

            {currentView === 'add-liquidity' && (
              <AddLiquidityFlow
                pool={selectedPool}
                userBalances={balances}
                onBackToPool={() => setCurrentView('pool-detail')}
                onSuccess={handleAddLiquiditySuccess}
              />
            )}

            {currentView === 'vault-detail' && (
              <VaultDetail
                vault={selectedVault}
                positions={positions}
                userBalances={balances}
                isWalletConnected={isWalletConnected}
                onConnectWallet={() => setIsWalletOpen(true)}
                onBackToOverview={() => setCurrentView('overview')}
                onDepositVault={handleDepositVault}
                onWithdrawVault={handleWithdrawPosition}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        isConnected={isWalletConnected}
        walletAddress={walletAddress}
        balances={balances}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
        onFaucetRefill={handleFaucetRefill}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        pools={POOLS_DATA}
        vaults={VAULTS_DATA}
        onSelectPool={(p) => {
          setSelectedPool(p);
          setCurrentView('pool-detail');
        }}
        onSelectVault={(v) => {
          setSelectedVault(v);
          setCurrentView('vault-detail');
        }}
      />
    </div>
  );
}
