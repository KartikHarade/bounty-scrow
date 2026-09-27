'use client';

import { useAccount, useConnect, useDisconnect, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { greeterAbi } from '../lib/abi';
import { monadTestnet } from '../lib/config';

export default function Home() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, error, isError } = useConnect();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [newGreeting, setNewGreeting] = useState('');
  
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { data: balanceData } = useBalance({
    address: address,
  });

  const { data: currentGreeting, refetch: refetchGreeting } = useReadContract({
    address: contractAddress,
    abi: greeterAbi,
    functionName: 'greet',
    query: { enabled: !!contractAddress && isConnected }
  });

  const { data: hash, writeContract, isPending, error: txError, isError: isTxError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      refetchGreeting();
      setNewGreeting('');
    }
  }, [isConfirmed, refetchGreeting]);

  const handleUpdateGreeting = () => {
    if (!newGreeting) return;
    if (chainId !== monadTestnet.id && switchChain) {
      switchChain({ chainId: monadTestnet.id });
      return;
    }
    writeContract({
      address: contractAddress,
      abi: greeterAbi,
      functionName: 'setGreeting',
      args: [newGreeting],
      chainId: monadTestnet.id,
    });
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Welcome to Web3SkillBuildz
        </h1>

        <div className="flex flex-col items-center gap-4 bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 w-full max-w-md">
          {!isConnected ? (
            <div className="flex flex-col gap-2 w-full">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg hover:shadow-blue-500/25 w-full"
                >
                  Connect {connector.name}
                </button>
              ))}
              {isError && (
                <div className="text-red-400 text-xs text-center mt-2 bg-red-400/10 p-2 rounded border border-red-400/20">
                  {error?.message}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-400/10 px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Connection successful
              </div>
              
              <div className="w-full bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 break-all">
                <p className="text-gray-400 text-xs mb-1">Wallet Address</p>
                <p className="font-mono text-sm">{address}</p>
              </div>

              <div className="w-full bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                <p className="text-gray-400 text-xs mb-1">Current Greeting from Contract</p>
                <p className="font-mono text-xl font-bold text-blue-400">
                  {currentGreeting as string || 'Loading...'}
                </p>
              </div>

              <div className="w-full bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 flex flex-col gap-3">
                <p className="text-gray-400 text-xs">Update Greeting (Triggers Transaction)</p>
                <input 
                  type="text" 
                  value={newGreeting}
                  onChange={(e) => setNewGreeting(e.target.value)}
                  placeholder="Enter a new greeting"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                />
                <button
                  onClick={handleUpdateGreeting}
                  disabled={isPending || isConfirming || !newGreeting}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-all shadow-lg"
                >
                  {chainId !== monadTestnet.id ? 'Switch to Testnet First' : isPending ? 'Confirm in Wallet...' : isConfirming ? 'Waiting for block...' : 'Submit Transaction'}
                </button>
                {isTxError && (
                  <div className="text-red-400 text-xs mt-2 bg-red-400/10 p-2 rounded border border-red-400/20 break-words">
                    {txError?.message}
                  </div>
                )}
                {hash && (
                  <a 
                    href={`https://testnet.monadexplorer.com/tx/${hash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:underline mt-1 text-center"
                  >
                    View Transaction on Explorer
                  </a>
                )}
              </div>

              <button
                onClick={() => disconnect()}
                className="mt-2 px-6 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold transition-all border border-red-500/20 w-full"
              >
                Disconnect
              </button>
            </div>
          )}

          {/* Show Contract Button outside the connected logic so anyone can see it */}
          <div className="w-full mt-4 flex flex-col items-center gap-4 border-t border-gray-700/50 pt-6">
            <button
              onClick={() => setShowContract(!showContract)}
              className="px-6 py-2 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-semibold transition-all border border-emerald-500/30"
            >
              {showContract ? 'Hide Contract' : 'Show Contract'}
            </button>
            
            {showContract && (
              <div className="w-full bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 break-all text-center">
                <p className="text-gray-400 text-xs mb-1">Deployed Contract Address</p>
                <p className="font-mono text-sm text-emerald-300">
                  {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'Not set in .env'}
                </p>
                <a 
                  href={`https://testnet.monadexplorer.com/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline mt-2 inline-block"
                >
                  View on Explorer
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
