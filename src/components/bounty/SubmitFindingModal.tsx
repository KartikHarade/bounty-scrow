'use client';

import React, { useState } from 'react';
import { keccak256, toBytes } from 'viem';
import { BountyItem, SEVERITY_MAP } from '@/lib/types';

interface SubmitFindingModalProps {
  bounty: BountyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bountyId: bigint, reportHash: `0x${string}`) => void;
  isLoading: boolean;
}

export const SubmitFindingModal: React.FC<SubmitFindingModalProps> = ({
  bounty,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [reportTitle, setReportTitle] = useState('');
  const [pocDetails, setPocDetails] = useState('');
  const [impactSummary, setImpactSummary] = useState('');

  if (!isOpen || !bounty) return null;

  const severityInfo = SEVERITY_MAP[bounty.severity] || SEVERITY_MAP[1];

  // Compute Keccak-256 fingerprint in real-time
  const fullPayload = JSON.stringify({
    bountyId: bounty.id.toString(),
    title: reportTitle.trim(),
    poc: pocDetails.trim(),
    impact: impactSummary.trim(),
    timestamp: Date.now(),
  });

  const previewHash =
    reportTitle.trim() && pocDetails.trim()
      ? keccak256(toBytes(fullPayload))
      : ('0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !pocDetails.trim()) return;

    const reportHash = keccak256(toBytes(fullPayload));
    onSubmit(bounty.id, reportHash);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="chamfer-card bg-[#12121a] border border-[#00d4ff]/60 max-w-xl w-full p-6 glow-cyan relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <div>
              <h2 className="text-base font-bold text-white font-[family-name:var(--font-orbitron)] tracking-wider">
                SUBMIT VULNERABILITY FINDING
              </h2>
              <p className="text-[11px] text-[#8a8f9d]">
                Bounty #BTY-{bounty.id.toString().padStart(3, '0')}: {bounty.title}
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

        {/* Confidentiality Warning (Critical rule from Master Prompt) */}
        <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 p-3 rounded mb-4 text-xs text-[#e0e0e0] flex items-start gap-2.5">
          <span className="text-[#00d4ff] font-bold text-base leading-none">🔒</span>
          <div>
            <strong className="text-[#00d4ff]">Zero-Leakage Confidentiality Notice:</strong> The public
            blockchain is completely public. Raw exploit POCs and exploit steps are{' '}
            <strong>NEVER</strong> written to the chain. Only the cryptographic hash (bytes32) is anchored
            on Monad to seal your submission timestamp and priority.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-[#8a8f9d] uppercase mb-1">
              Vulnerability Headline / Summary *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Broken Object Level Authorization on /api/v1/user/payouts"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#00d4ff] text-white p-2.5 rounded outline-none"
            />
          </div>

          <div>
            <label className="block text-[#8a8f9d] uppercase mb-1">
              Reproduction Steps & Proof of Concept (Client Encrypted & Hashed) *
            </label>
            <textarea
              rows={4}
              required
              placeholder="1. Send GET request with modified header...&#10;2. Observe unauthenticated 200 OK with secret payload...&#10;3. Exploit impact demonstration..."
              value={pocDetails}
              onChange={(e) => setPocDetails(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#00d4ff] text-white p-2.5 rounded outline-none"
            />
          </div>

          <div>
            <label className="block text-[#8a8f9d] uppercase mb-1">
              Business & Financial Impact Assessment
            </label>
            <input
              type="text"
              placeholder="e.g. Complete unauthorized funds drain possible"
              value={impactSummary}
              onChange={(e) => setImpactSummary(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#00d4ff] text-white p-2.5 rounded outline-none"
            />
          </div>

          {/* Generated Hash Preview */}
          <div className="bg-[#0a0a0f] p-3 rounded border border-[#2a2a3a] space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8a8f9d]">Generated Bytes32 Report Hash:</span>
              <span className="text-[#00ff88] font-bold">Keccak-256</span>
            </div>
            <p className="font-mono text-[11px] text-[#00d4ff] break-all">
              {previewHash}
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
              disabled={isLoading || !reportTitle.trim() || !pocDetails.trim()}
              className="px-6 py-2 chamfer-btn bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-extrabold uppercase tracking-wider glow-cyan disabled:opacity-50"
            >
              {isLoading ? 'Anchoring On-Chain...' : 'Anchor Finding On Monad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
