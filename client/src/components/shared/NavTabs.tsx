import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Layers,
  Activity,
  PlusCircle 
} from 'lucide-react';

interface NavTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavTabs: React.FC<NavTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5 mr-2" /> },
    { id: 'players', label: 'Players', icon: <Users className="h-5 w-5 mr-2 text-emerald-500" /> },
    { id: 'partnerships', label: 'Partnerships', icon: <Layers className="h-5 w-5 mr-2 text-emerald-500" /> },
    { id: 'matches', label: 'Matches', icon: <Activity className="h-5 w-5 mr-2 text-emerald-500" /> },
    { id: 'newMatch', label: 'New Match', icon: <PlusCircle className="h-5 w-5 mr-2 text-emerald-500" /> },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-2 mb-8 flex overflow-x-auto hide-scrollbar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`min-w-max px-5 py-3 ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          } rounded-lg mr-2 flex items-center cursor-pointer transition-all`}
          onClick={() => onTabChange(tab.id)}
        >
          {activeTab === tab.id 
            ? React.cloneElement(tab.icon, { className: 'h-5 w-5 mr-2' })
            : tab.icon
          }
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default NavTabs;
