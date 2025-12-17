import React from 'react';
import { CircleArrowLeft } from 'lucide-react';

interface CampDetailNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack: () => void;
}

const CampDetailNavbar: React.FC<CampDetailNavbarProps> = ({
  activeTab,
  onTabChange,
  onBack,
}) => {
  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'staff', label: 'Staff' },
    { id: 'schedule', label: 'Lịch trình' },
    { id: 'transportation', label: 'Vận chuyển' },
    { id: 'group', label: 'Nhóm' },
    { id: 'accommodation', label: 'Chỗ ở' },
    { id: 'dashboard', label: 'Bảng điều khiển' },
  ];

  return (
    <div className="flex items-center gap-2 mb-6">
      <div
        onClick={onBack}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        title="Quay lại danh sách trại"
      >
        <CircleArrowLeft
          size={38}
          className="text-[#6366F1]"
        />
      </div>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
              ? 'bg-[#6366F1] text-white'
              : 'bg-[#e5e6e9] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default CampDetailNavbar;
