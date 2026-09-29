'use client';

import React from 'react';
import { getExplorerTxUrl } from '@/lib/config';

export type TxStep = 'IDLE' | 'WALLET_CONFIRMATION' | 'SUBMITTING' | 'CONFIRMED' | 'ERROR';

interface TxStatusToastProps {
  step: TxStep;
  txHash?: `0x${string}`;
  errorMsg?: string;
  actionTitle?: string;
  onClose: () => void;
}

export const TxStatusToast: React.FC<TxStatusToastProps> = ({
  step,
  txHash,
  errorMsg,
  actionTitle = 'Transaction',
  onClose,
}) => {
  if (step === 'IDLE') return null;

  return (
    <aside
      aria-label="Transaction notification"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slide-up shadow-2xl"
    >
      <div
        className={`chamfer-card border p-4 bg-[#12121a]/95 backdrop-blur-xl ${
          step === 'CONFIRMED'
            ? 'border-[#00ff88] glow-green'
            : step === 'ERROR'
            ? 'border-[#ff3366] shadow-[0_0_15px_rgba(255,51,102,0.4)]'
            : step === 'SUBMITTING'
            ? 'border-[#00d4ff] glow-cyan'
            : 'border-[#ff00ff] glow-magenta'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            {step === 'WALLET_CONFIRMATION' && (
              <span className="text-[#ff00ff] text-lg animate-bounce">🦊</span>
            )}
            {step === 'SUBMITTING' && (
              <span className="w-4 h-4 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin"></span>
            )}
            {step === 'CONFIRMED' && (
              <span className="text-[#00ff88] text-lg font-bold">✓</span>
            )}
            {step === 'ERROR' && (
              <span className="text-[#ff3366] text-lg font-bold">✕</span>
            )}

            <h3 className="font-bold text-xs uppercase tracking-wider font-[family-name:var(--font-orbitron)]">
              {step === 'WALLET_CONFIRMATION' && '1/3 // CONFIRM IN WALLET'}
              {step === 'SUBMITTING' && '2/3 // MINING ON MONAD TESTNET'}
              {step === 'CONFIRMED' && '3/3 // TRANSACTION CONFIRMED'}
              {step === 'ERROR' && 'TRANSACTION ABORTED / FAILED'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-[#8a8f9d] hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-[#8a8f9d] mb-2">{actionTitle}</p>

        {step === 'WALLET_CONFIRMATION' && (
          <p className="text-xs text-[#e0e0e0] bg-[#161622] p-2.5 rounded border border-[#2a2a3a]">
            Please sign and approve the transaction in your MetaMask wallet popup...
          </p>
        )}

        {step === 'SUBMITTING' && (
          <div className="space-y-2">
            <p className="text-xs text-[#00d4ff]">
              Broadcasted to Monad mempool. Waiting for block inclusion...
            </p>
            {txHash && (
              <div className="bg-[#0a0a0f] p-2 rounded border border-[#2a2a3a] text-[11px] font-mono flex items-center justify-between">
                <span className="text-[#8a8f9d] truncate max-w-[220px]">
                  TX: {txHash}
                </span>
                <a
                  href={getExplorerTxUrl(txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00d4ff] hover:underline font-semibold"
                >
                  Explorer ↗
                </a>
              </div>
            )}
          </div>
        )}

        {step === 'CONFIRMED' && (
          <div className="space-y-2">
            <p className="text-xs text-[#00ff88] font-semibold">
              State successfully updated on Monad Testnet!
            </p>
            {txHash && (
              <div className="bg-[#0a0a0f] p-2 rounded border border-[#00ff88]/30 text-[11px] font-mono flex items-center justify-between">
                <span className="text-[#8a8f9d] truncate max-w-[220px]">
                  TX: {txHash}
                </span>
                <a
                  href={getExplorerTxUrl(txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00ff88] hover:underline font-semibold"
                >
                  View on Explorer ↗
                </a>
              </div>
            )}
          </div>
        )}

        {step === 'ERROR' && (
          <div className="bg-[#ff3366]/10 p-2.5 rounded border border-[#ff3366]/30 text-xs text-[#ff3366] break-words">
            {errorMsg || 'Transaction rejected or execution reverted.'}
          </div>
        )}
      </div>
    </aside>
  );
};
