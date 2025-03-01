"use client";

import { useState } from "react";
import CreateTokenForm from "./CreateTokenForm";
import LandingScreen from "./LandingScreen";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RightChevronArrow } from "~~/icons/actions";

// Import the Button component

export default function LaunchToken() {
  const [isLaunched, setIsLaunched] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary-500 text-white-500">
          Launch Token <RightChevronArrow />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-4 bg-white border border-gray-300 rounded">
        <CreateTokenForm />
        {/* <LandingScreen handleNext={() => setIsLaunched(true)} /> */}
      </DialogContent>
    </Dialog>
  );
}
