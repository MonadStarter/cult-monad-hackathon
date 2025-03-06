import React from "react";
import { Address } from "../scaffold-eth/Address/Address";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { RoundedStar } from "~~/icons/actions";
import { GlobeIcon, TelegramIcon, XIcon } from "~~/icons/socials";
import { PriceIncreaseIcon } from "~~/icons/symbols";
import { formatLargeNumber } from "~~/lib/utils";
import { useTokenStore } from "~~/stores/tokenStore";

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Customize the relative time thresholds for more accurate display
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "1 minute",
    mm: "%d minutes",
    h: "1 hour",
    hh: "%d hours",
    d: "1 day",
    dd: "%d days",
    M: "1 month",
    MM: "%d months",
    y: "1 year",
    yy: "%d years",
  },
});

// Fixed ETH price in USD for market cap calculation
const ETH_PRICE_USD = 3000;

export const CoinDetailCard = () => {
  const { tokenAddress, subgraphData, metadata, isLoading, error } = useTokenStore();

  const formatCreationTime = (timestamp: number) => {
    if (!timestamp || timestamp < 0) return "Invalid date";

    const now = dayjs();
    const creationDate = dayjs.unix(timestamp); // Using unix() helper

    if (!creationDate.isValid()) return "Invalid date";

    if (now.diff(creationDate, "days") < 30) {
      return creationDate.fromNow();
    }
    return creationDate.format("MMM D, YYYY");
  };

  if (isLoading || !metadata) {
    return (
      <div className="content-wrapper-card w-full h-64 animate-pulse bg-gray-100">
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <p className="text-gray-400">Loading...</p>
          <p className="text-gray-600">Token Address: {tokenAddress}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-wrapper-card w-full h-64">
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <p className="text-error-500">Error loading data: {(error as Error).message}</p>
          <p className="text-gray-600">Token Address: {tokenAddress}</p>
        </div>
      </div>
    );
  }

  // If there's no cultToken in the response
  if (!subgraphData?.cultToken) {
    return (
      <div className="content-wrapper-card w-full h-64">
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <p className="text-gray-400">No token data found in subgraph</p>
          <p className="text-gray-600">Token Address: {tokenAddress}</p>
        </div>
      </div>
    );
  }

  const tokenInfo = subgraphData.cultToken;

  const coinStats = [
    //{ label: "Price", value: `$${formatLargeNumber(Number(metadata.price) * ETH_PRICE_USD)}` },
    { label: "Price", value: `$${Number(metadata.price) * ETH_PRICE_USD}` },
    { label: "Market Cap", value: `$${formatLargeNumber(Number(metadata.marketCap || "0").toFixed(2))}` },
    { label: "Circ Supply", value: `${formatLargeNumber(metadata.circulatingSupply || "0")}` },
    // { label: "ETH Reserve", value: `${formatLargeNumber(tokenData.ethReserve)} ETH` },
    // { label: "Token Reserve", value: formatLargeNumber(tokenData.tokenReserve) },
    { label: "Holder Count", value: tokenInfo.holderCount ?? 0 },
  ];

  return (
    <div className="content-wrapper-card flex items-start my-4 relative items-stretch">
      <div className="relative">
        <img
          src={metadata.image || "https://picsum.photos/200"}
          alt={metadata.name}
          className="coin-image w-96 h-72 object-cover"
        />
        <div className="pill-badge absolute left-2 bottom-2 bg-primary-700">#1</div>
      </div>

      <div className="flex flex-col py-4 px-5 justify-between w-full">
        <div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 mb-1">
              <h3>{tokenInfo.name || "Loading..."}</h3>
              <h6 className="text-gray-200">{tokenInfo.symbol || "..."}</h6>
              {tokenInfo.bondingCurve ? (
                <div className="badge bg-warning-900 text-xs px-2 py-1 rounded-full">Bonding Curve</div>
              ) : (
                <div
                  className={`badge flex items-center gap-1 font-bold text-xs rounded-full px-2 ${Number(0) > 0 ? "bg-success-900" : "bg-error-900"}`}
                >
                  <PriceIncreaseIcon />
                  {formatLargeNumber(0)}
                </div>
              )}
              <RoundedStar className="cursor-pointer" />
            </div>
            <div className="flex items-center gap-2">
              <h6 className="font-medium text-gray-500">Created {formatCreationTime(tokenInfo.blockTimestamp)}</h6>
              <h6 className="text-gray-600">•</h6>
              <h6 className="text-gray-600 underline cursor-pointer">Report</h6>
            </div>
          </div>
          <p className="font-medium text-base text-white-76">{metadata.description}</p>
        </div>

        <div>
          <div className="flex justify-between py-3 coin-specs-container">
            {coinStats.map(({ label, value }, idx) => (
              <div key={idx}>
                <h6 className="font-medium text-gray-600">{label}</h6>
                <h5>{value}</h5>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-between items-center">
            <div className="flex gap-4">
              <div className="flex gap-1 items-center">
                <h6 className="font-medium text-gray-600">Contract:</h6>
                <Address address={tokenAddress} format="short" size="xs" onlyEnsOrAddress={true} />
                {/* <h6 className="font-bold text-primary-400">{ellipsisToken(tokenAddress)}</h6>
                <button className="cursor-pointer" onClick={() => handleCopyAddress(tokenAddress)}>
                  <CopyIcon />
                </button> */}
              </div>
              <h6 className="font-medium text-gray-600">•</h6>
              <div className="flex gap-1 items-center">
                <h6 className="font-medium text-gray-600">Designed by:</h6>
                <Address address={tokenInfo.tokenCreator.id} format="short" size="xs" onlyEnsOrAddress={true} />
                {/* <h6 className="font-bold text-primary-400">
                  {tokenInfo.tokenCreator.id ? ellipsisToken(tokenInfo.tokenCreator.id) : "Loading..."}
                </h6>
                <button className="cursor-pointer" onClick={() => handleCopyAddress(tokenInfo.tokenCreator.id)}>
                  <CopyIcon />
                </button> */}
              </div>
            </div>

            <div className="flex gap-3">
              {metadata.socials?.website && (
                <a
                  href={metadata.socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gray-badge hover:bg-gray-700 transition-colors"
                >
                  <GlobeIcon />
                </a>
              )}
              {metadata.socials?.telegram && (
                <a
                  href={metadata.socials.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gray-badge hover:bg-gray-700 transition-colors"
                >
                  <TelegramIcon />
                </a>
              )}
              {metadata.socials?.twitter && (
                <a
                  href={metadata.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gray-badge hover:bg-gray-700 transition-colors"
                >
                  <XIcon />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinDetailCard;
