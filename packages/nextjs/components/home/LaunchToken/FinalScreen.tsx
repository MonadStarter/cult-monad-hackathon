"use client";

import InputField from "~~/components/common/InputField";

function FinalLaunchScreen({ launchToken, tokenName }: { launchToken: () => void; tokenName?: string }) {
  const inputSuffix = (
    <div className="d-flex">
      <p className="uppercase">{tokenName}</p>
      <div className="uploaded-token-image" />
    </div>
  );

  return (
    <div className="w-[456] flex flex-col gap-4 py-2">
      <p className="text-gray-500">
        It’s optional but buying a small amount of coins helps protect your coin from snipers
      </p>
      <InputField endIcon={inputSuffix} placeholder="0.00" />
      <button className="bg-primary-500 justify-center w-full" onClick={launchToken}>
        Launch Token
      </button>
    </div>
  );
}

export default FinalLaunchScreen;
