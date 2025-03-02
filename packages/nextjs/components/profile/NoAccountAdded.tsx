import { PlusCircleIcon } from "@/icons/actions";
import { SupportIcon } from "@/icons/symbols";

const NoAccountAdded = () => {
  return (
    <div className="flex flex-col py-48 px-5 gap-y-8 items-center content-wrapper-card">
      <div className="bg-primary-500 p-3 rounded-full">
        <SupportIcon />
      </div>
      <h4>
        Please add your at least one social account to get your profile verified
      </h4>
      <button className="button bg-primary-500">
        <PlusCircleIcon />
        <h6>Add accounts</h6>
      </button>
    </div>
  );
};

export default NoAccountAdded;
