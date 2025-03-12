"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import SegmentedPanel, { SegmentedPanelOptionType } from "~~/components/common/SegmentedPanel";
import TokenCreatedTable from "~~/components/profile/TokensCreatedTable/TokensCreatedTable";
import TokensOwnedTable from "~~/components/profile/TokensOwnedTable/TokensOwnedTable";
import { fetchTokensCreated } from "~~/graphql/graphQlClient2";
import { Balance, TokenCreated, TokensCreatedResponse } from "~~/types/types";

export default function TableSection({
  tokensOwned,
  tokensCreated,
}: {
  tokensOwned: Balance[] | [];
  tokensCreated: TokenCreated[] | [];
}) {
  //const { address: accountAddress } = useAccount();

  // const {
  //   data: profileData,
  //   isLoading: queryLoading,
  //   error: queryError,
  //   refetch,
  // } = useQuery<TokensCreatedResponse>({
  //   queryKey: ["userProfileData", accountAddress],
  //   queryFn: () => fetchTokensCreated(accountAddress!),
  //   enabled: !!accountAddress,
  // });

  // if (queryError) {
  //   console.log("queryError", queryError);
  // }

  // if (queryLoading) {
  //   console.log("queryLoading", queryLoading);
  // }

  // console.log("PROFILE DATA", profileData);

  // let tokensOwned = profileData?.accountData?.balances;
  // if (!tokensOwned || tokensOwned.length === 0) {
  //   tokensOwned = [];
  // }

  // let tokensCreated = profileData?.accountData?.created;
  // if (!tokensCreated || tokensCreated.length === 0) {
  //   tokensCreated = [];
  // }

  const USER_TOKEN_OPTIONS: SegmentedPanelOptionType[] = [
    {
      id: "tokensOwned",
      label: "Token Owned",
      content: <TokensOwnedTable tokensOwned={tokensOwned} />,
    },
    {
      id: "tokensCreated",
      label: "Tokens Created",
      content: <TokenCreatedTable tokensCreated={tokensCreated} />,
    },
    // {
    //   id: "favoriteTokens",
    //   label: "Favorite Tokens",
    //   content: <FavouriteTokensTable />,
    // },
  ];

  return (
    <div className="w-full lg:w-2/3">
      <SegmentedPanel 
        panels={USER_TOKEN_OPTIONS} 
        className="bg-[#1c1a29] shadow-lg rounded-2xl border-0" 
        segmentedClassName="bg-[#272536]"
      />
    </div>
  );
}
