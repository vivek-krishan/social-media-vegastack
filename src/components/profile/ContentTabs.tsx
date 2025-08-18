'use client';
import React, { useState, cloneElement } from 'react';
import { LayoutGrid, Play, Bookmark, User } from 'lucide-react';
const ContentTabs = () => {
  const [activeTab, setActiveTab] = useState('grid');
  const tabs = [{
    id: 'grid',
    icon: <LayoutGrid size={20} />
  }, {
    id: 'videos',
    icon: <Play size={20} />
  }, {
    id: 'saved',
    icon: <Bookmark size={20} />
  }, {
    id: 'tagged',
    icon: <User size={20} />
  }];
  return <div className="w-full mt-8 border-t border-gray-800">
      <div className="flex justify-around">
        {tabs.map(tab => <button key={tab.id} className={`flex-1 p-3 ${activeTab === tab.id ? 'border-t border-white' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <div className="flex justify-center">
              {cloneElement(tab.icon, {
            className: activeTab === tab.id ? 'text-white' : 'text-gray-500'
          })}
            </div>
          </button>)}
      </div>
    </div>;
};
export default ContentTabs;