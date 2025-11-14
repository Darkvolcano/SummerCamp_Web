import React, { useEffect, useState } from 'react';
import { Spin, Popover } from 'antd';
import { Search, UserRoundPlus } from 'lucide-react';
import { useManagerContext } from '../../../hooks/useManagerContext';
import { useNotification } from '../../../contexts/NotificationContext';
import DeletePopover from '../../../components/DeletePopover';
import campStaffService, {
  type StaffInfo,
  type CampStaffAssignmentResponse,
} from '../../../services/campStaffService';

const CampStaffManagement: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastSuccess, toastError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignPopoverOpen, setAssignPopoverOpen] = useState(false);

  // Available staff
  const [availableStaff, setAvailableStaff] = useState<StaffInfo[]>([]);
  const [filteredAvailableStaff, setFilteredAvailableStaff] = useState<
    StaffInfo[]
  >([]);
  const [searchAvailableQuery, setSearchAvailableQuery] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<number>>(
    new Set()
  );

  // Assigned staff
  const [assignedStaff, setAssignedStaff] = useState<
    CampStaffAssignmentResponse[]
  >([]);
  const [filteredAssignedStaff, setFilteredAssignedStaff] = useState<
    CampStaffAssignmentResponse[]
  >([]);
  const [searchAssignedQuery, setSearchAssignedQuery] = useState('');
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedCampId) {
      setAvailableStaff([]);
      setAssignedStaff([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [availableData, assignedData] = await Promise.all([
          campStaffService.getAvailableStaffForManager(selectedCampId),
          campStaffService.getStaffByCampForManager(selectedCampId),
        ]);
        setAvailableStaff(availableData);
        setAssignedStaff(assignedData);
        setFilteredAvailableStaff(availableData);
        setFilteredAssignedStaff(assignedData);
      } catch (error) {
        console.error('Failed to load staff data:', error);
        toastError('Error', 'Unable to load staff data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCampId, toastError]);

  // Filter available staff
  useEffect(() => {
    const filtered = availableStaff.filter((staff) =>
      staff.fullName.toLowerCase().includes(searchAvailableQuery.toLowerCase())
    );
    setFilteredAvailableStaff(filtered);
  }, [searchAvailableQuery, availableStaff]);

  // Filter assigned staff
  useEffect(() => {
    const filtered = assignedStaff.filter((assignment) =>
      assignment.staff.fullName
        .toLowerCase()
        .includes(searchAssignedQuery.toLowerCase())
    );
    setFilteredAssignedStaff(filtered);
  }, [searchAssignedQuery, assignedStaff]);

  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Select Camp</h3>
          <p className="text-indigo-700 text-base leading-relaxed">
            Please select a camp from the left sidebar to manage staff
          </p>
        </div>
      </div>
    );
  }

  // Handle checkbox toggle
  const toggleStaffSelection = (staffId: number) => {
    const newSelected = new Set(selectedStaffIds);
    if (newSelected.has(staffId)) {
      newSelected.delete(staffId);
    } else {
      newSelected.add(staffId);
    }
    setSelectedStaffIds(newSelected);
  };

  // Handle bulk assign
  const handleBulkAssign = async () => {
    if (selectedStaffIds.size === 0) {
      toastError('Error', 'Please select at least one staff member');
      return;
    }

    try {
      setAssigning(true);
      let successCount = 0;
      let failCount = 0;
      const failedStaffNames: string[] = [];

      for (const staffId of selectedStaffIds) {
        const staff = availableStaff.find((s) => s.userId === staffId);
        try {
          await campStaffService.assignStaffToCamp({ staffId, campId: selectedCampId });
          successCount++;
        } catch {
          failCount++;
          if (staff) {
            failedStaffNames.push(staff.fullName);
          }
        }
      }

      setSelectedStaffIds(new Set());

      if (selectedCampId) {
        const [availableData, assignedData] = await Promise.all([
          campStaffService.getAvailableStaffForManager(selectedCampId),
          campStaffService.getStaffByCampForManager(selectedCampId),
        ]);
        setAvailableStaff(availableData);
        setAssignedStaff(assignedData);
      }

      if (failCount === 0) {
        toastSuccess(
          'Success',
          `Successfully assigned ${successCount} staff member${
            successCount > 1 ? 's' : ''
          }`
        );
      } else {
        toastSuccess(
          'Partial Success',
          `Successfully assigned ${successCount} staff member${
            successCount > 1 ? 's' : ''
          }, failed: ${failedStaffNames.join(', ')}`
        );
      }
    } catch (error) {
      console.error('Failed to assign staff:', error);
      toastError('Error', 'Failed to assign staff');
    } finally {
      setAssigning(false);
    }
  };

  // Handle remove staff
  const handleRemoveStaff = async (assignmentId: number) => {
    try {
      setAssigning(true);
      await campStaffService.removeStaffFromCamp(assignmentId);
      toastSuccess('Success', 'Staff assignment removed successfully');
      setDeletePopoverOpen(null);

      if (selectedCampId) {
        const [availableData, assignedData] = await Promise.all([
          campStaffService.getAvailableStaffForManager(selectedCampId),
          campStaffService.getStaffByCampForManager(selectedCampId),
        ]);
        setAvailableStaff(availableData);
        setAssignedStaff(assignedData);
      }
    } catch (error: any) {
      console.error('Failed to remove staff:', error);
      let errorMsg = 'Failed to remove staff';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Staff Management</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Assign and manage camp staff members
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Filters and Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Available Staff */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden sticky top-6">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h3 className="text-lg font-bold text-[#111827]">Available Staff</h3>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search staff..."
                      value={searchAvailableQuery}
                      onChange={(e) => setSearchAvailableQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Summary Stats and Assign Button */}
                <div className="px-6 py-3 border-b border-[#E5E7EB]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-[#6B7280]">
                        Found: {filteredAvailableStaff.length}
                    </span>
                    <Popover
                      content={
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Assign {selectedStaffIds.size} staff member
                            {selectedStaffIds.size > 1 ? 's' : ''}?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                handleBulkAssign();
                                setAssignPopoverOpen(false);
                              }}
                              className="flex-1 px-3 py-1 bg-[#6366F1] text-white text-sm font-medium rounded-lg hover:bg-[#4F46E5]"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setAssignPopoverOpen(false)}
                              className="flex-1 px-3 py-1 bg-[#F3F4F6] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-[#E5E7EB]"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      }
                      trigger="click"
                      open={assignPopoverOpen}
                      onOpenChange={setAssignPopoverOpen}
                    >
                      <button
                        disabled={assigning || selectedStaffIds.size === 0}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        <UserRoundPlus size={16} />
                        Assign ({selectedStaffIds.size})
                      </button>
                    </Popover>
                  </div>
                </div>

                {/* Staff Checkboxes */}
                <div
                  className="divide-y divide-[#E5E7EB] max-h-[200px] overflow-y-auto"
                  style={{
                    scrollbarColor: '#ffffff #f0f0f0',
                    scrollbarWidth: 'thin'
                  }}
                >
                  {filteredAvailableStaff.length === 0 ? (
                    <div className="px-6 py-8 text-center text-xs text-[#6B7280]">
                      No available staff
                    </div>
                  ) : (
                    filteredAvailableStaff.map((staff) => (
                      <label
                        key={staff.userId}
                        className="px-6 py-3 hover:bg-[#F9FAFB] transition-colors flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStaffIds.has(staff.userId)}
                          onChange={() => toggleStaffSelection(staff.userId)}
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white flex-shrink-0"
                        />
                        <span className="text-sm text-[#374151] group-hover:text-[#111827] flex-1 truncate">
                          {staff.fullName}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Main Section - Assigned Staff */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-bold text-[#111827]">
                    Assigned Staff ({filteredAssignedStaff.length})
                  </h2>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search staff..."
                      value={searchAssignedQuery}
                      onChange={(e) => setSearchAssignedQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Assigned Staff Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredAssignedStaff.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-12 text-center text-[#6B7280]"
                          >
                            No staff assigned to this camp yet
                          </td>
                        </tr>
                      ) : (
                        filteredAssignedStaff.map((assignment, index) => (
                          <tr
                            key={assignment.campStaffAssignmentId}
                            className="hover:bg-[#F9FAFB] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                              {assignment.staff.fullName}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {assignment.staff.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <DeletePopover
                                onConfirm={() =>
                                  handleRemoveStaff(
                                    assignment.campStaffAssignmentId
                                  )
                                }
                                title="Remove Staff"
                                message={`Are you sure you want to remove "${assignment.staff.fullName}" from this camp?`}
                                buttonText="Remove"
                                disabled={assigning}
                                isOpen={
                                  deletePopoverOpen ===
                                  assignment.campStaffAssignmentId
                                }
                                onOpenChange={(open) =>
                                  setDeletePopoverOpen(
                                    open
                                      ? assignment.campStaffAssignmentId
                                      : null
                                  )
                                }
                              />
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

export default CampStaffManagement;
