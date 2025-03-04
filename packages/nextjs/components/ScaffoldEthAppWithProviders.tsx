"use client";

//import { useEffect, useState } from "react";
import Topbar from "./Topbar";
import { QueryClient, QueryClientProvider, isServer } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
//import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import Footer from "~~/components/Footer";
//import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import {PrivyProvider} from '@privy-io/react-auth';
import scaffoldConfig from "~~/scaffold.config";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { BlockieAvatar } from "./scaffold-eth";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  //useInitializeNativeCurrencyPrice();

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

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}
let browserQueryClient: QueryClient | undefined = undefined;
function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  // const { resolvedTheme } = useTheme();
  // const isDarkMode = resolvedTheme === "dark";
  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ProgressBar height="3px" color="#2299dd" />
        <RainbowKitProvider
          avatar={BlockieAvatar}>
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
              },
            }}
        >
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
        </PrivyProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
