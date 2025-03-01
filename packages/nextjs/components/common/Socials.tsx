import Link from "next/link";
import { DiscordIcon, GlobeIcon, TelegramIcon, XIcon } from "~~/icons/socials";

type SocialsProps = {
  discord?: string;
  telegram?: string;
  x?: string;
  website?: string;
  className?: string;
};
function Socials({ discord, telegram, x, website, className }: SocialsProps) {
  return (
    <div className={`${className} flex gap-5 `}>
      {website && (
        <Link href={website} className="gray-badge">
          <GlobeIcon />
        </Link>
      )}
      {discord && (
        <Link href={discord} className="gray-badge">
          <DiscordIcon />
        </Link>
      )}
      {telegram && (
        <Link href={telegram} className="gray-badge">
          <TelegramIcon />
        </Link>
      )}
      {x && (
        <Link href={x} className="gray-badge">
          <XIcon />
        </Link>
      )}
    </div>
  );
}

export default Socials;
