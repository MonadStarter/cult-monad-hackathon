"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";

export const PrivyLoginButton = () => {
  const { login, authenticated, logout, user } = usePrivy();

  if (!authenticated) {
    return (
      <button
        className="btn btn-primary btn-sm"
        onClick={login}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold">{user?.email?.address || "Connected"}</span>
        <span className="text-xs">
          {user?.wallet?.address
            ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
            : "No wallet connected"}
        </span>
      </div>
      <Link href="/profile">
        <button className="btn btn-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-black border-none hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </button>
      </Link>
      <button
        className="btn btn-sm btn-ghost"
        onClick={logout}
      >
        Disconnect
      </button>
    </div>
  );
};

export default PrivyLoginButton;
