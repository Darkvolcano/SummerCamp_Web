import React, { useEffect, useState } from "react";
import { Spin, Dropdown, Popover } from "antd";
import { Search, Filter, UserRoundPlus } from "lucide-react";
import { useNotification } from "../../../../contexts/NotificationContext";
import DeletePopover from "../../../../components/DeletePopover";
import campStaffService, {
  type StaffInfo,
  type CampStaffAssignmentResponse,
} from "../../../../services/campStaffService";

interface CampDetailStaffAssignmentProps {
  campId: number;
}

const CampDetailStaffAssignment: React.FC<CampDetailStaffAssignmentProps> = ({
  campId,
}) => {
  const { toastSuccess, toastError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [availableStaff, setAvailableStaff] = useState<StaffInfo[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<
    CampStaffAssignmentResponse[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeletePopover, setOpenDeletePopover] = useState<number | null>(
    null
  );
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<number>>(
    new Set()
  );
  const [roleFilter, setRoleFilter] = useState<"All" | "Staff" | "Manager">(
    "All"
  );
  const [assignPopoverOpen, setAssignPopoverOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    if (campId > 0) {
      fetchData();
    }
  }, [campId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [availableData, assignedData] = await Promise.all([
        campStaffService.getAvailableStaff(campId),
        campStaffService.getStaffByCamp(campId),
      ]);
      setAvailableStaff(availableData);
      setAssignedStaff(assignedData);
    } catch (error) {
      console.error("Error fetching staff data:", error);
      toastError("Error", "Failed to load staff data");
    } finally {
      setLoading(false);
    }
  };

  // Filter available staff
  const filteredAvailableStaff = availableStaff.filter((staff) => {
    const matchesSearch = staff.fullName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || staff.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle remove staff
  const handleRemoveStaff = async (assignmentId: number) => {
    try {
      setAssigning(true);
      await campStaffService.removeStaffFromCamp(assignmentId);
      toastSuccess("Success", "Staff assignment removed successfully");
      setOpenDeletePopover(null);
      await fetchData();
    } catch (error: any) {
      let errorMsg = "Failed to remove staff";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError("Error", errorMsg);
    } finally {
      setAssigning(false);
    }
  };

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
      toastError("Error", "Please select at least one staff member");
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
          await campStaffService.assignStaffToCamp({ staffId, campId });
          successCount++;
        } catch {
          failCount++;
          if (staff) {
            failedStaffNames.push(staff.fullName);
          }
        }
      }

      setSelectedStaffIds(new Set());
      await fetchData();

      if (failCount === 0) {
        toastSuccess(
          "Success",
          `Successfully assigned ${successCount} staff member${
            successCount > 1 ? "s" : ""
          }`
        );
      } else {
        const message = `Successfully assigned ${successCount} staff member${
          successCount > 1 ? "s" : ""
        }, failed: ${failedStaffNames.join(", ")}`;
        toastSuccess("Partial Success", message);
      }
    } catch {
      toastError("Error", "Failed to assign staff");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Loading staff data..." />
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Available Staff */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden sticky top-6">
            {/* Section Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#F9FAFB] to-white">
              <h3 className="text-lg font-bold text-[#111827]">
                Available Staff
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">Select to assign</p>
            </div>

            {/* Search Input with Filter */}
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                  />
                </div>
                <Dropdown
                  menu={{
                    items: [
                      {
                        label: "All",
                        key: "All",
                        onClick: () => setRoleFilter("All"),
                      },
                      {
                        label: "Staff",
                        key: "Staff",
                        onClick: () => setRoleFilter("Staff"),
                      },
                      {
                        label: "Manager",
                        key: "Manager",
                        onClick: () => setRoleFilter("Manager"),
                      },
                    ],
                  }}
                  placement="bottomRight"
                >
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 border border-[#D1D5DB] rounded-lg bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer">
                    <Filter size={18} className="text-[#000000]" />
                  </div>
                </Dropdown>
              </div>
            </div>

            {/* Found Count and Assign Button */}
            <div className="px-6 py-3 border-b border-[#E5E7EB] flex items-center justify-between gap-3">
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

            {/* Staff List */}
            <div
              className="overflow-y-auto max-h-[200px]"
              style={{
                scrollbarColor: '#ffffff #f0f0f0',
                scrollbarWidth: 'thin'
              }}
            >
              {filteredAvailableStaff.length === 0 ? (
                <div className="px-6 py-8 text-center text-[#6B7280] text-sm">
                  No available staff
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {filteredAvailableStaff.map((staff) => (
                    <div
                      key={staff.userId}
                      className="p-4 hover:bg-[#F9FAFB] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedStaffIds.has(staff.userId)}
                            onChange={() => toggleStaffSelection(staff.userId)}
                            className="w-4 h-4 rounded border-[#D1D5DB] text-[#059669] focus:ring-[#059669] focus:ring-2 bg-white cursor-pointer"
                          />
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#111827] truncate">
                              {staff.fullName}
                            </p>
                            <span
                              className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                staff.role === "Manager"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {staff.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content - Assigned Staff */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            {/* Section Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#F9FAFB] to-white">
              <h3 className="text-lg font-bold text-[#111827]">
                Assigned Staff
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Staff members assigned to this camp
              </p>
            </div>

            {/* Assigned Staff List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {assignedStaff.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-[#6B7280]"
                      >
                        No staff assigned to this camp yet
                      </td>
                    </tr>
                  ) : (
                    assignedStaff.map((assignment, index) => (
                      <tr
                        key={assignment.campStaffAssignmentId}
                        className="hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                          {assignment.staff.fullName}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              assignment.staff.role === "Manager"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {assignment.staff.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DeletePopover
                            onConfirm={() =>
                              handleRemoveStaff(
                                assignment.campStaffAssignmentId
                              )
                            }
                            message="Remove this staff from camp?"
                            disabled={assigning}
                            isOpen={
                              openDeletePopover ===
                              assignment.campStaffAssignmentId
                            }
                            onOpenChange={(open) =>
                              setOpenDeletePopover(
                                open ? assignment.campStaffAssignmentId : null
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
    </div>
  );
};

export default CampDetailStaffAssignment;
