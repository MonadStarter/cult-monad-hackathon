import BlockedSocialIcon from "../common/BlockedSocialIcon";
import InputField from "../common/InputField";
import { FileInputVariant } from "../common/InputField/FileInput";
import Modal from "../common/Modal";
import { EditIcon } from "~~/icons/actions";
import { DiscordIcon, GlobeIcon, TelegramIcon, XIcon } from "~~/icons/socials";

function EditProfile() {
  return (
    <Modal
      buttonText="Edit Profile"
      containerClassName="p-4"
      title="Edit Profile"
      buttonIcon={<EditIcon />}
      buttonClassName="border border-gray-600 rounded-xl px-3 py-2 justify-center w-1/2"
    >
      <form className="flex flex-col gap-4 mt-4">
        <FileInputVariant name="ProfilePic" />
        <InputField name="username" placeholder="username" label="Update Username" inputClassName="text-sm" />
        <div className="flex flex-col gap-1">
          <p className="text-sm">Bio</p>
          <div className="input-field-container !h-full">
            <textarea name="description" rows={4} className="input-field resize-none text-sm" placeholder="Add bio" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm">Social Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            <InputField placeholder="X (twitter)" endIcon={<BlockedSocialIcon icon={<XIcon />} />} />
            <InputField placeholder="Telegram" endIcon={<BlockedSocialIcon icon={<TelegramIcon />} />} />
            <InputField placeholder="Discord" endIcon={<BlockedSocialIcon icon={<DiscordIcon />} />} />
            <InputField placeholder="Website" endIcon={<BlockedSocialIcon icon={<GlobeIcon />} />} />
          </div>
        </div>
        <button className="bg-primary-500 text-white-500 w-full justify-center" type="submit">
          Save Changes
        </button>
      </form>
    </Modal>
  );
}

export default EditProfile;
