"use client";

import Checkbox from "~~/components/common/Checkbox";
import InputField from "~~/components/common/InputField";
import Select from "~~/components/common/Select";
import { SearchIcon } from "~~/icons/actions";

const SELECT_FILTER_OPTIONS = [
  {
    label: "Best Performing",
    value: "performance",
  },
  {
    label: "Most Popular",
    value: "popularity",
  },
];

function DiscoverFilters() {
  const handleListedOnDexFilter = () => {
    // do something like update query to for coins
  };

  const handleSeacrh = () => {
    // do something like update query to for coins
  };

  return (
    <div className="flex gap-4 items-center sm:justify-center">
      <InputField
        icon={<SearchIcon />}
        placeholder="Search coins..."
        containerClassName="!w-52"
        inputClassName="font-bold text-md"
        onChange={handleSeacrh}
      />
      <Select options={SELECT_FILTER_OPTIONS} className="border-gray-800 border" />
      <Checkbox
        label="Listed on Dex"
        className="border-gray-800 border px-3 py-2 min-w-52 rounded-xl bg-white-7"
        onChange={handleListedOnDexFilter}
      />
    </div>
  );
}

export default DiscoverFilters;
