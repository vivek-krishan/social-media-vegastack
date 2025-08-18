import React from "react";
import { ChevronDown } from "lucide-react";
const RightSidebar = () => {
  return (
    <div className='w-72 h-full bg-[#1A1B21] border-l border-gray-800 overflow-y-auto'>
      <div className='p-4'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='font-medium'>Notifications</h3>
          <button>
            <ChevronDown size={18} />
          </button>
        </div>
        <div className='space-y-3'>
          <TrendingItem
            title='Figure performance'
            posts='89 posts today'
            time='1 hour'
            percentage={98}
          />
          <TrendingItem
            title='Blender Update'
            posts='67 posts today'
            time='1 hour'
            percentage={43}
          />
          <TrendingItem
            title='SketchFlow render server'
            posts='54 posts today'
            time='3 hours'
            percentage={42}
          />
          <TrendingItem
            title='Javascript new'
            posts='39 posts today'
            time='3 hours'
            percentage={28}
          />
        </div>
      </div>
    </div>
  );
};
interface TrendingItemProps {
  title: string;
  posts: string;
  time: string;
  percentage: number;
}
const TrendingItem = ({
  title,
  posts,
  time,
  percentage,
}: TrendingItemProps) => {
  return (
    <div className='flex items-center'>
      <div className='flex-1'>
        <h4 className='text-sm font-medium'>{title}</h4>
        <p className='text-xs text-gray-400'>{posts}</p>
      </div>
      <div className='text-right'>
        <div className='text-xs text-gray-400'>
          {percentage}% in {time}
        </div>
      </div>
    </div>
  );
};

interface SocialIconProps {
  icon: string;
  color: string;
}
const SocialIcon = ({ icon, color }: SocialIconProps) => {
  return (
    <div
      className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}
    >
      <span className='text-white'>{icon.charAt(0).toUpperCase()}</span>
    </div>
  );
};

interface FriendItemProps {
  name: string;
  status: string;
  image: string;
  online?: boolean;
}
const FriendItem = ({ name, status, image, online }: FriendItemProps) => {
  return (
    <div className='flex items-center'>
      <div className='relative mr-3'>
        <img src={image} alt={name} className='w-8 h-8 rounded-full' />
        {online && (
          <span className='absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#1A1B21]'></span>
        )}
      </div>
      <div className='flex-1'>
        <p className='text-sm'>{name}</p>
        <p className='text-xs text-gray-400'>{status}</p>
      </div>
      <div className='text-xs text-gray-500'>{online ? "12" : ""}</div>
    </div>
  );
};
export default RightSidebar;
