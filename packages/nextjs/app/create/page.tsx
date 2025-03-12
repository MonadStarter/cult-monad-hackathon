"use client";

import CreateTokenForm from "~~/components/home/LaunchToken/CreateTokenForm";

// Import the Button component

export default function Create() {
  return (
    <div className="flex flex-col space-y-12 items-center justify-center">
      <h1 className="mt-8">Launch Cult</h1>
      <CreateTokenForm />
    </div>
  );
}