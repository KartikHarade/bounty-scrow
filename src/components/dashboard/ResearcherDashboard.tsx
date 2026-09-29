'use client';

import React from 'react';
import { formatEther } from 'viem';
import { BountyItem, SubmissionItem, SubmissionStatus, SEVERITY_MAP } from '@/lib/types';
import { getExplorerAddressUrl } from '@/lib/config';

interface ResearcherDashboardProps {
  bounties: BountyItem[];
  submissionsMap: Record<string, SubmissionItem>;
  currentAddress?: `0x${string}`;
  onExploreClick: () => void;
}

export const ResearcherDashboard: React.FC<ResearcherDashboardProps> = ({
  bounties,
  submissionsMap,
  currentAddress,
  onExploreClick,
}) => {
  const researcherSubmissions: { bounty: BountyItem; submission: SubmissionItem }[] = [];

  if (currentAddress) {
    bounties.forEach((bounty) => {
      const sub = submissionsMap[bounty.id.toString()];
      if (sub && sub.researcher.toLowerCase() === currentAddress.toLowerCase()) {
        researcherSubmissions.push({ bounty, submission: sub });
      }
    });
  }

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (!currentAddress) {
    return (
      <div className="chamfer-card bg-[#12121a] border border-[#2a2a3a] p-8 text-center">
        <p className="text-[#8a8f9d] mb-4">Please connect your MetaMask wallet to view your researcher submissions.</p>
      </div>
    );
  }

  if (researcherSubmissions.length === 0) {
    return (
      <div className="chamfer-card bg-[#12121a] border border-[#2a2a3a] p-10 text-center">
        <span className="text-4xl mb-3 block">🔬</span>
        <h3 className="text-base font-bold text-white mb-2 font-[family-name:var(--font-orbitron)]">
          NO RESEARCHER SUBMISSIONS FOUND
        </h3>
        <p className="text-xs text-[#8a8f9d] max-w-md mx-auto mb-6">
          You haven&apos;t submitted any vulnerability findings yet. Browse open bounties on Monad to start hacking.
        </p>
        <button
          onClick={onExploreClick}
          className="px-6 py-2.5 chamfer-btn bg-[#00ff88] hover:bg-[#00ff88]/90 text-black font-extrabold text-xs uppercase tracking-wider glow-green"
        >
          ⚡ Browse Open Bounties
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white font-[family-name:var(--font-orbitron)] flex items-center gap-2">
          <span>🔬</span> SECURITY RESEARCHER DOSSIER
        </h2>
        <p className="text-xs text-[#8a8f9d]">
          Track your vulnerability claims, hash verification status, and on-chain payouts.
        </p>
      </div>

      <div className="space-y-4">
        {researcherSubmissions.map(({ bounty, submission }) => {
          const severityInfo = SEVERITY_MAP[bounty.severity] || SEVERITY_MAP[1];

          return (
            <div
              key={bounty.id.toString()}
              className="chamfer-card bg-[#12121a] border border-[#2a2a3a] p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2a2a3a] pb-3">
                <div className="flex items-center gap-2.5">
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
                    {severityInfo.label}
                  </span>
                  <h3 className="font-bold text-white text-sm font-[family-name:var(--font-orbitron)]">
                    {bounty.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-[#00ff88] font-mono">
                    {formatEther(bounty.reward)} MON Bounty
                  </span>

                  <span
                    className={`chamfer-badge text-[10px] font-bold px-2.5 py-0.5 ${
                      submission.status === SubmissionStatus.PENDING
                        ? 'bg-[#ff00ff]/10 text-[#ff00ff] border border-[#ff00ff]/30'
                        : submission.status === SubmissionStatus.APPROVED
                        ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 glow-green'
                        : 'bg-[#ff3366]/10 text-[#ff3366] border border-[#ff3366]/30'
                    }`}
                  >
                    {submission.status === SubmissionStatus.PENDING
                      ? 'UNDER REVIEW'
                      : submission.status === SubmissionStatus.APPROVED
                      ? 'PAID TO WALLET ✓'
                      : 'REJECTED'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-[#0a0a0f] p-3 rounded border border-[#2a2a3a]">
                <div>
                  <span className="text-[#8a8f9d]">Sponsor: </span>
                  <a
                    href={getExplorerAddressUrl(bounty.creator)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00d4ff] hover:underline"
                  >
                    {truncateAddress(bounty.creator)}
                  </a>
                </div>
                <div>
                  <span className="text-[#8a8f9d]">Report Proof Hash: </span>
                  <span className="text-[#e0e0e0]" title={submission.reportHash}>
                    {truncateHash(submission.reportHash)}
                  </span>
                </div>
              </div>

              {submission.status === SubmissionStatus.APPROVED && (
                <div className="p-3 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded text-xs text-[#00ff88] flex items-center justify-between">
                  <span>
                    🎉 Escrow released! <strong>{formatEther(bounty.reward)} MON</strong> was paid directly to your
                    wallet.
                  </span>
                  <span className="font-bold">VERIFIED ON-CHAIN</span>
                </div>
              )}

              {submission.status === SubmissionStatus.PENDING && (
                <div className="p-3 bg-[#ff00ff]/10 border border-[#ff00ff]/30 rounded text-xs text-[#ff00ff] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff00ff] animate-ping"></span>
                  <span>
                    Finding hash is sealed on-chain. Organization is currently verifying reproduction steps.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
