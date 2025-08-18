import React from "react";
interface ProfileHeaderProps {
  avatar: string;
  username: string;
}
const ProfileHeader = ({ avatar, username }: ProfileHeaderProps) => {
  return (
    <div className='w-full flex justify-center items-center'>
      <div className='relative'>
        <div className='w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center'>
          <img
            src={avatar}
            alt={username}
            className='w-[90%] h-[90%] rounded-full object-cover border-2 border-black'
          />
        </div>
        {/* <div className="absolute top-0 right-0 bg-gray-800 rounded-full p-1">
          <span className="text-xs">Note...</span>
        </div> */}
      </div>
      {/* <div className="flex-1 flex justify-end">
        <button className="p-2">
          <Settings size={20} />
        </button>
      </div> */}
    </div>
  );
};
export default ProfileHeader;
