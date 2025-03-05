import Image from "next/image";
import Navbar from "../common/Navbar";
import Socials from "../common/Socials";
import { routerItemsList } from "~~/constants/routes";
import PrivyLoginButton from "../privy/PrivyLoginButton";

export default function Topbar() {
  return (
    <nav className="navbar h-16 flex justify-between items-center px-4 sm:px-10">
      <div className="flex gap-10 items-center">
        <Image src="/logo.svg" width={149} height="100" alt="Mopo.fun" />
        <Navbar navItems={routerItemsList} className="max-sm:hidden" />
      </div>
      <div className="flex gap-5 items-center">
        <Socials discord="#" telegram="#" x="#" className="max-sm:hidden" />
     <PrivyLoginButton />
      </div>
    </nav>
  );
}
