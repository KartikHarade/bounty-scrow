'use client';

import React from 'react';
import { formatEther } from 'viem';
import { BountyItem, BountyStatus, SubmissionItem, SubmissionStatus, SEVERITY_MAP } from '@/lib/types';
import { getExplorerAddressUrl } from '@/lib/config';

interface CompanyDashboardProps {
  bounties: BountyItem[];
  submissionsMap: Record<string, SubmissionItem>;
  currentAddress?: `0x${string}`;
  onApprove: (bountyId: bigint) => void;
  onReject: (bountyId: bigint) => void;
  onCancel: (bountyId: bigint) => void;
  isLoading: boolean;
  onCreateClick: () => void;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({
  bounties,
  submissionsMap,
  currentAddress,
  onApprove,
  onReject,
  onCancel,
  isLoading,
  onCreateClick,
}) => {
  const companyBounties = bounties.filter(
    (b) => currentAddress && b.creator.toLowerCase() === currentAddress.toLowerCase()
  );

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };

  if (!currentAddress) {
    return (
      <div className="chamfer-card bg-[#12121a] border border-[#2a2a3a] p-8 text-center">
        <p className="text-[#8a8f9d] mb-4">Please connect your MetaMask wallet to view your company bounties.</p>
      </div>
    );
  }

  if (companyBounties.length === 0) {
    return (
      <div className="chamfer-card bg-[#12121a] border border-[#2a2a3a] p-10 text-center">
        <span className="text-4xl mb-3 block">🏢</span>
        <h3 className="text-base font-bold text-white mb-2 font-[family-name:var(--font-orbitron)]">
          NO SPONSORED BOUNTIES FOUND
        </h3>
        <p className="text-xs text-[#8a8f9d] max-w-md mx-auto mb-6">
          You have not created any escrowed security bounties with this wallet yet.
        </p>
        <button
          onClick={onCreateClick}
          className="px-6 py-2.5 chamfer-btn bg-[#ff00ff] hover:bg-[#ff00ff]/90 text-white font-bold text-xs uppercase tracking-wider glow-magenta"
        >
          + Create Your First Bounty & Lock MON
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white font-[family-name:var(--font-orbitron)] flex items-center gap-2">
            <span>🏢</span> SPONSOR ORGANIZATION DASHBOARD
          </h2>
          <p className="text-xs text-[#8a8f9d]">
            Manage and review vulnerability submissions for your escrowed bounties.
          </p>
        </div>

        <button
          onClick={onCreateClick}
          className="px-4 py-2 chamfer-btn bg-[#00ff88] hover:bg-[#00ff88]/90 text-black font-extrabold text-xs uppercase tracking-wider glow-green"
        >
          + Create Bounty
        </button>
      </div>

      <div className="space-y-4">
        {companyBounties.map((bounty) => {
          const submission = submissionsMap[bounty.id.toString()];
          const hasPending = submission && submission.status === SubmissionStatus.PENDING;
          const severityInfo = SEVERITY_MAP[bounty.severity] || SEVERITY_MAP[1];

          return (
            <div
              key={bounty.id.toString()}
              className="chamfer-card bg-[#12121a] border border-[#2a2a3a] p-5 space-y-4"
            >
              {/* Header Row */}
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
                    {formatEther(bounty.reward)} MON Escrowed
                  </span>
                  <span
                    className={`chamfer-badge text-[10px] font-bold px-2.5 py-0.5 ${
                      bounty.status === BountyStatus.OPEN
                        ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30'
                        : bounty.status === BountyStatus.PAID
                        ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30'
                        : 'bg-[#ff3366]/10 text-[#ff3366] border border-[#ff3366]/30'
                    }`}
                  >
                    {bounty.status === BountyStatus.OPEN
                      ? 'OPEN'
                      : bounty.status === BountyStatus.PAID
                      ? 'PAID'
                      : 'CANCELLED'}
                  </span>
                </div>
              </div>

              {/* Submission Review Box */}
              {submission && submission.status !== SubmissionStatus.NONE ? (
                <div
                  className={`p-4 rounded border ${
                    submission.status === SubmissionStatus.PENDING
                      ? 'bg-[#ff00ff]/5 border-[#ff00ff]/40 glow-magenta'
                      : submission.status === SubmissionStatus.APPROVED
                      ? 'bg-[#00ff88]/5 border-[#00ff88]/30'
                      : 'bg-[#2a2a3a]/40 border-[#2a2a3a]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-[family-name:var(--font-orbitron)]">
                      {submission.status === SubmissionStatus.PENDING && (
                        <>
                          <span className="w-2 h-2 rounded-full bg-[#ff00ff] animate-ping"></span>
                          <span className="text-[#ff00ff]">SUBMISSION RECEIVED // REVIEW REQUIRED</span>
                        </>
                      )}
                      {submission.status === SubmissionStatus.APPROVED && (
                        <>
                          <span className="text-[#00ff88]">✓ BOUNTY PAID</span>
                        </>
                      )}
                      {submission.status === SubmissionStatus.REJECTED && (
                        <>
                          <span className="text-[#ff3366]">✕ FINDING REJECTED (BOUNTY REOPENED)</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] font-mono text-[#8a8f9d]">
                      Status:{' '}
                      <strong className="text-white">
                        {submission.status === SubmissionStatus.PENDING
                          ? 'PENDING'
                          : submission.status === SubmissionStatus.APPROVED
                          ? 'APPROVED'
                          : 'REJECTED'}
                      </strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-[#0a0a0f] p-3 rounded border border-[#2a2a3a]/80 mb-3">
                    <div>
                      <span className="text-[#8a8f9d]">Researcher: </span>
                      <a
                        href={getExplorerAddressUrl(submission.researcher)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00d4ff] hover:underline"
                      >
                        {truncateAddress(submission.researcher)}
                      </a>
                    </div>
                    <div>
                      <span className="text-[#8a8f9d]">Report Hash: </span>
                      <span className="text-[#e0e0e0]" title={submission.reportHash}>
                        {truncateHash(submission.reportHash)}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Pending Finding */}
                  {submission.status === SubmissionStatus.PENDING && (
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => onApprove(bounty.id)}
                        disabled={isLoading}
                        className="px-4 py-2 chamfer-btn bg-[#00ff88] hover:bg-[#00ff88]/90 text-black font-extrabold text-xs uppercase tracking-wider glow-green disabled:opacity-50"
                      >
                        ✓ APPROVE &amp; PAY ({formatEther(bounty.reward)} MON)
                      </button>

                      <button
                        onClick={() => onReject(bounty.id)}
                        disabled={isLoading}
                        className="px-4 py-2 chamfer-btn bg-[#ff3366]/20 hover:bg-[#ff3366]/30 text-[#ff3366] border border-[#ff3366]/50 font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                      >
                        ✕ REJECT FINDING
                      </button>
                    </div>
                  )}

                  {submission.status === SubmissionStatus.APPROVED && (
                    <p className="text-xs text-[#00ff88] font-mono">
                      Payout of {formatEther(bounty.reward)} MON successfully transferred on-chain to{' '}
                      {truncateAddress(submission.researcher)}.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-xs text-[#8a8f9d] italic bg-[#0a0a0f] p-3 rounded border border-[#2a2a3a]/50">
                  No submissions submitted yet. Waiting for security researchers...
                </div>
              )}

              {/* Bottom Actions */}
              {bounty.status === BountyStatus.OPEN && (
                <div className="flex items-center justify-between pt-2 border-t border-[#2a2a3a]/40 text-xs">
                  <span className="text-[#8a8f9d]">
                    {hasPending
                      ? '⚠️ Submission pending review: Cancellation is locked until approved or rejected.'
                      : 'No active submissions. You may cancel and withdraw your escrowed reward.'}
                  </span>

                  <button
                    onClick={() => onCancel(bounty.id)}
                    disabled={isLoading || hasPending}
                    title={hasPending ? 'Cannot cancel with pending submission' : 'Refund MON to wallet'}
                    className="px-3 py-1.5 chamfer-btn bg-[#161622] hover:bg-[#ff3366]/20 text-[#8a8f9d] hover:text-[#ff3366] border border-[#2a2a3a] hover:border-[#ff3366]/50 uppercase font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Cancel Bounty &amp; Refund
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
