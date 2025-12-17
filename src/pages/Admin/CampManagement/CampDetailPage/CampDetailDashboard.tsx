import React from 'react';

interface CampDetailDashboardProps {
  campId: number;
  campStatus?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CampDetailDashboard: React.FC<CampDetailDashboardProps> = ({ campId: _campId, campStatus }) => {
  if (campStatus === 'DRAFT' || campStatus === 'Draft') {
    return (
      <div className="pb-12">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Trại chưa được thiết lập</h3>
            <p className="text-blue-700 mb-4">Trại của bạn vẫn đang ở trạng thái 'Draft'. Vui lòng hoàn thành thiết lập trại để tiếp tục.</p>
            <p className="text-sm text-blue-600">Vui lòng chỉ định một quản lý và chờ họ thiết lập trại để tiếp tục.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
        <h2 className="text-2xl font-bold text-[#111827] mb-4">Bảng điều khiển</h2>
        <p className="text-[#6B7280]">Phân tích bảng điều khiển sẽ sớm được cập nhật...</p>
      </div>
    </div>
  );
};

export default CampDetailDashboard;
