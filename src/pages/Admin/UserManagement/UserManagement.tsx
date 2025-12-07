import React, { useState, useEffect, useCallback } from "react";
import { Search, Trash2, RefreshCw, Mail, Phone, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { Spin, Modal } from "antd";
import userAccountService, {
  type UserAccountResponseDto,
} from "../../../services/userAccountService";
import driverService, { type DriverResponseDto, DriverStatus } from "../../../services/driverService";
import { Role } from "../../../enums/role.enum";
import { useNotification } from "../../../contexts/NotificationContext";

const UserManagement: React.FC = () => {
  const { toastSuccess, toastError } = useNotification();
  const [users, setUsers] = useState<UserAccountResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pending drivers - separate section
  const [pendingDrivers, setPendingDrivers] = useState<DriverResponseDto[]>([]);
  const [loadingPendingDrivers, setLoadingPendingDrivers] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Status counts
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [statusCounts, setStatusCounts] = useState<{ active: number; inactive: number }>({
    active: 0,
    inactive: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const usersData = await userAccountService.getAllUsers();
      setUsers(usersData);
      calculateCounts(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toastError("Error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  const fetchPendingDrivers = useCallback(async () => {
    try {
      setLoadingPendingDrivers(true);
      const driversData = await driverService.getDriversByStatus(DriverStatus.PendingApproval);
      setPendingDrivers(driversData);
    } catch (error) {
      console.error("Error fetching pending drivers:", error);
      toastError("Error", "Failed to load pending drivers");
    } finally {
      setLoadingPendingDrivers(false);
    }
  }, [toastError]);

  // Fetch data
  useEffect(() => {
    fetchData();
    fetchPendingDrivers();
  }, [fetchData, fetchPendingDrivers]);

  const calculateCounts = (data: UserAccountResponseDto[]) => {
    const roles: Record<string, number> = {};
    let active = 0;
    let inactive = 0;

    data.forEach((user) => {
      roles[user.role] = (roles[user.role] || 0) + 1;
      if (user.isActive) {
        active++;
      } else {
        inactive++;
      }
    });

    setRoleCounts(roles);
    setStatusCounts({ active, inactive });
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      if (
        !fullName.includes(searchLower) &&
        !user.email.toLowerCase().includes(searchLower) &&
        !(user.phoneNumber || "").toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Role filter
    if (selectedRole !== "All" && user.role !== selectedRole) {
      return false;
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      const statusMatch = selectedStatuses.some((status) => {
        if (status === "Active") return user.isActive;
        if (status === "Inactive") return !user.isActive;
        return false;
      });
      if (!statusMatch) return false;
    }

    return true;
  });

  // Handle status checkbox
  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const isAllStatusSelected = selectedStatuses.length === 0;

  // Handle delete user
  const handleDelete = async (user: UserAccountResponseDto) => {
    Modal.confirm({
      title: "Delete User",
      content: `Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await userAccountService.deleteUser(user.userId);
          toastSuccess("Success", "User deleted successfully");
          fetchData();
        } catch (error) {
          console.error("Error deleting user:", error);
          toastError("Error", "Failed to delete user");
        }
      },
    });
  };

  // Handle approve driver
  const handleApproveDriver = async (driver: DriverResponseDto) => {
    try {
      await driverService.updateDriverStatus(driver.driverId, DriverStatus.Approved);
      toastSuccess("Success", "Driver approved successfully!");
      fetchPendingDrivers();
    } catch (error) {
      console.error("Error approving driver:", error);
      toastError("Error", "Failed to approve driver");
    }
  };

  // Handle reject driver
  const handleRejectDriver = async (driver: DriverResponseDto) => {
    Modal.confirm({
      title: "Reject Driver",
      content: `Are you sure you want to reject driver "${driver.firstName} ${driver.lastName}"?`,
      okText: "Reject",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await driverService.updateDriverStatus(driver.driverId, DriverStatus.Rejected);
          toastSuccess("Success", "Driver rejected successfully!");
          fetchPendingDrivers();
        } catch (error) {
          console.error("Error rejecting driver:", error);
          toastError("Error", "Failed to reject driver");
        }
      },
    });
  };

  // Handle toggle active status
  const handleToggleStatus = async (user: UserAccountResponseDto) => {
    try {
      await userAccountService.adminUpdateUser(user.userId, {
        role: user.role,
        isActive: !user.isActive,
      });
      toastSuccess("Success", `User ${!user.isActive ? "activated" : "deactivated"} successfully`);
      fetchData();
    } catch (error) {
      console.error("Error updating user status:", error);
      toastError("Error", "Failed to update user status");
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case Role.ADMIN:
        return "bg-purple-100 text-purple-700";
      case Role.PARENT:
        return "bg-blue-100 text-blue-700";
      case Role.STAFF:
        return "bg-green-100 text-green-700";
      case Role.DRIVER:
        return "bg-yellow-100 text-yellow-700";
      case Role.USER:
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">User Management</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Manage system users and their permissions
        </p>
      </div>

      {/* Pending Drivers Section */}
      {pendingDrivers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 rounded-lg p-2.5">
                <Clock className="text-orange-600" size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#111827]">
                  Pending Driver Approvals
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {pendingDrivers.length} driver{pendingDrivers.length > 1 ? "s" : ""} waiting for approval
                </p>
              </div>
            </div>
            <button
              onClick={fetchPendingDrivers}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#374151] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {loadingPendingDrivers ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" tip="Loading pending drivers..." />
            </div>
          ) : (
            <div className="space-y-2">
              {pendingDrivers.map((driver) => (
                <div
                  key={driver.driverId}
                  className="flex items-center justify-between p-4 bg-[#F9FAFB] hover:bg-[#F3F4F6] rounded-lg transition-all border border-[#E5E7EB]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm">
                      {driver.firstName?.[0]}{driver.lastName?.[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#111827]">
                        {driver.firstName} {driver.lastName}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                          <Mail size={12} />
                          {driver.email}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                          <span className="font-medium">License:</span>
                          {driver.licenseNumber || "N/A"}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                          <Calendar size={12} />
                          Exp: {formatDate(driver.licenseExpiry)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveDriver(driver)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all font-medium text-sm"
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectDriver(driver)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium text-sm"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 mb-6">
        {/* Search Filter */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#374151] mb-3">
            Search
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#374151] mb-3">
            Role
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRole("All")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRole === "All"
                  ? "bg-[#6366F1] text-white"
                  : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
              }`}
            >
              All
            </button>
            {Object.values(Role).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedRole === role
                    ? "bg-[#6366F1] text-white"
                    : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                }`}
              >
                {role}
                <span className="ml-2 text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
                  {roleCounts[role] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Checkboxes */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-3">
            Status
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={isAllStatusSelected}
                onChange={() => setSelectedStatuses([])}
                className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
              />
              <span className="text-sm text-[#374151] group-hover:text-[#111827] font-medium">
                All
              </span>
              <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
                {users.length}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedStatuses.includes("Active")}
                onChange={() => handleStatusToggle("Active")}
                className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
              />
              <span className="text-sm text-[#374151] group-hover:text-[#111827]">
                Active
              </span>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {statusCounts.active}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedStatuses.includes("Inactive")}
                onChange={() => handleStatusToggle("Inactive")}
                className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
              />
              <span className="text-sm text-[#374151] group-hover:text-[#111827]">
                Inactive
              </span>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                {statusCounts.inactive}
              </span>
            </label>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-sm text-[#6B7280]">Total Users: </span>
                <span className="text-lg font-bold text-[#111827]">
                  {filteredUsers.length}
                </span>
              </div>
              <div>
                <span className="text-sm text-[#6B7280]">Active: </span>
                <span className="text-lg font-bold text-[#10B981]">
                  {statusCounts.active}
                </span>
              </div>
              <div>
                <span className="text-sm text-[#6B7280]">Inactive: </span>
                <span className="text-lg font-bold text-[#EF4444]">
                  {statusCounts.inactive}
                </span>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-[#F3F4F6] text-[#374151] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">
              Found: {filteredUsers.length}
            </h2>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Date of Birth
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Spin size="large" tip="Loading users..." />
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-[#6B7280]"
                  >
                    No users found matching your filters
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.userId}
                    className="hover:bg-[#F9FAFB] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                      #{user.userId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-semibold">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-[#111827]">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <Mail size={14} />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <Phone size={14} />
                        {user.phoneNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <Calendar size={14} />
                        {formatDate(user.dateOfBirth)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                          user.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(user)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium text-sm"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
