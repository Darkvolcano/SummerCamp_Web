import React, { useState } from 'react';
import { Empty, Button } from 'antd';
import { Calendar as CalendarIcon } from 'lucide-react';

const TransportScheduleTab: React.FC = () => {
  return (
    <div className="py-6">
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Empty
          image={
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                <CalendarIcon size={48} className="text-blue-400" />
              </div>
            </div>
          }
          description={
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Transport Schedule Coming Soon
              </h3>
              <p className="text-gray-600 mb-4 max-w-md">
                This feature is currently under development. You'll be able to schedule
                transportation for campers including pickup and drop-off times.
              </p>
            </div>
          }
        >
          <Button type="primary" disabled>
            Create Schedule
          </Button>
        </Empty>
      </div>
    </div>
  );
};

export default TransportScheduleTab;
