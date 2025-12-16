import React, { useEffect, useState } from 'react';
import { Spin, message, Modal, Form, Input, InputNumber, Select } from 'antd';
import { Search, Plus, Edit2, CheckCircle2 } from 'lucide-react';
import { useManagerContext } from '../../../hooks/useManagerContext';
import { useNotification } from '../../../contexts/NotificationContext';
import groupService, { type GroupResponseDto, type GroupRequestDto } from '../../../services/groupService';
import staffService, { type StaffInfo } from '../../../services/staffService';
import campService, { type CampResponseDto } from '../../../services/campService';
import camperGroupService from '../../../services/camperGroupService';
import DeletePopover from '../../../components/DeletePopover';

const GroupManagement: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastSuccess, toastError } = useNotification();

  const [groups, setGroups] = useState<GroupResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [campData, setCampData] = useState<CampResponseDto | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupResponseDto | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Delete popover state
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

  // Pending assignment campers
  const [pendingCampers, setPendingCampers] = useState<any[]>([]);

  // Group members (for detail view)
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Selected groups for pending campers (camperId -> groupId)
  const [selectedGroups, setSelectedGroups] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!selectedCampId) {
      setGroups([]);
      setCampData(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch groups
        const groupsData = await groupService.getGroupsByCampId(selectedCampId);
        setGroups(groupsData);

        // Fetch camp data
        const campInfo = await campService.getCampById(selectedCampId);
        setCampData(campInfo);

        // Fetch pending assignment campers
        try {
          const pendingData = await camperGroupService.getPendingAssignCampers(selectedCampId);
          setPendingCampers(pendingData);
        } catch (error) {
          console.error('Failed to load pending campers:', error);
          setPendingCampers([]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        message.error('Unable to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCampId]);

  // Fetch available staff when modal opens
  useEffect(() => {
    if (isModalVisible && selectedCampId) {
      const fetchStaff = async () => {
        try {
          const staffData = await staffService.getAvailableGroupStaff(selectedCampId);
          setStaffList(staffData);
        } catch (error) {
          console.error('Failed to load staff:', error);
          toastError('Error', 'Unable to load supervisors');
        }
      };

      fetchStaff();
    }
  }, [isModalVisible, selectedCampId, toastError]);

  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Select Camp</h3>
          <p className="text-indigo-700 text-base leading-relaxed">Please select a camp from the left sidebar to view groups</p>
        </div>
      </div>
    );
  }

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

  // Handle add group
  const handleAddClick = () => {
    setEditingGroup(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle edit group
  const handleEditClick = async (group: GroupResponseDto) => {
    try {
      // Fetch complete group data
      const fullGroupData = await groupService.getGroupById(group.groupId);
      setEditingGroup(fullGroupData);
      form.setFieldsValue({
        groupName: fullGroupData.groupName,
        description: fullGroupData.description,
        maxSize: fullGroupData.maxSize,
        supervisorId: fullGroupData.supervisorId,
        minAge: fullGroupData.minAge,
        maxAge: fullGroupData.maxAge,
      });

      // Fetch group members
      setLoadingMembers(true);
      try {
        const members = await camperGroupService.getCamperGroups({ groupId: group.groupId });
        console.log('[GroupManagement] Fetched group members:', members);
        setGroupMembers(Array.isArray(members) ? members : []);
      } catch (error) {
        console.error('Failed to load group members:', error);
        setGroupMembers([]);
        // Don't show error toast here, just log it
      } finally {
        setLoadingMembers(false);
      }

      setIsModalVisible(true);
    } catch (error) {
      console.error('Failed to load group details:', error);
      toastError('Error', 'Failed to load group details');
    }
  };

  // Calculate total max size of groups
  const getTotalMaxSize = () => {
    return groups.reduce((sum, group) => sum + group.maxSize, 0);
  };

  // Get supervisor name by ID
  const getSupervisorName = (userId: number) => {
    const supervisor = staffList.find((staff) => staff.userId === userId);
    if (supervisor) {
      return supervisor.fullName;
    }
    // If not in staff list, try to get from editing group
    if (editingGroup?.supervisorId === userId && editingGroup?.supervisorName) {
      return editingGroup.supervisorName;
    }
    return '';
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: GroupRequestDto = {
        groupName: values.groupName,
        description: values.description,
        maxSize: values.maxSize,
        supervisorId: values.supervisorId,
        campId: selectedCampId,
        minAge: values.minAge,
        maxAge: values.maxAge,
      };

      if (editingGroup) {
        // Update group
        await groupService.updateGroup(editingGroup.groupId, payload);
        toastSuccess('Success', 'Group updated successfully');
      } else {
        // Create new group
        await groupService.createGroup(payload);
        toastSuccess('Success', 'Group created successfully');
      }

      // Refresh groups
      if (selectedCampId) {
        const groupsData = await groupService.getGroupsByCampId(selectedCampId);
        setGroups(groupsData);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error submitting group:', error);
      toastError('Error', 'Failed to save group');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete group
  const handleDelete = async (groupId: number) => {
    try {
      await groupService.deleteGroup(groupId);
      toastSuccess('Success', 'Group deleted successfully');
      // Refresh groups
      if (selectedCampId) {
        const groupsData = await groupService.getGroupsByCampId(selectedCampId);
        setGroups(groupsData);
      }
      setDeletePopoverOpen(null);
    } catch (error) {
      console.error('Failed to delete group:', error);
      toastError('Error', 'Failed to delete group');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Camper Groups</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Manage and organize camper groups
        </p>
      </div>

      {/* Pending Assignment Section */}
      {pendingCampers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden mb-6">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="text-lg font-bold text-[#111827]">
              Pending Group Assignment ({pendingCampers.length})
            </h2>
          </div>

          {/* Scrollable Table */}
          <div className="overflow-y-auto max-h-96">
            <table className="w-full border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Camper Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Camper ID
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {pendingCampers.map((registration: any, index: number) => (
                  <tr
                    key={registration?.camper?.camperId || index}
                    className="hover:bg-[#F9FAFB] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                      {registration?.camper?.camperName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                      #{registration?.camper?.camperId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          placeholder="Select group"
                          size="small"
                          className="w-48"
                          value={selectedGroups[registration?.camper?.camperId]}
                          options={groups.map(g => ({
                            label: g.groupName,
                            value: g.groupId
                          }))}
                          onChange={(groupId) => {
                            if (registration?.camper?.camperId) {
                              setSelectedGroups(prev => ({
                                ...prev,
                                [registration.camper.camperId]: groupId
                              }));
                            }
                          }}
                        />
                        <button
                          onClick={async () => {
                            const groupId = selectedGroups[registration?.camper?.camperId];
                            if (groupId && registration?.camper?.camperId) {
                              try {
                                await camperGroupService.addCamperToGroup({
                                  camperId: registration.camper.camperId,
                                  groupId: groupId
                                });
                                toastSuccess('Success', 'Camper assigned to group');
                                // Clear selection
                                setSelectedGroups(prev => {
                                  const newState = { ...prev };
                                  delete newState[registration.camper.camperId];
                                  return newState;
                                });
                                // Refresh pending campers
                                if (selectedCampId) {
                                  const pendingData = await camperGroupService.getPendingAssignCampers(selectedCampId);
                                  setPendingCampers(pendingData);
                                }
                              } catch (error: any) {
                                console.error('Failed to assign camper:', error);
                                const errorMsg = error.response?.data?.message || error.message || 'Failed to assign camper to group';
                                toastError('Error', errorMsg);
                              }
                            } else {
                              toastError('Error', 'Please select a group first');
                            }
                          }}
                          disabled={!selectedGroups[registration?.camper?.camperId]}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium text-sm"
                        >
                          <CheckCircle2 size={16} />
                          Assign
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

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Filters and Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sticky top-6">
                <h3 className="text-lg font-bold text-[#111827] mb-4">Search</h3>

                {/* Search */}
                <div className="mb-6">
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

                {/* Max Size Info */}
                {campData && (
                  <div className="mb-6">
                    <p className="text-xs font-medium text-[#6B7280] mb-1">Capacity</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-[#111827]">{getTotalMaxSize()}</span>
                      <span className="text-xs text-[#6B7280]">/ {campData.maxParticipants} max</span>
                    </div>
                  </div>
                )}

                {/* Add Button */}
                <button
                  onClick={handleAddClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                >
                  <Plus size={16} />
                  Add Group
                </button>

              </div>
            </div>

            {/* Right Main Section - Table */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-bold text-[#111827]">
                    Found: {filteredGroups.length}
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
                          Group Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Size / Age
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Supervisor
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredGroups.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-12 text-center text-[#6B7280]"
                          >
                            No groups found matching your filters
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
                                Max {group.maxSize}
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
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditClick(group)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
                                  title="Edit Group"
                                >
                                  <Edit2 size={16} />
                                  Edit
                                </button>
                                <DeletePopover
                                  onConfirm={() => handleDelete(group.groupId)}
                                  title="Delete Group"
                                  message={`Are you sure you want to delete "${group.groupName}"?`}
                                  buttonText="Delete"
                                  isOpen={deletePopoverOpen === group.groupId}
                                  onOpenChange={(open) =>
                                    setDeletePopoverOpen(open ? group.groupId : null)
                                  }
                                />
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
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={editingGroup ? 'Edit Group' : 'Add New Group'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingGroup(null);
          form.resetFields();
        }}
        confirmLoading={submitting}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            label="Group Name"
            name="groupName"
            rules={[
              { required: true, message: 'Please input group name!' },
              { min: 1, message: 'Group name cannot be empty!' },
            ]}
          >
            <Input placeholder="e.g., Group A1, Group B2" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: 'Please input description!' },
            ]}
          >
            <Input.TextArea placeholder="e.g., Group for elementary students" rows={3} />
          </Form.Item>

          <Form.Item
            label="Max Size"
            name="maxSize"
            rules={[
              { required: true, message: 'Please input max size!' },
              { type: 'number', min: 1, message: 'Max size must be at least 1!' },
            ]}
          >
            <InputNumber min={1} placeholder="e.g., 30" className="w-full" />
          </Form.Item>

          <Form.Item
            label="Supervisor"
            name="supervisorId"
            rules={[
              { required: false },
            ]}
            help={!editingGroup?.supervisorName ? '⚠️ No supervisor assigned' : ''}
          >
            <Select
              placeholder="Select a supervisor (optional)"
              allowClear
              optionLabelProp="label"
              options={staffList.map((staff) => ({
                label: staff.fullName,
                value: staff.userId,
              }))}
              labelRender={(props) => {
                if (props.value) {
                  return getSupervisorName(Number(props.value));
                }
                return props.label;
              }}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Min Age"
              name="minAge"
              rules={[
                { required: true, message: 'Please input min age!' },
                { type: 'number', min: 0, message: 'Min age must be >= 0!' },
              ]}
            >
              <InputNumber min={0} placeholder="e.g., 5" className="w-full" />
            </Form.Item>

            <Form.Item
              label="Max Age"
              name="maxAge"
              rules={[
                { required: true, message: 'Please input max age!' },
                { type: 'number', min: 0, message: 'Max age must be >= 0!' },
              ]}
            >
              <InputNumber min={0} placeholder="e.g., 15" className="w-full" />
            </Form.Item>
          </div>

          {/* Group Members Section (only show when editing) */}
          {editingGroup && groupMembers && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Group Members ({groupMembers.length || 0})
                </h3>
                {loadingMembers && <Spin size="small" />}
              </div>
              {groupMembers.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {groupMembers.map((member: any, index: number) => (
                    <div
                      key={member.camperGroupId || index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.camperName?.camperName || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {member.camperName?.camperId || 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Remove ${member.camperName?.camperName} from this group?`)) {
                            try {
                              await camperGroupService.deleteCamperGroup(member.camperGroupId);
                              toastSuccess('Success', 'Camper removed from group');
                              // Refresh group members
                              const members = await camperGroupService.getCamperGroups({ groupId: editingGroup?.groupId });
                              setGroupMembers(Array.isArray(members) ? members : []);
                            } catch (error: any) {
                              console.error('Failed to remove camper:', error);
                              const errorMsg = error.response?.data?.message || error.message || 'Failed to remove camper from group';
                              toastError('Error', errorMsg);
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded bg-white border border-red-300 hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No campers assigned yet</p>
              )}
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default GroupManagement;
