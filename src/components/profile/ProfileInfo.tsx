import React from "react";
interface ProfileInfoProps {
  displayName: string;
  pronouns: string;
  email: string;
}
const ProfileInfo = ({ displayName, pronouns, email }: ProfileInfoProps) => {
  return (
    <div className='w-fit'>
      <h2 className='text-lg font-bold'>
        <span className='text-4xl'>{displayName}</span>{" "}
        <span className='font-normal text-sm text-gray-400'>{pronouns}</span>
      </h2>
      <h5 className="text-sm text-gray-400">{email}</h5>
    </div>
  );
};
export default ProfileInfo;
