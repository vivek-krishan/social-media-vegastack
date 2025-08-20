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

export default RightSidebar;
