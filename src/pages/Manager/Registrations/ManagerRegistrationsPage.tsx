import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { Search, Eye, CheckCircle2 } from 'lucide-react';
import { useManagerContext } from '../../../hooks/useManagerContext';
import { useNotification } from '../../../contexts/NotificationContext';
import registrationService, { type RegistrationResponseDto } from '../../../services/registrationService';
import { RegistrationStatus } from '../../../enums/registration-status.enum';

const ManagerRegistrationsPage: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastSuccess, toastError } = useNotification();
  const [registrations, setRegistrations] = useState<RegistrationResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Status counts
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!selectedCampId) {
      setRegistrations([]);
      return;
    }

    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const data = await registrationService.getRegistrationsByCampId(selectedCampId);
        setRegistrations(data);
        calculateStatusCounts(data);
      } catch (error) {
        console.error('[ManagerRegistrationsPage] Failed to load registrations:', error);
        toastError('Error', 'Unable to load registrations');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [selectedCampId]);

  const calculateStatusCounts = (data: RegistrationResponseDto[]) => {
    const counts: Record<string, number> = {};
    data.forEach((reg) => {
      counts[reg.status] = (counts[reg.status] || 0) + 1;
    });
    setStatusCounts(counts);
  };

  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Select Camp</h3>
          <p className="text-indigo-700 text-base leading-relaxed">Please select a camp from the left sidebar to view registrations</p>
        </div>
      </div>
    );
  }

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    // Search filter (by camper names, registration ID)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const camperNames = reg.campers?.map(c => c.camperName).join(' ').toLowerCase() || '';
      const regId = reg.registrationId.toString();
      if (!camperNames.includes(query) && !regId.includes(query)) {
        return false;
      }
    }

    // Status filter
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(reg.status)) {
      return false;
    }

    return true;
  });

  // Pending approvals
  const pendingApprovals = registrations.filter(
    (reg) => reg.status === RegistrationStatus.PENDING_APPROVAL
  );

  // Handle status checkbox
  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleAllStatusToggle = () => {
    setSelectedStatuses([]);
  };

  const isAllSelected = selectedStatuses.length === 0;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case RegistrationStatus.PENDING_APPROVAL:
        return 'bg-amber-100 text-amber-700';
      case RegistrationStatus.APPROVED:
        return 'bg-green-100 text-green-700';
      case RegistrationStatus.REJECTED:
        return 'bg-red-100 text-red-700';
      case RegistrationStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-700';
      case RegistrationStatus.ON_GOING:
        return 'bg-indigo-100 text-indigo-700';
      case RegistrationStatus.COMPLETED:
        return 'bg-gray-100 text-gray-700';
      case RegistrationStatus.CANCELED:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleApprove = async (registrationId: number) => {
    try {
      await registrationService.approveRegistration(registrationId);
      toastSuccess('Success', 'Registration approved successfully');
      // Refresh registrations
      if (selectedCampId) {
        const data = await registrationService.getRegistrationsByCampId(selectedCampId);
        setRegistrations(data);
        calculateStatusCounts(data);
      }
    } catch (error) {
      console.error('Failed to approve registration:', error);
      toastError('Error', 'Failed to approve registration');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Registrations</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Manage and review camp registrations
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 text-center">
          <p className="text-[#6B7280] text-lg">No registrations found for this camp</p>
        </div>
      ) : (
        <>
          {/* Pending Approvals Section */}
          {pendingApprovals.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden mb-6">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-bold text-[#111827]">
                  Pending Approvals ({pendingApprovals.length})
                </h2>
              </div>

              {/* Scrollable Table */}
              <div className="overflow-y-auto max-h-50">
                <table className="w-full border-collapse">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Registration ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Campers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {pendingApprovals.map((reg) => (
                      <tr
                        key={reg.registrationId}
                        className="hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                          #{reg.registrationId}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#3B82F6] w-fit">
                              {reg.campers?.length || 0} camper(s)
                            </span>
                            <span className="text-xs text-[#6B7280]">
                              {reg.campers?.map(c => c.camperName).join(', ') || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                          {reg.finalPrice ? `${reg.finalPrice.toLocaleString('vi-VN')} đ` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
                              title="View Details"
                            >
                              <Eye size={16} />
                              Detail
                            </button>
                            <button
                              onClick={() => handleApprove(reg.registrationId)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                              title="Approve Registration"
                            >
                              <CheckCircle2 size={16} />
                              Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Filters and Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sticky top-6">
                <h3 className="text-lg font-bold text-[#111827] mb-4">Filters</h3>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wider">
                    Search
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="By name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-3 uppercase tracking-wider">
                    Status
                  </label>
                  <div className="space-y-2">
                    {/* All checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleAllStatusToggle}
                        className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
                      />
                      <span className="text-sm text-[#374151] group-hover:text-[#111827] font-medium">
                        All
                      </span>
                      <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full ml-auto">
                        {registrations.length}
                      </span>
                    </label>

                    {/* Individual status checkboxes */}
                    {[
                      RegistrationStatus.PENDING_APPROVAL,
                      RegistrationStatus.APPROVED,
                      RegistrationStatus.REJECTED,
                      RegistrationStatus.CONFIRMED,
                      RegistrationStatus.COMPLETED,
                      RegistrationStatus.CANCELED,
                    ].map((status) => (
                      <label
                        key={status}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={() => handleStatusToggle(status)}
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
                        />
                        <span className="text-sm text-[#374151] group-hover:text-[#111827]">
                          {status.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full ml-auto">
                          {statusCounts[status] || 0}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[#6B7280]">Total: </span>
                      <span className="text-lg font-bold text-[#111827]">
                        {registrations.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#6B7280]">Pending: </span>
                      <span className="text-lg font-bold text-amber-600">
                        {statusCounts[RegistrationStatus.PENDING_APPROVAL] || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#6B7280]">Approved: </span>
                      <span className="text-lg font-bold text-green-600">
                        {statusCounts[RegistrationStatus.APPROVED] || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Main Section - Table */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-bold text-[#111827]">
                    Found: {filteredRegistrations.length}
                  </h2>
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
                          Campers
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Registration Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Promotion
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Note
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredRegistrations.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-12 text-center text-[#6B7280]"
                          >
                            No registrations found matching your filters
                          </td>
                        </tr>
                      ) : (
                        filteredRegistrations.map((reg) => (
                          <tr
                            key={reg.registrationId}
                            className="hover:bg-[#F9FAFB] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                              #{reg.registrationId}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#3B82F6]">
                                {reg.campers?.length || 0} camper(s)
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#374151]">
                              {formatDate(reg.registrationCreateAt)}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                              {reg.finalPrice ? `${reg.finalPrice.toLocaleString('vi-VN')} đ` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              {reg.appliedPromotion
                                ? `${reg.appliedPromotion.name} (${reg.appliedPromotion.percent}%)`
                                : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280] max-w-xs truncate">
                              {reg.note || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  reg.status
                                )}`}
                              >
                                {reg.status.replace(/([A-Z])/g, ' $1').trim()}
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
        </>
      )}
    </div>
  );
};

export default ManagerRegistrationsPage;
