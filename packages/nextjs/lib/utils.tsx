import { ReactElement } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ellipsisToken = (token: string) => {
  if (token.length > 10) {
    return `${token.slice(0, 4)}...${token.slice(-3)}`;
  }
  return token;
};

function ellipsisTransaction(value: string): string {
  if (value.length <= 10) {
    return value;
  }
  const start = value.slice(0, 4);
  const end = value.slice(-4); // Increase to 4 for better visibility

  return `${start}...${end}`;
}
function EllipsisTransaction({ value }: { value: string }) {
  const shortValue = ellipsisTransaction(value);

  return (
    <a href={`https://testnet.monadexplorer.com/${value}`} target="_blank" rel="noreferrer">
      {shortValue}
    </a>
  );
}

function formatLargeNumber(num: number | BigInt | string, decimalsForSmall: number = 2): string {
  const suffixes = [
    { value: 1_000_000_000n, symbol: "B" }, // Billion
    { value: 1_000_000n, symbol: "M" }, // Million
    { value: 1_000n, symbol: "K" }, // Thousand
  ];

  // Convert string input to Number or BigInt
  if (typeof num === "string") {
    if (num.includes(".")) {
      num = parseFloat(num); // Convert decimal strings to number
    } else {
      num = BigInt(num); // Convert whole number strings to BigInt
    }
  }

  // Handle number case (supports decimals)
  if (typeof num === "number") {
    // Handle numbers less than 1
    if (num < 1 && num > 0) {
      return num.toFixed(decimalsForSmall);
    }

    if (num < 1_000) return num.toString();

    for (const { value, symbol } of suffixes) {
      if (num >= Number(value)) {
        return (num / Number(value)).toFixed(1).replace(/\.0$/, "") + symbol;
      }
    }
    return num.toString();
  }

  // Handle BigInt case (no decimals allowed)
  if (typeof num === "bigint") {
    if (num < 1000n) return num.toString();
    for (const { value, symbol } of suffixes) {
      if (num >= value) {
        const result = num / value;
        return result.toString() + symbol; // No decimals for BigInt
      }
    }
    return num.toString();
  }

  return "Invalid input";
}

export { ellipsisToken, ellipsisTransaction, formatLargeNumber, EllipsisTransaction };
