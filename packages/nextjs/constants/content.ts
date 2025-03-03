import { TokenMetadata } from "~~/types/types";

const rankingColors = ["bg-primary-700", "bg-secondary-700", "bg-blue-700"];

const dummyMetadata: Omit<TokenMetadata, "marketCap"> = {
  name: "Placeholder Name", // Or a dynamic placeholder if needed
  description: "Placeholder Description",
  image: "https://picsum.photos/200", // Your dummy image URL
  tokenAddress: "0x00",
  symbol: "PLACEHOLDER",
  socials: {
    website: "https://example.com", // Dummy website
    telegram: "https://t.me/example", // Dummy Telegram
    twitter: "https://twitter.com/example", // Dummy Twitter
    discord: "https://discord.gg/example", // Dummy Discord
  },
};

export { rankingColors, dummyMetadata };
