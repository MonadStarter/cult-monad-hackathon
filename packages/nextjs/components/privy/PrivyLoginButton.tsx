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
        <Link href="/profile">
        <span className="text-xs">
          {user?.wallet?.address
            ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
            : "No wallet connected"}
        </span>
        </Link>
      </div>
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
