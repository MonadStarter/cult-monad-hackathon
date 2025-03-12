"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";

export const PrivyLoginButton = () => {
  const { login, authenticated, logout, user } = usePrivy();

  if (!authenticated) {
    return (
      <button
        className="bg-[#7c5cff] hover:bg-[#6c4cef] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        onClick={login}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-[#1c1a29] rounded-xl p-2 shadow-md">
      {/* Connection status and address */}
      <div className="flex flex-col">
        <span className="font-bold text-white">Connected</span>
        <Link href="/profile">
          <span className="text-sm text-gray-400 hover:text-white transition-colors">
            {user?.wallet?.address
              ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
              : "No wallet connected"}
          </span>
        </Link>
      </div>
      
      {/* Disconnect button */}
      <button
        className="bg-[#272536] hover:bg-[#32304a] text-white py-2 px-4 ml-2 rounded-lg transition-colors"
        onClick={logout}
      >
        Disconnect
      </button>
    </div>
  );
};

export default PrivyLoginButton;
