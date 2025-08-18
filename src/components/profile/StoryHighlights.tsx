import React from 'react';
import { Plus } from 'lucide-react';
interface Highlight {
  id: number;
  name: string;
  image: string;
  isAdd?: boolean;
}
interface StoryHighlightsProps {
  highlights: Highlight[];
}
const StoryHighlights = ({
  highlights
}: StoryHighlightsProps) => {
  return <div className="w-full mt-6 flex justify-between">
      {highlights.map(highlight => <div key={highlight.id} className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border border-gray-700 flex items-center justify-center mb-1">
            {highlight.isAdd ? <Plus size={24} className="text-gray-400" /> : <img src={highlight.image} alt={highlight.name} className="w-[94%] h-[94%] rounded-full object-cover" />}
          </div>
          <span className="text-xs">{highlight.name}</span>
        </div>)}
    </div>;
};
export default StoryHighlights;