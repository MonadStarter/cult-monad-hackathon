import BackButton from "~~/components/coin/BackButton/BackButton";
import SegmentedPanel, { SegmentedPanelOptionType } from "~~/components/common/SegmentedPanel";
import EditProfile from "~~/components/profile/EditProfile";
import FavouriteTokensTable from "~~/components/profile/FavouriteTokensTable/FavouriteTokensTable";
import TokenCreatedTable from "~~/components/profile/TokensCreatedTable/TokensCreatedTable";
import TokensOwnedTable from "~~/components/profile/TokensOwnedTable/TokensOwnedTable";
import { CopyIcon } from "~~/icons/actions";
import { Panda } from "~~/icons/symbols";

const USER_TOKEN_OPTIONS: SegmentedPanelOptionType[] = [
  {
    id: "tokensOwned",
    label: "Token Owned",
    content: <TokensOwnedTable />,
  },
  {
    id: "tokensCreated",
    label: "Tokens Created",
    content: <TokenCreatedTable />,
  },
  {
    id: "favoriteTokens",
    label: "Favorite Tokens",
    content: <FavouriteTokensTable />,
  },
];

export default function Profile() {
  return (
    <div className="page pt-5">
      <BackButton />
      <div className="flex gap-4 mt-5 items-start">
        <div className="content-wrapper-card w-2/6 p-5">
          <div className="flex flex-col gap-y-5">
            <div className="flex justify-between items-start">
              <div className="rounded-full border border-white-12 overflow-hidden">
                <Panda />
              </div>
              <h6 className="text-xs py-1 px-2 bg-white-7 rounded-xl">Unverified</h6>
            </div>
            <div className="flex flex-col gap-y-1 items-start">
              <h3>User48394</h3>
              <div className="flex gap-1 items-center">
                <h6 className="font-bold text-primary-400">GFEI87SDF687F8WF9WEFJFHE8RY7GER7</h6>
                <CopyIcon />
              </div>
              <h6 className="text-xs py-1 px-2 bg-white-7 rounded-xl">Verified</h6>
            </div>
            <div className="flex gap-3 justify-stretch">
              <EditProfile />
              <button className="border border-gray-600 rounded-xl px-3 py-2 w-1/2 justify-center">Disconnect</button>
            </div>
          </div>
        </div>
        <div className="w-4/6">
          {/* <NoAccountAdded /> */}
          <SegmentedPanel panels={USER_TOKEN_OPTIONS} className="bg-white-7" />
        </div>
      </div>
    </div>
  );
}
