import React, { useEffect, useState, useCallback } from 'react';
import { Spin } from 'antd';
import { Search } from 'lucide-react';
import { useNotification } from '../../../../contexts/NotificationContext';
import accommodationService, { type AccommodationResponseDto } from '../../../../services/accommodationService';
import accommodationTypeService, { type AccommodationTypeResponseDto } from '../../../../services/accommodationTypeService';
import campService, { type CampResponseDto } from '../../../../services/campService';

interface CampDetailAccommodationProps {
  campId: number;
  campStatus?: string;
}

const CampDetailAccommodation: React.FC<CampDetailAccommodationProps> = ({
  campId,
  campStatus,
}) => {
  const { toastError } = useNotification();
  const [accommodations, setAccommodations] = useState<AccommodationResponseDto[]>([]);
  const [accommodationTypes, setAccommodationTypes] = useState<AccommodationTypeResponseDto[]>([]);
  const [campData, setCampData] = useState<CampResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<number | 'All'>('All');

  const fetchAccommodations = useCallback(async () => {
    try {
      setLoading(true);
      const [accommodationsData, typesData, campInfo] = await Promise.all([
        accommodationService.getAccommodationsByCampId(campId),
        accommodationTypeService.getAllAccommodationTypes(),
        campService.getCampById(campId),
      ]);
      setAccommodations(accommodationsData);
      setAccommodationTypes(typesData);
      setCampData(campInfo);
    } catch (error) {
      console.error('Lỗi khi tải chỗ ở:', error);
      toastError('Lỗi', 'Không thể tải chỗ ở cho trại này.');
    } finally {
      setLoading(false);
    }
  }, [campId, toastError]);

  useEffect(() => {
    if (campId && campStatus !== 'DRAFT' && campStatus !== 'Draft') {
      fetchAccommodations();
    }
  }, [campId, campStatus, fetchAccommodations]);

  // Get accommodation type name by ID
  const getAccommodationTypeName = (typeId: number) => {
    const type = accommodationTypes.find((t) => t.id === typeId);
    return type?.name || 'N/A';
  };

  // Calculate total capacity of accommodations
  const getTotalCapacity = () => {
    return accommodations.reduce((sum, acc) => sum + acc.capacity, 0);
  };

  // Filter accommodations
  const filteredAccommodations = accommodations.filter((accommodation) => {
    const matchesSearch = !searchQuery || accommodation.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || accommodation.accommodationTypeId === typeFilter;
    return matchesSearch && matchesType;
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
                    placeholder="Theo tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>

              {/* Capacity Info */}
              {campData && (
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <p className="text-xs font-medium text-[#6B7280] mb-1">Sức chứa</p>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-[#111827]">{getTotalCapacity()}</span>
                    <span className="text-xs text-[#6B7280]">/ {campData.maxParticipants} sức chứa tối đa</span>
                  </div>
                </div>
              )}

              {/* Type Filter Checkboxes */}
              <div className="px-6 py-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={typeFilter === 'All'}
                      onChange={() => setTypeFilter('All')}
                      className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white cursor-pointer"
                    />
                    <span className="text-sm font-medium text-[#111827]">Tất cả loại</span>
                  </label>
                  {accommodationTypes.map((type) => (
                    <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={typeFilter === type.id}
                        onChange={() => setTypeFilter(type.id)}
                        className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white cursor-pointer"
                      />
                      <span className="text-sm text-[#6B7280]">{type.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Section - Table */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#F9FAFB] to-white">
                <h3 className="text-lg font-bold text-[#111827]">
                  Chỗ ở
                </h3>
                <p className="text-xs text-[#6B7280] mt-1">
                  Tổng số chỗ ở: {filteredAccommodations.length}
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
                        Tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Loại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Sức chứa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Người giám sát
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredAccommodations.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-[#6B7280]"
                        >
                          Không tìm thấy chỗ ở phù hợp với bộ lọc của bạn
                        </td>
                      </tr>
                    ) : (
                      filteredAccommodations.map((accommodation, index) => (
                        <tr
                          key={accommodation.accommodationId}
                          className="hover:bg-[#F9FAFB] transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                            {accommodation.name}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              {getAccommodationTypeName(accommodation.accommodationTypeId)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {accommodation.capacity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#6B7280]">
                            {accommodation.supervisor?.fullName ? (
                              accommodation.supervisor.fullName
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                Chưa được phân công
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${accommodation.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {accommodation.isActive ? 'Hoạt động' : 'Không hoạt động'}
                            </span>
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

export default CampDetailAccommodation;
