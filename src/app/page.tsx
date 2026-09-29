'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  usePublicClient,
} from 'wagmi';
import { formatEther, parseEther, keccak256, toBytes } from 'viem';
import { bountyEscrowAbi } from '@/lib/abi';
import { CONTRACT_ADDRESS, monadTestnet } from '@/lib/config';
import { BountyItem, BountyStatus, SubmissionItem, SubmissionStatus } from '@/lib/types';
import { CyberHeader } from '@/components/ui/CyberHeader';
import { BountyCard } from '@/components/bounty/BountyCard';
import { CreateBountyModal } from '@/components/bounty/CreateBountyModal';
import { SubmitFindingModal } from '@/components/bounty/SubmitFindingModal';
import { CompanyDashboard } from '@/components/dashboard/CompanyDashboard';
import { ResearcherDashboard } from '@/components/dashboard/ResearcherDashboard';
import { TerminalBox } from '@/components/ui/TerminalBox';
import { TxStatusToast, TxStep } from '@/components/ui/TxStatusToast';

export default function HomePage() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'dashboard' | 'terminal'>('browse');
  const [dashboardRole, setDashboardRole] = useState<'company' | 'researcher'>('company');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBountyForSubmit, setSelectedBountyForSubmit] = useState<BountyItem | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<BountyStatus | 'ALL'>('ALL');

  // Submissions cache map: bountyId -> SubmissionItem
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, SubmissionItem>>({});
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  // Transaction feedback tracking
  const [txStep, setTxStep] = useState<TxStep>('IDLE');
  const [actionTitle, setActionTitle] = useState('');
  const [txError, setTxError] = useState<string | undefined>();

  // Read all bounties from contract
  const {
    data: allBountiesRaw,
    refetch: refetchBounties,
    isLoading: isBountiesLoading,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: bountyEscrowAbi,
    functionName: 'getAllBounties',
    query: {
      enabled: isConnected && !!CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });

  const bounties: BountyItem[] = useMemo(() => {
    if (!allBountiesRaw || !Array.isArray(allBountiesRaw)) return [];
    return (allBountiesRaw as any[]).map((b) => ({
      id: BigInt(b.id),
      creator: b.creator as `0x${string}`,
      reward: BigInt(b.reward),
      title: b.title,
      severity: Number(b.severity),
      detailsHash: b.detailsHash as `0x${string}`,
      status: Number(b.status) as BountyStatus,
    }));
  }, [allBountiesRaw]);

  // Fetch submissions for bounties
  useEffect(() => {
    if (!publicClient || bounties.length === 0 || !CONTRACT_ADDRESS) return;

    let isMounted = true;
    async function loadSubmissions() {
      const newMap: Record<string, SubmissionItem> = {};
      for (const b of bounties) {
        try {
          const sub = (await publicClient!.readContract({
            address: CONTRACT_ADDRESS,
            abi: bountyEscrowAbi,
            functionName: 'getSubmission',
            args: [b.id],
          })) as any;

          if (sub) {
            newMap[b.id.toString()] = {
              researcher: sub.researcher,
              reportHash: sub.reportHash,
              status: Number(sub.status) as SubmissionStatus,
            };
          }
        } catch {
          // ignore empty
        }
      }
      if (isMounted) {
        setSubmissionsMap(newMap);
      }
    }

    loadSubmissions();
    return () => {
      isMounted = false;
    };
  }, [publicClient, bounties]);

  // Write contract hook
  const {
    data: txHash,
    writeContractAsync,
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract();

  // Receipt confirmation hook
  const { isLoading: isWaitingForReceipt, isSuccess: isReceiptSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // Watch receipt status
  useEffect(() => {
    if (isWaitingForReceipt) {
      setTxStep('SUBMITTING');
    }
  }, [isWaitingForReceipt]);

  useEffect(() => {
    if (isReceiptSuccess && txHash) {
      setTxStep('CONFIRMED');
      refetchBounties();
      setSystemLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] TX CONFIRMED: ${txHash.substring(0, 12)}...`,
      ]);
      setIsCreateOpen(false);
      setSelectedBountyForSubmit(null);
    }
  }, [isReceiptSuccess, txHash, refetchBounties]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Action Helpers
  const ensureMonadNetwork = () => {
    if (chainId !== monadTestnet.id && switchChain) {
      switchChain({ chainId: monadTestnet.id });
      return false;
    }
    return true;
  };

  const handleCreateBounty = async (
    title: string,
    severity: number,
    detailsHash: `0x${string}`,
    rewardWei: bigint
  ) => {
    if (!ensureMonadNetwork()) return;
    try {
      setTxError(undefined);
      setActionTitle(`Create Bounty: "${title}" (${formatEther(rewardWei)} MON locked in Escrow)`);
      setTxStep('WALLET_CONFIRMATION');

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: bountyEscrowAbi,
        functionName: 'createBounty',
        args: [title, severity, detailsHash],
        value: rewardWei,
      });
    } catch (err: any) {
      setTxStep('ERROR');
      setTxError(err?.shortMessage || err?.message || 'Failed to create bounty');
    }
  };

  const handleSubmitFinding = async (bountyId: bigint, reportHash: `0x${string}`) => {
    if (!ensureMonadNetwork()) return;
    try {
      setTxError(undefined);
      setActionTitle(`Submit Finding Hash on Bounty #BTY-${bountyId.toString()}`);
      setTxStep('WALLET_CONFIRMATION');

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: bountyEscrowAbi,
        functionName: 'submitFinding',
        args: [bountyId, reportHash],
      });
    } catch (err: any) {
      setTxStep('ERROR');
      setTxError(err?.shortMessage || err?.message || 'Failed to submit finding');
    }
  };

  const handleApprove = async (bountyId: bigint) => {
    if (!ensureMonadNetwork()) return;
    try {
      setTxError(undefined);
      setActionTitle(`Approve Finding & Release Escrow Payout for Bounty #BTY-${bountyId.toString()}`);
      setTxStep('WALLET_CONFIRMATION');

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: bountyEscrowAbi,
        functionName: 'approveFinding',
        args: [bountyId],
      });
    } catch (err: any) {
      setTxStep('ERROR');
      setTxError(err?.shortMessage || err?.message || 'Failed to approve finding');
    }
  };

  const handleReject = async (bountyId: bigint) => {
    if (!ensureMonadNetwork()) return;
    try {
      setTxError(undefined);
      setActionTitle(`Reject Finding for Bounty #BTY-${bountyId.toString()} (Reopens Bounty)`);
      setTxStep('WALLET_CONFIRMATION');

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: bountyEscrowAbi,
        functionName: 'rejectFinding',
        args: [bountyId],
      });
    } catch (err: any) {
      setTxStep('ERROR');
      setTxError(err?.shortMessage || err?.message || 'Failed to reject finding');
    }
  };

  const handleCancel = async (bountyId: bigint) => {
    if (!ensureMonadNetwork()) return;
    try {
      setTxError(undefined);
      setActionTitle(`Cancel Bounty #BTY-${bountyId.toString()} & Refund Escrow to Wallet`);
      setTxStep('WALLET_CONFIRMATION');

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: bountyEscrowAbi,
        functionName: 'cancelBounty',
        args: [bountyId],
      });
    } catch (err: any) {
      setTxStep('ERROR');
      setTxError(err?.shortMessage || err?.message || 'Failed to cancel bounty');
    }
  };

  // Filtered bounties list
  const filteredBounties = useMemo(() => {
    return bounties.filter((b) => {
      const matchQuery =
        !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.creator.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSev = severityFilter === 'ALL' || b.severity === severityFilter;
      const matchStat = statusFilter === 'ALL' || b.status === statusFilter;
      return matchQuery && matchSev && matchStat;
    });
  }, [bounties, searchQuery, severityFilter, statusFilter]);

  // Aggregate stats
  const totalLockedMon = useMemo(() => {
    let total = BigInt(0);
    bounties.forEach((b) => {
      if (b.status === BountyStatus.OPEN) {
        total += b.reward;
      }
    });
    return formatEther(total);
  }, [bounties]);

  const totalPaidMon = useMemo(() => {
    let total = BigInt(0);
    bounties.forEach((b) => {
      if (b.status === BountyStatus.PAID) {
        total += b.reward;
      }
    });
    return formatEther(total);
  }, [bounties]);

  const openBountiesCount = useMemo(() => {
    return bounties.filter((b) => b.status === BountyStatus.OPEN).length;
  }, [bounties]);

  if (!mounted) return null;

  return (
    <div className="cyber-grid min-h-screen flex flex-col">
      {/* Header */}
      <CyberHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCreateModal={() => setIsCreateOpen(true)}
        totalBountiesCount={bounties.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="relative chamfer-card bg-[#12121a]/80 border border-[#2a2a3a] p-6 md:p-8 backdrop-blur-md overflow-hidden glow-green">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#00ff88]/10 border border-[#00ff88]/30 px-3 py-1 rounded text-xs text-[#00ff88] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></span>
                LIVE PROTOCOL // MONAD TESTNET
              </div>

              <h2
                data-text="ZERO-TRUST VULNERABILITY ESCROW"
                className="glitch-text text-2xl md:text-4xl font-extrabold text-white tracking-wider font-[family-name:var(--font-orbitron)] leading-tight"
              >
                ZERO-TRUST VULNERABILITY ESCROW
              </h2>

              <p className="text-xs md:text-sm text-[#8a8f9d] font-mono leading-relaxed">
                Organizations lock MON rewards in smart contracts. Security researchers anchor cryptographic
                finding proofs on-chain. Approvals instantly release native funds with zero financial intermediaries.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-5 py-2.5 chamfer-btn bg-[#00ff88] hover:bg-[#00ff88]/90 text-black font-extrabold text-xs uppercase tracking-wider glow-green transition-all"
                >
                  ⚡ Create Bounty (Lock MON)
                </button>

                <button
                  onClick={() => setActiveTab('browse')}
                  className="px-5 py-2.5 chamfer-btn bg-[#161622] hover:bg-[#2a2a3a] text-white border border-[#2a2a3a] font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Explore Active Bounties ({openBountiesCount})
                </button>
              </div>
            </div>

            {/* Protocol Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:w-96 font-mono text-center">
              <div className="chamfer-card bg-[#0a0a0f] p-4 border border-[#00ff88]/30">
                <p className="text-[10px] text-[#8a8f9d] uppercase">Currently Escrowed</p>
                <p className="text-lg font-bold text-[#00ff88] text-glow-green">
                  {totalLockedMon} <span className="text-[10px] text-white">MON</span>
                </p>
              </div>

              <div className="chamfer-card bg-[#0a0a0f] p-4 border border-[#00d4ff]/30">
                <p className="text-[10px] text-[#8a8f9d] uppercase">Paid to Hackers</p>
                <p className="text-lg font-bold text-[#00d4ff] text-glow-cyan">
                  {totalPaidMon} <span className="text-[10px] text-white">MON</span>
                </p>
              </div>

              <div className="chamfer-card bg-[#0a0a0f] p-4 border border-[#ff00ff]/30 col-span-2 sm:col-span-1">
                <p className="text-[10px] text-[#8a8f9d] uppercase">Open Targets</p>
                <p className="text-lg font-bold text-[#ff00ff] text-glow-magenta">
                  {openBountiesCount} Active
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TAB 1: BROWSE BOUNTIES */}
        {activeTab === 'browse' && (
          <section className="space-y-6">
            {/* Filter Controls */}
            <div className="chamfer-card bg-[#12121a] border border-[#2a2a3a] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search targets by title or sponsor address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#00ff88] text-white px-3 py-2 rounded text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap text-xs">
                {/* Severity Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[#8a8f9d]">Severity:</span>
                  <select
                    value={severityFilter}
                    onChange={(e) =>
                      setSeverityFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                    }
                    className="bg-[#0a0a0f] border border-[#2a2a3a] text-white px-2 py-1.5 rounded outline-none"
                  >
                    <option value="ALL">All Severities</option>
                    <option value={4}>Critical</option>
                    <option value={3}>High</option>
                    <option value={2}>Medium</option>
                    <option value={1}>Low</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[#8a8f9d]">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                    }
                    className="bg-[#0a0a0f] border border-[#2a2a3a] text-white px-2 py-1.5 rounded outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value={BountyStatus.OPEN}>Open</option>
                    <option value={BountyStatus.PAID}>Paid</option>
                    <option value={BountyStatus.CANCELLED}>Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bounties Grid */}
            {isBountiesLoading ? (
              <div className="chamfer-card bg-[#12121a] border border-[#2a2a3a] p-12 text-center text-xs text-[#00ff88] animate-pulse">
                Fetching on-chain escrow state from Monad Testnet...
              </div>
            ) : filteredBounties.length === 0 ? (
              <div className="chamfer-card bg-[#12121a] border border-[#2a2a3a] p-12 text-center space-y-3">
                <span className="text-4xl">🔍</span>
                <h3 className="text-sm font-bold text-white font-[family-name:var(--font-orbitron)]">
                  NO BOUNTIES MATCH CURRENT FILTERS
                </h3>
                <p className="text-xs text-[#8a8f9d]">
                  {bounties.length === 0
                    ? 'No bounties registered yet on Monad. Be the first sponsor to initialize an escrow.'
                    : 'Try clearing your search query or severity filters.'}
                </p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-5 py-2 chamfer-btn bg-[#00ff88] text-black font-extrabold text-xs uppercase"
                >
                  Create New Bounty
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBounties.map((bounty) => (
                  <BountyCard
                    key={bounty.id.toString()}
                    bounty={bounty}
                    currentAddress={address}
                    onSubmitFinding={(b) => setSelectedBountyForSubmit(b)}
                    onManageBounty={() => {
                      setDashboardRole('company');
                      setActiveTab('dashboard');
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: CREATE BOUNTY DIRECT VIEW */}
        {activeTab === 'create' && (
          <section className="max-w-2xl mx-auto">
            <div className="chamfer-card bg-[#12121a] border border-[#ff00ff]/60 p-6 md:p-8 glow-magenta">
              <h2 className="text-xl font-bold text-white font-[family-name:var(--font-orbitron)] mb-2 flex items-center gap-2">
                <span>⚡</span> CREATE ESCROWED SECURITY BOUNTY
              </h2>
              <p className="text-xs text-[#8a8f9d] mb-6">
                Fill in vulnerability parameters and lock native MON into the smart contract.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const title = (form.elements.namedItem('directTitle') as HTMLInputElement).value;
                  const severity = Number((form.elements.namedItem('directSev') as HTMLSelectElement).value);
                  const reward = (form.elements.namedItem('directReward') as HTMLInputElement).value;
                  const scope = (form.elements.namedItem('directScope') as HTMLTextAreaElement).value;

                  const detailsHash = keccak256(toBytes(scope || title));
                  handleCreateBounty(title, severity, detailsHash, parseEther(reward));
                }}
                className="space-y-4 text-xs font-mono"
              >
                <div>
                  <label className="block text-[#8a8f9d] uppercase mb-1">Target Title *</label>
                  <input
                    name="directTitle"
                    type="text"
                    required
                    placeholder="e.g. AUTH BYPASS IN PAYMENT API"
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#ff00ff] text-white p-3 rounded outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8a8f9d] uppercase mb-1">Severity *</label>
                    <select
                      name="directSev"
                      defaultValue={4}
                      className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#ff00ff] text-white p-3 rounded outline-none"
                    >
                      <option value={4}>4 — CRITICAL</option>
                      <option value={3}>3 — HIGH</option>
                      <option value={2}>2 — MEDIUM</option>
                      <option value={1}>1 — LOW</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#8a8f9d] uppercase mb-1">Reward (MON) *</label>
                    <input
                      name="directReward"
                      type="number"
                      step="0.001"
                      min="0.001"
                      required
                      defaultValue="25.0"
                      className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#ff00ff] text-[#00ff88] font-bold p-3 rounded outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#8a8f9d] uppercase mb-1">Scope &amp; Terms (Keccak256 Hashed)</label>
                  <textarea
                    name="directScope"
                    rows={3}
                    placeholder="Define scope, targets, and rules..."
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#ff00ff] text-white p-3 rounded outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isWritePending || isWaitingForReceipt}
                    className="w-full py-3 chamfer-btn bg-[#00ff88] hover:bg-[#00ff88]/90 text-black font-extrabold text-xs uppercase tracking-wider glow-green"
                  >
                    {isWritePending || isWaitingForReceipt
                      ? 'Confirming Transaction...'
                      : 'Lock MON in Escrow & Publish Bounty'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* TAB 3: DASHBOARD (COMPANY & RESEARCHER) */}
        {activeTab === 'dashboard' && (
          <section className="space-y-6">
            {/* Role Switcher */}
            <div className="flex items-center gap-2 border-b border-[#2a2a3a] pb-3">
              <button
                onClick={() => setDashboardRole('company')}
                className={`px-4 py-2 chamfer-btn text-xs font-bold uppercase tracking-wider transition-all ${
                  dashboardRole === 'company'
                    ? 'bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff]/50 glow-magenta'
                    : 'text-[#8a8f9d] hover:text-white'
                }`}
              >
                🏢 Sponsor Dashboard
              </button>

              <button
                onClick={() => setDashboardRole('researcher')}
                className={`px-4 py-2 chamfer-btn text-xs font-bold uppercase tracking-wider transition-all ${
                  dashboardRole === 'researcher'
                    ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/50 glow-cyan'
                    : 'text-[#8a8f9d] hover:text-white'
                }`}
              >
                🔬 Researcher Submissions
              </button>
            </div>

            {dashboardRole === 'company' ? (
              <CompanyDashboard
                bounties={bounties}
                submissionsMap={submissionsMap}
                currentAddress={address}
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={handleCancel}
                isLoading={isWritePending || isWaitingForReceipt}
                onCreateClick={() => setIsCreateOpen(true)}
              />
            ) : (
              <ResearcherDashboard
                bounties={bounties}
                submissionsMap={submissionsMap}
                currentAddress={address}
                onExploreClick={() => setActiveTab('browse')}
              />
            )}
          </section>
        )}

        {/* TAB 4: SYSTEM TERMINAL */}
        {activeTab === 'terminal' && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white font-[family-name:var(--font-orbitron)] flex items-center gap-2">
                <span>💻</span> MONAD ESCROW SYSTEM TELEMETRY
              </h2>
              <p className="text-xs text-[#8a8f9d]">
                Live node consensus telemetry, state machine logs, and diagnostic terminal.
              </p>
            </div>

            <TerminalBox
              logs={systemLogs}
              totalValueLocked={totalLockedMon}
              totalBounties={bounties.length}
            />
          </section>
        )}
      </main>

      {/* Modals */}
      <CreateBountyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateBounty}
        isLoading={isWritePending || isWaitingForReceipt}
      />

      <SubmitFindingModal
        bounty={selectedBountyForSubmit}
        isOpen={!!selectedBountyForSubmit}
        onClose={() => setSelectedBountyForSubmit(null)}
        onSubmit={handleSubmitFinding}
        isLoading={isWritePending || isWaitingForReceipt}
      />

      {/* Real-Time Transaction Toast */}
      <TxStatusToast
        step={txStep}
        txHash={txHash}
        errorMsg={txError}
        actionTitle={actionTitle}
        onClose={() => {
          setTxStep('IDLE');
          resetWrite();
        }}
      />
    </div>
  );
}
