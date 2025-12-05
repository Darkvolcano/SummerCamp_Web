import React from 'react';

interface CampDetailScheduleProps {
  campId: number;
  campStatus?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CampDetailSchedule: React.FC<CampDetailScheduleProps> = ({ campId: _campId, campStatus }) => {
  if (campStatus === 'DRAFT' || campStatus === 'Draft') {
    return (
      <div className="pb-12">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Camp Not Set Up Yet</h3>
            <p className="text-blue-700 mb-4">Your camp is still in Draft status. Please complete camp setup to continue.</p>
            <p className="text-sm text-blue-600">Please assign a manager and wait for them to set up the camp to continue.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
        <h2 className="text-2xl font-bold text-[#111827] mb-4">Schedule</h2>
        <p className="text-[#6B7280]">Schedule management coming soon...</p>
      </div>
    </div>
  );
};

export default CampDetailSchedule;
