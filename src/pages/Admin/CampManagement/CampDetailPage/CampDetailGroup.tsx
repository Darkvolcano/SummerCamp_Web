import React, { useEffect, useState, useCallback } from 'react';
import { Spin } from 'antd';
import { Search } from 'lucide-react';
import groupService, { type GroupResponseDto } from '../../../../services/groupService';
import campService, { type CampResponseDto } from '../../../../services/campService';
import { useNotification } from '../../../../contexts/NotificationContext';

interface CampDetailGroupProps {
  campId: number;
  campStatus?: string;
}

const CampDetailGroup: React.FC<CampDetailGroupProps> = ({ campId, campStatus }) => {
  const { toastError } = useNotification();
  const [groups, setGroups] = useState<GroupResponseDto[]>([]);
  const [campData, setCampData] = useState<CampResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const [groupsData, campInfo] = await Promise.all([
        groupService.getGroupsByCampId(campId),
        campService.getCampById(campId),
      ]);
      setGroups(groupsData);
      setCampData(campInfo);
    } catch (error) {
      console.error('Lỗi khi tải nhóm:', error);
      toastError('Lỗi', 'Không thể tải nhóm cho trại này. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [campId, toastError]);

  useEffect(() => {
    if (campId && campStatus !== 'DRAFT' && campStatus !== 'Draft') {
      fetchGroups();
    }
  }, [campId, campStatus, fetchGroups]);

  // Calculate total max size of groups
  const getTotalMaxSize = () => {
    return groups.reduce((sum, group) => sum + group.maxSize, 0);
  };

  // Filter groups
  const filteredGroups = groups.filter((group) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!group.groupName.toLowerCase().includes(query) &&
        !(group.description?.toLowerCase().includes(query))) {
        return false;
      }
    }
    return true;
  });

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
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Sidebar - Search */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden sticky top-6">
              {/* Section Header */}
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#F9FAFB] to-white">
                <h3 className="text-lg font-bold text-[#111827]">
                  Tìm kiếm
                </h3>
              </div>

              {/* Search Input */}
              <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="By name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>

              {/* Capacity Info */}
              {campData && (
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-[#6B7280] mb-1">Sức chứa</p>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-[#111827]">{getTotalMaxSize()}</span>
                    <span className="text-xs text-[#6B7280]">/ {campData.maxParticipants} sức chứa tối đa</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Main Section - Table */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#F9FAFB] to-white">
                <h3 className="text-lg font-bold text-[#111827]">
                  Nhóm
                </h3>
                <p className="text-xs text-[#6B7280] mt-1">
                  Tổng số nhóm: {filteredGroups.length}
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Tên nhóm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Sức chứa / Tuổi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Người giám sát
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredGroups.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-[#6B7280]"
                        >
                          Không tìm thấy nhóm nào phù hợp với bộ lọc của bạn
                        </td>
                      </tr>
                    ) : (
                      filteredGroups.map((group, index) => (
                        <tr
                          key={group.groupId}
                          className="hover:bg-[#F9FAFB] transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                            {group.groupName}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#374151] max-w-xs truncate">
                            {group.description}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#6B7280]">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              Tối đa {group.maxSize}
                            </span>
                            <span className="ml-2 text-xs text-[#6B7280]">
                              ({group.minAge} - {group.maxAge} yrs)
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#6B7280]">
                            {group.supervisorName ? (
                              group.supervisorName
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                Chưa được phân công
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampDetailGroup;
