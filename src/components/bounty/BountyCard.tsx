'use client';

import React from 'react';
import { formatEther } from 'viem';
import { BountyItem, BountyStatus, SEVERITY_MAP } from '@/lib/types';
import { getExplorerAddressUrl } from '@/lib/config';

interface BountyCardProps {
  bounty: BountyItem;
  currentAddress?: `0x${string}`;
  onSubmitFinding: (bounty: BountyItem) => void;
  onManageBounty: (bountyId: bigint) => void;
}

export const BountyCard: React.FC<BountyCardProps> = ({
  bounty,
  currentAddress,
  onSubmitFinding,
  onManageBounty,
}) => {
  const isCreator = currentAddress && bounty.creator.toLowerCase() === currentAddress.toLowerCase();
  const severityInfo = SEVERITY_MAP[bounty.severity] || SEVERITY_MAP[1];

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
  };

  const getStatusDisplay = (status: BountyStatus) => {
    switch (status) {
      case BountyStatus.OPEN:
        return {
          label: 'OPEN FOR FINDINGS',
          color: '#00ff88',
          bg: 'rgba(0, 255, 136, 0.1)',
          border: '#00ff8855',
          dot: 'bg-[#00ff88]',
        };
      case BountyStatus.PAID:
        return {
          label: 'BOUNTY PAID',
          color: '#00d4ff',
          bg: 'rgba(0, 212, 255, 0.1)',
          border: '#00d4ff55',
          dot: 'bg-[#00d4ff]',
        };
      case BountyStatus.CANCELLED:
        return {
          label: 'CANCELLED & REFUNDED',
          color: '#ff3366',
          bg: 'rgba(255, 51, 102, 0.1)',
          border: '#ff336655',
          dot: 'bg-[#ff3366]',
        };
    }
  };

  const statusInfo = getStatusDisplay(bounty.status);
  const rewardEth = formatEther(bounty.reward);

  return (
    <div className="chamfer-card bg-[#12121a] border border-[#2a2a3a] hover:border-[#00ff88]/60 transition-all p-5 flex flex-col justify-between group hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] relative">
      {/* Top Header Tags */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#8a8f9d] bg-[#161622] px-2 py-0.5 rounded border border-[#2a2a3a]">
              #BTY-{bounty.id.toString().padStart(3, '0')}
            </span>
            <span
              className="chamfer-badge text-[10px] font-bold px-2 py-0.5"
              style={{
                color: severityInfo.color,
                backgroundColor: severityInfo.bg,
                border: `1px solid ${severityInfo.border}`,
              }}
            >
              SEV: {severityInfo.label}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
            style={{
              color: statusInfo.color,
              backgroundColor: statusInfo.bg,
              border: `1px solid ${statusInfo.border}`,
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} ${bounty.status === BountyStatus.OPEN ? 'animate-pulse' : ''}`}></span>
            {statusInfo.label}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-[#00ff88] transition-colors mb-3 line-clamp-2 font-[family-name:var(--font-orbitron)]">
          {bounty.title}
        </h3>

        {/* Details Meta */}
        <div className="space-y-1.5 text-xs text-[#8a8f9d] mb-4 bg-[#0a0a0f] p-3 rounded border border-[#2a2a3a]/70">
          <div className="flex items-center justify-between">
            <span>Sponsor Org:</span>
            <a
              href={getExplorerAddressUrl(bounty.creator)}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[#e0e0e0] hover:text-[#00d4ff] hover:underline"
            >
              {truncateAddress(bounty.creator)} {isCreator ? '(You)' : ''}
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span>Scope Hash:</span>
            <span className="font-mono text-[11px] text-[#8a8f9d]" title={bounty.detailsHash}>
              {truncateHash(bounty.detailsHash)}
            </span>
          </div>
        </div>
      </div>

      {/* Reward & Action */}
      <div className="border-t border-[#2a2a3a] pt-4 mt-2">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[10px] text-[#8a8f9d] uppercase tracking-wider">Locked Reward</p>
            <p className="text-xl font-extrabold text-[#00ff88] text-glow-green font-mono">
              {rewardEth} <span className="text-xs font-normal text-white">MON</span>
            </p>
          </div>
          <span className="text-[11px] text-[#8a8f9d] font-mono">
            ≈ On-Chain Escrow
          </span>
        </div>

        {/* Action Button */}
        {bounty.status === BountyStatus.OPEN ? (
          isCreator ? (
            <button
              onClick={() => onManageBounty(bounty.id)}
              className="w-full py-2.5 chamfer-btn bg-[#161622] hover:bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff]/50 font-bold text-xs uppercase tracking-wider transition-all"
            >
              ⚙️ Manage Bounty in Dashboard
            </button>
          ) : (
            <button
              onClick={() => onSubmitFinding(bounty)}
              className="w-full py-2.5 chamfer-btn bg-[#00ff88] hover:bg-[#00ff88]/90 text-black font-extrabold text-xs uppercase tracking-wider transition-all glow-green"
            >
              ⚡ Submit Vulnerability Finding
            </button>
          )
        ) : bounty.status === BountyStatus.PAID ? (
          <div className="w-full py-2 bg-[#00d4ff]/10 border border-[#00d4ff]/40 text-[#00d4ff] text-center text-xs font-bold chamfer-btn">
            ✓ Escrow Released to Researcher
          </div>
        ) : (
          <div className="w-full py-2 bg-[#ff3366]/10 border border-[#ff3366]/40 text-[#ff3366] text-center text-xs font-bold chamfer-btn">
            ✕ Bounty Cancelled & Refunded
          </div>
        )}
      </div>
    </div>
  );
};
