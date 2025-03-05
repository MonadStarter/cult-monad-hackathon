"use client";

import Topbar from "./Topbar";
import { QueryClient, QueryClientProvider, isServer } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from '@privy-io/wagmi';
import Footer from "~~/components/Footer";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { PrivyProvider } from '@privy-io/react-auth';
import scaffoldConfig from "~~/scaffold.config";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className={`flex flex-col min-h-screen `}>
        <Topbar />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient();


export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {

  return (
    <PrivyProvider
      appId={scaffoldConfig.privy.appId}
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url',
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: true,
          showWalletUIs: true,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <ProgressBar height="3px" color="#2299dd" />
            <ScaffoldEthApp>{children}</ScaffoldEthApp>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};
