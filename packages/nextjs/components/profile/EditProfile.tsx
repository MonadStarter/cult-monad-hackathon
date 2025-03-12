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
      containerClassName="p-6 bg-[#1c1a29] backdrop-blur-sm border border-gray-800 rounded-xl shadow-xl"
      title="Edit Profile"
      buttonIcon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.4745 5.40801L18.5917 7.52524M17.8358 3.54289L11.6849 9.69387C11.2332 10.1454 10.9372 10.7362 10.84 11.3757L10.5143 13.4856L12.6243 13.1599C13.2638 13.0626 13.8545 12.7667 14.3061 12.315L20.457 6.16404C20.8477 5.77331 21.0679 5.24126 21.0679 4.68571C21.0679 4.13016 20.8477 3.59811 20.457 3.20738C20.0662 2.81665 19.5342 2.59644 18.9786 2.59644C18.4231 2.59644 17.891 2.81665 17.5003 3.20738L17.8358 3.54289Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19.5 15V19.5C19.5 20.0304 19.2893 20.5391 18.9142 20.9142C18.5391 21.2893 18.0304 21.5 17.5 21.5H4.5C3.96957 21.5 3.46086 21.2893 3.08579 20.9142C2.71071 20.5391 2.5 20.0304 2.5 19.5V6.5C2.5 5.96957 2.71071 5.46086 3.08579 5.08579C3.46086 4.71071 3.96957 4.5 4.5 4.5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      }
      buttonClassName="bg-[#7c5cff] text-white font-semibold py-3 px-5 rounded-xl flex items-center gap-2"
    >
      <form className="flex flex-col gap-5 mt-4">
        <FileInputVariant name="ProfilePic" />
        <InputField placeholder="username" label="Update Username" inputClassName="text-sm bg-[#272536] border-gray-700" />
        
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400 font-medium">Social Links</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 bg-[#272536] p-2 rounded-lg">
              <XIcon />
              <InputField placeholder="x username" inputClassName="text-sm bg-transparent border-0 focus:ring-0" />
            </div>
            <div className="flex items-center gap-2 bg-[#272536] p-2 rounded-lg">
              <TelegramIcon />
              <InputField placeholder="telegram username" inputClassName="text-sm bg-transparent border-0 focus:ring-0" />
            </div>
            <div className="flex items-center gap-2 bg-[#272536] p-2 rounded-lg">
              <DiscordIcon />
              <InputField placeholder="discord username" inputClassName="text-sm bg-transparent border-0 focus:ring-0" />
            </div>
            <div className="flex items-center gap-2 bg-[#272536] p-2 rounded-lg">
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16L16 12L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <InputField placeholder="your website" inputClassName="text-sm bg-transparent border-0 focus:ring-0" />
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="mt-2 bg-[#7c5cff] text-white font-semibold py-3 px-4 rounded-xl"
        >
          Save Changes
        </button>
      </form>
    </Modal>
  );
}

export default EditProfile;
