'use client';

import React, { useState } from 'react';
import { parseEther, keccak256, toBytes } from 'viem';
import { SEVERITY_MAP } from '@/lib/types';

interface CreateBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, severity: number, detailsHash: `0x${string}`, rewardWei: bigint) => void;
  isLoading: boolean;
}

export const CreateBountyModal: React.FC<CreateBountyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<number>(4); // Default to Critical
  const [rewardAmount, setRewardAmount] = useState('1.0');
  const [scopeDetails, setScopeDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rewardAmount || parseFloat(rewardAmount) <= 0) return;

    // Generate cryptographic hash of scope and terms client-side
    const detailsContent = scopeDetails.trim() || `Scope terms for ${title.trim()}`;
    const detailsHash = keccak256(toBytes(detailsContent));
    const rewardWei = parseEther(rewardAmount);

    onSubmit(title.trim(), severity, detailsHash, rewardWei);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="chamfer-card bg-[#12121a] border border-[#ff00ff]/60 max-w-xl w-full p-6 glow-magenta relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div>
              <h2 className="text-base font-bold text-white font-[family-name:var(--font-orbitron)] tracking-wider">
                INITIALIZE ESCROWED BOUNTY
              </h2>
              <p className="text-[11px] text-[#8a8f9d]">
                Funds are held trustlessly by the Monad BountyEscrow contract
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#8a8f9d] hover:text-white text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-[#ff00ff]/10 border border-[#ff00ff]/30 p-3 rounded mb-5 text-xs text-[#e0e0e0] flex items-start gap-2.5">
          <span className="text-[#ff00ff] font-bold text-base leading-none">⚠️</span>
          <div>
            <strong className="text-[#ff00ff]">Escrow Guarantee Notice:</strong> Your reward of{' '}
            <span className="text-[#00ff88] font-bold font-mono">
              {rewardAmount || '0'} MON
            </span>{' '}
            will be immediately deducted and locked in the smart contract. You can only recover it by
            cancelling when no submissions are pending review.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Title */}
          <div>
            <label className="block text-[#8a8f9d] uppercase mb-1">
              Bounty Target / Vulnerability Scope Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AUTH BYPASS IN PAYMENT API"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#00ff88] text-white p-2.5 rounded outline-none"
            />
          </div>

          {/* Severity & Reward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8a8f9d] uppercase mb-1">
                Target Severity Level *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#00ff88] text-white p-2.5 rounded outline-none"
              >
                <option value={1}>1 — LOW [Informational / Low Impact]</option>
                <option value={2}>2 — MEDIUM [Limited Exploitability]</option>
                <option value={3}>3 — HIGH [Substantial Vulnerability]</option>
                <option value={4}>4 — CRITICAL [Remote Code / Fund Drain]</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8a8f9d] uppercase mb-1">
                Escrow Reward (MON) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  placeholder="e.g. 1.0 or 25.0"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#00ff88] text-[#00ff88] font-bold p-2.5 rounded outline-none pr-12"
                />
                <span className="absolute right-3 top-2.5 text-[#8a8f9d] font-bold">MON</span>
              </div>
            </div>
          </div>

          {/* Scope details */}
          <div>
            <label className="block text-[#8a8f9d] uppercase mb-1">
              Scope Specifications & Disclosure Rules (Hashed On-Chain)
            </label>
            <textarea
              rows={3}
              placeholder="Define repos in scope, test URLs, out-of-scope assets, and eligibility criteria..."
              value={scopeDetails}
              onChange={(e) => setScopeDetails(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#00ff88] text-white p-2.5 rounded outline-none"
            />
            <p className="text-[10px] text-[#8a8f9d] mt-1">
              Fingerprint: Keccak256 hash computed and stored on Monad.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a3a]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 chamfer-btn bg-[#161622] hover:bg-[#2a2a3a] text-[#8a8f9d] hover:text-white uppercase font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !title.trim() || !rewardAmount}
              className="px-6 py-2 chamfer-btn bg-[#00ff88] hover:bg-[#00ff88]/90 text-black font-extrabold uppercase tracking-wider glow-green disabled:opacity-50"
            >
              {isLoading ? 'Locking in Escrow...' : `Lock ${rewardAmount || '0'} MON & Create`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
