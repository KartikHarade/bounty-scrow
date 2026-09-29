'use client';

import React, { useState, useEffect } from 'react';
import { CONTRACT_ADDRESS, getExplorerAddressUrl } from '@/lib/config';

interface TerminalBoxProps {
  logs?: string[];
  totalValueLocked?: string;
  totalBounties?: number;
}

export const TerminalBox: React.FC<TerminalBoxProps> = ({
  logs = [],
  totalValueLocked = '0.00',
  totalBounties = 0,
}) => {
  const [internalLogs, setInternalLogs] = useState<string[]>([
    'INIT_SYSTEM: Initializing Secure Bounty Escrow kernel v1.0.4...',
    'NODE_CONNECTION: Monad Testnet RPC connected [Chain ID: 10143]',
    `ESCROW_TARGET: ${CONTRACT_ADDRESS || 'Awaiting deployment binding'}`,
    'INTEGRITY: Cryptographic SHA256/Keccak256 proof engine ready.',
    'STATUS: Escrow consensus nominal. Ready to process vulnerability claims.',
  ]);

  const [inputCmd, setInputCmd] = useState('');

  useEffect(() => {
    if (logs.length > 0) {
      setInternalLogs((prev) => [...prev, ...logs]);
    }
  }, [logs]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;

    const cmd = inputCmd.trim().toLowerCase();
    const timestamp = new Date().toLocaleTimeString();

    let reply = `Command not recognized: ${cmd}. Type 'help' for available commands.`;
    if (cmd === 'help') {
      reply = 'AVAILABLE COMMANDS: status, contract, network, tvl, clear, help';
    } else if (cmd === 'status') {
      reply = 'ESCROW STATUS: Active | Consensus: Monad BFT | State: Zero-Trust Validated';
    } else if (cmd === 'contract') {
      reply = `SMART CONTRACT: ${CONTRACT_ADDRESS || 'Unset'}`;
    } else if (cmd === 'network') {
      reply = 'CHAIN: Monad Testnet (10143) | Currency: MON | Block Time: ~1.0s';
    } else if (cmd === 'tvl') {
      reply = `TOTAL VALUE LOCKED: ${totalValueLocked} MON across ${totalBounties} bounties`;
    } else if (cmd === 'clear') {
      setInternalLogs([]);
      setInputCmd('');
      return;
    }

    setInternalLogs((prev) => [
      ...prev,
      `[${timestamp}] usr@monad:~$ ${inputCmd}`,
      `--> ${reply}`,
    ]);
    setInputCmd('');
  };

  return (
    <div className="chamfer-card bg-[#0a0a0f] border border-[#00ff88]/40 p-4 font-mono text-xs text-[#00ff88] glow-green relative overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-[#00ff88]/30 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff3366]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffb800]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88]"></span>
          <span className="text-[#8a8f9d] text-[11px] ml-2">
            root@monad-escrow-daemon: ~/live-telemetry
          </span>
        </div>
        <div className="text-[10px] text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded">
          AUDIT ENGINE ACTIVE
        </div>
      </div>

      {/* Metric Cards Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-[#e0e0e0]">
        <div className="bg-[#12121a] p-2.5 rounded border border-[#2a2a3a]">
          <p className="text-[10px] text-[#8a8f9d] uppercase">Total Value Escrowed</p>
          <p className="text-sm font-bold text-[#00ff88]">{totalValueLocked} MON</p>
        </div>
        <div className="bg-[#12121a] p-2.5 rounded border border-[#2a2a3a]">
          <p className="text-[10px] text-[#8a8f9d] uppercase">Total Security Bounties</p>
          <p className="text-sm font-bold text-[#00d4ff]">{totalBounties} Registered</p>
        </div>
        <div className="bg-[#12121a] p-2.5 rounded border border-[#2a2a3a]">
          <p className="text-[10px] text-[#8a8f9d] uppercase">Monad Consensus</p>
          <p className="text-sm font-bold text-[#ff00ff]">Chain 10143 (1s Blocks)</p>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="space-y-1 max-h-64 overflow-y-auto pr-2 mb-3 text-[11px] leading-relaxed">
        {internalLogs.map((log, idx) => (
          <div key={idx} className="break-all">
            <span className="text-[#8a8f9d] select-none">&gt;&gt; </span>
            <span
              className={
                log.includes('PAID') || log.includes('APPROVED')
                  ? 'text-[#00ff88] font-bold'
                  : log.includes('REJECTED') || log.includes('CANCELLED')
                  ? 'text-[#ff3366]'
                  : log.includes('-->')
                  ? 'text-[#00d4ff]'
                  : 'text-[#00ff88]/90'
              }
            >
              {log}
            </span>
          </div>
        ))}
      </div>

      {/* Command Line Input */}
      <form onSubmit={handleCommand} className="flex items-center gap-2 border-t border-[#00ff88]/20 pt-2">
        <span className="text-[#ff00ff] font-bold">monad@escrow:~$</span>
        <input
          type="text"
          value={inputCmd}
          onChange={(e) => setInputCmd(e.target.value)}
          placeholder="type 'status', 'tvl', 'contract', 'network', 'help'..."
          className="flex-1 bg-transparent border-none outline-none text-[#e0e0e0] font-mono text-xs placeholder:text-[#8a8f9d]/50"
        />
        <span className="blinking-cursor"></span>
      </form>
    </div>
  );
};
