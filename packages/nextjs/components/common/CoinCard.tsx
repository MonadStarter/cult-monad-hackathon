import Image from "next/image";
import Link from "next/link";
import ProgressBar from "./ProgressBar";
import Socials from "./Socials";
import { rankingColors } from "~~/constants/content";
import { dayjs } from "~~/dayjs";
import { ellipsisToken, formatLargeNumber } from "~~/lib/utils";
import { MemeCoin } from "~~/types/types";

function CoinCard({ coin, rank }: { coin: MemeCoin; rank: number }) {
  return (
    <div className="content-wrapper-card w-100  hover:ease-in transition-all hover:brightness-125">
      <div className="relative">
        <Image
          src={coin.img}
          width={316}
          height={233}
          alt={coin.token}
          style={{ height: "233px", width: "316px", objectFit: "cover" }}
        />
        {rank <= 3 && <div className={`pill-badge absolute right-2 bottom-2 ${rankingColors[rank - 1]}`}>#0{rank}</div>}
      </div>
      <div className="flex flex-col gap-4 p-4">
        <Link href={`/coin/${coin.name}`}>
          <h5>{coin.name}</h5>
          <p className="text-gray-500 text-xs">${coin.token}</p>
        </Link>
        <p className="text-sm line-clamp-3">{coin.description}</p>
        <div className="flex justify-between">
          <p className="text-gray-500 text-xs">Desgined by:</p>
          <p className="text-primary-400 underline underline-offset-1 text-xs">{ellipsisToken(coin.creator)}</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <p className="text-gray-500 text-xs">Net Worth:</p>
            <p className="text-xs">${formatLargeNumber(coin.netWorth)} • 37.89%</p>
          </div>
          <ProgressBar current={15} />
        </div>
        <div className="flex justify-between items-center">
          <Socials website="#" discord="#" x="#" className="!gap-2" />
          <p className="text-gray-500 text-xs">{dayjs().subtract(3, "days")?.fromNow()}</p>
        </div>
      </div>
    </div>
  );
}

export default CoinCard;
