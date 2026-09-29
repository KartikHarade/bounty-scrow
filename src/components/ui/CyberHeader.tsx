'use client';

import React from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi';
import { formatEther } from 'viem';
import { monadTestnet, CONTRACT_ADDRESS, getExplorerAddressUrl } from '@/lib/config';

interface CyberHeaderProps {
  activeTab: 'browse' | 'create' | 'dashboard' | 'terminal';
  setActiveTab: (tab: 'browse' | 'create' | 'dashboard' | 'terminal') => void;
  openCreateModal: () => void;
  totalBountiesCount?: number;
}

export const CyberHeader: React.FC<CyberHeaderProps> = ({
  activeTab,
  setActiveTab,
  openCreateModal,
  totalBountiesCount = 0,
}) => {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const { data: balanceData } = useBalance({
    address,
    chainId: monadTestnet.id,
  });

  const isWrongNetwork = isConnected && chainId !== monadTestnet.id;

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="border-b border-[#2a2a3a] bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top Telemetry Ticker */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a]/60 px-4 py-1 flex items-center justify-between text-[11px] text-[#8a8f9d]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse"></span>
            NETWORK: <strong className="text-[#00ff88]">MONAD TESTNET</strong> (ID: 10143)
          </span>
          <span className="hidden sm:inline text-[#2a2a3a]">|</span>
          <span className="hidden sm:inline">
            ESCROW:{" "}
            {CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" ? (
              <a
                href={getExplorerAddressUrl(CONTRACT_ADDRESS)}
                target="_blank"
                rel="noreferrer"
                className="text-[#00d4ff] hover:underline"
              >
                {truncateAddress(CONTRACT_ADDRESS)}
              </a>
            ) : (
              <span className="text-[#ffb800]">LOCAL / READY TO DEPLOY</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold">
            STATUS: NOMINAL
          </span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('browse')}>
          <div className="w-10 h-10 bg-[#161622] border border-[#00ff88] chamfer-btn flex items-center justify-center glow-green">
            <span className="text-[#00ff88] font-bold text-xl">🛡️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-wider font-[family-name:var(--font-orbitron)] text-white">
                SECURE<span className="text-[#00ff88]">BOUNTY</span>
              </h1>
              <span className="chamfer-badge bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 px-1.5 py-0.2 text-[10px] font-bold">
                ESCROW
              </span>
            </div>
            <p className="text-[11px] text-[#8a8f9d] tracking-widest uppercase">
              Monad Zero-Trust Vulnerability Escrow
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 text-xs">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3 py-2 chamfer-btn transition-all font-semibold flex items-center gap-1.5 ${
              activeTab === 'browse'
                ? 'bg-[#00ff88]/15 text-[#00ff88] border-b-2 border-[#00ff88] glow-green'
                : 'text-[#8a8f9d] hover:text-white hover:bg-[#161622]'
            }`}
          >
            <span>[ 01 ]</span> BOUNTY BOARD
            {totalBountiesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#00ff88]/20 text-[#00ff88] rounded-full text-[10px]">
                {totalBountiesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-2 chamfer-btn transition-all font-semibold flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-[#ff00ff]/15 text-[#ff00ff] border-b-2 border-[#ff00ff] glow-magenta'
                : 'text-[#8a8f9d] hover:text-white hover:bg-[#161622]'
            }`}
          >
            <span>[ 02 ]</span> CREATE BOUNTY
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-2 chamfer-btn transition-all font-semibold flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-[#00d4ff]/15 text-[#00d4ff] border-b-2 border-[#00d4ff] glow-cyan'
                : 'text-[#8a8f9d] hover:text-white hover:bg-[#161622]'
            }`}
          >
            <span>[ 03 ]</span> MY DASHBOARD
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-2 chamfer-btn transition-all font-semibold flex items-center gap-1.5 ${
              activeTab === 'terminal'
                ? 'bg-[#00ff88]/15 text-[#00ff88] border-b-2 border-[#00ff88]'
                : 'text-[#8a8f9d] hover:text-white hover:bg-[#161622]'
            }`}
          >
            <span>[ 04 ]</span> TERMINAL
          </button>
        </nav>

        {/* Wallet Section */}
        <div className="flex items-center gap-3">
          {isWrongNetwork ? (
            <button
              onClick={() => switchChain({ chainId: monadTestnet.id })}
              className="px-4 py-2 chamfer-btn bg-[#ff3366] hover:bg-[#ff3366]/80 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,51,102,0.5)] animate-bounce"
            >
              ⚠️ Switch to Monad Testnet
            </button>
          ) : !isConnected ? (
            <div className="flex items-center gap-2">
              {connectors.slice(0, 1).map((connector) => (
                <button
                  key={connector.uid}
                  disabled={isPending}
                  onClick={() => connect({ connector })}
                  className="px-4 py-2 chamfer-btn bg-[#00ff88] hover:bg-[#00ff88]/80 text-black font-bold text-xs uppercase tracking-wider transition-all glow-green flex items-center gap-2"
                >
                  <span>🦊</span> {isPending ? 'Connecting...' : 'Connect MetaMask'}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#12121a] border border-[#2a2a3a] p-1 chamfer-card">
              {/* Balance */}
              <div className="px-3 py-1 text-right hidden sm:block">
                <p className="text-[10px] text-[#8a8f9d] uppercase">MON Balance</p>
                <p className="text-xs font-bold text-[#00ff88] font-mono">
                  {balanceData ? `${parseFloat(formatEther(balanceData.value)).toFixed(3)} MON` : '0.00 MON'}
                </p>
              </div>

              {/* Address Badge */}
              <div className="px-3 py-1.5 bg-[#161622] border border-[#00ff88]/30 chamfer-badge flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></span>
                <span className="font-mono text-xs text-white">
                  {address ? truncateAddress(address) : ''}
                </span>
              </div>

              {/* Disconnect button */}
              <button
                onClick={() => disconnect()}
                title="Disconnect wallet"
                className="px-2 py-1.5 text-xs text-[#8a8f9d] hover:text-[#ff3366] hover:bg-[#ff3366]/10 chamfer-btn transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
