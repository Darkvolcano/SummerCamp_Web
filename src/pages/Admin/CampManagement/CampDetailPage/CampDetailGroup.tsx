import React from 'react';

interface CampDetailGroupProps {
  campId: number;
}

const CampDetailGroup: React.FC<CampDetailGroupProps> = ({ campId }) => {
  return (
    <div className="pb-12">
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
        <h2 className="text-2xl font-bold text-[#111827] mb-4">Group</h2>
        <p className="text-[#6B7280]">Group management coming soon...</p>
      </div>
    </div>
  );
};

export default CampDetailGroup;
