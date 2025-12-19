import React from 'react';
import { Tabs } from 'antd';
import { useManagerContext } from '../../../hooks/useManagerContext';
import RouteTab from './RouteTab';
import VehicleTab from './VehicleTab';
import TransportScheduleTab from './TransportScheduleTab';

const TransportationManagement: React.FC = () => {
  const { selectedCampId } = useManagerContext();

  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Chọn Trại</h3>
          <p className="text-indigo-700 text-base leading-relaxed">
            Vui lòng chọn một trại từ thanh bên trái để quản lý đưa đón
          </p>
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'routes',
      label: 'Tuyến đường',
      children: <RouteTab />,
    },
    {
      key: 'vehicles',
      label: 'Phương tiện',
      children: <VehicleTab />,
    },
    {
      key: 'schedules',
      label: 'Lịch trình đưa đón',
      children: <TransportScheduleTab />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Quản Lý Đưa Đón</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Quản lý tuyến đường, phương tiện và lịch trình đưa đón cho trại
        </p>
      </div>

      <Tabs items={tabItems} defaultActiveKey="routes" />
    </div>
  );
};

export default TransportationManagement;
