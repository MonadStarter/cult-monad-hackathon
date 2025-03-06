import Image from "next/image";
import Navbar from "../common/Navbar";
import Socials from "../common/Socials";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { routerItemsList } from "~~/constants/routes";

export default function Topbar() {
  return (
    <nav className="navbar h-16 flex justify-between items-center px-4 sm:px-10">
      <div className="flex gap-10 items-center">
        <Image src="/cultLogo.jpg" width={30} height={30} alt="Cult Trade" />
        <Navbar navItems={routerItemsList} className="max-sm:hidden" />
      </div>
      <div className="flex gap-5 items-center">
        <Socials discord="#" telegram="#" x="#" className="max-sm:hidden" />
        <RainbowKitCustomConnectButton />
      </div>
    </nav>
  );
}
