import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2 } from "lucide-react";
import { Modal, Form, Input, Spin } from "antd";
import campTypeService, {
  type CampTypeResponseDto,
  type CampTypeRequestDto,
} from "../../../services/campTypeService";
import { useNotification } from "../../../contexts/NotificationContext";
import DeletePopover from "../../../components/DeletePopover";

const CampTypePage: React.FC = () => {
  const { toastSuccess, toastError } = useNotification();
  const [campTypes, setCampTypes] = useState<CampTypeResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCampType, setEditingCampType] = useState<CampTypeResponseDto | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

  const fetchCampTypes = async () => {
    try {
      setLoading(true);
      const data = await campTypeService.getAllCampTypes();
      setCampTypes(data);
    } catch (error) {
      console.error("Error fetching camp types:", error);
      toastError("Error", "Failed to load camp types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampTypes();
  }, []);

  const filteredCampTypes = campTypes.filter((campType) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        campType.name.toLowerCase().includes(query) ||
        campType.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleAddClick = () => {
    setEditingCampType(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditClick = (campType: CampTypeResponseDto) => {
    setEditingCampType(campType);
    form.setFieldsValue({
      name: campType.name,
      description: campType.description,
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: CampTypeRequestDto = {
        name: values.name,
        description: values.description,
      };

      if (editingCampType) {
        await campTypeService.updateCampType(editingCampType.campTypeId, payload);
        toastSuccess("Success", "Camp type updated successfully");
      } else {
        await campTypeService.createCampType(payload);
        toastSuccess("Success", "Camp type created successfully");
      }

      await fetchCampTypes();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error submitting camp type:", error);
      toastError("Error", "Failed to save camp type");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (campTypeId: number) => {
    try {
      await campTypeService.deleteCampType(campTypeId);
      toastSuccess("Success", "Camp type deleted successfully");
      await fetchCampTypes();
      setDeletePopoverOpen(null);
    } catch (error) {
      console.error("Failed to delete camp type:", error);
      toastError("Error", "Failed to delete camp type");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Loại Trại</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Quản lý và tổ chức các loại trại cho chương trình
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : campTypes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 text-center">
          <p className="text-[#6B7280] text-lg mb-4">Không tìm thấy loại trại</p>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
          >
            <Plus size={16} />
            Tạo Loại Trại
          </button>
        </div>
      ) : (
        <>
          {/* Filters and Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sticky top-6">
                <h3 className="text-lg font-bold text-[#111827] mb-4">Bộ Lọc</h3>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wider">
                    Tìm Kiếm
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Theo tên hoặc mô tả..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                >
                  <Plus size={16} />
                  Tạo Loại Trại
                </button>

                {/* Summary Stats */}
                <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[#6B7280]">Tổng: </span>
                      <span className="text-lg font-bold text-[#111827]">
                        {campTypes.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#6B7280]">Tìm Thấy: </span>
                      <span className="text-lg font-bold text-[#6366F1]">
                        {filteredCampTypes.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#6B7280]">Hoạt Động: </span>
                      <span className="text-lg font-bold text-[#10B981]">
                        {campTypes.filter((t) => t.isActive).length}
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
                    Tìm Thấy: {filteredCampTypes.length}
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
                          Tên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Mô Tả
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Trạng Thái
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Thao Tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredCampTypes.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-12 text-center text-[#6B7280]"
                          >
                            Không tìm thấy loại trại phù hợp
                          </td>
                        </tr>
                      ) : (
                        filteredCampTypes.map((campType, index) => (
                          <tr
                            key={campType.campTypeId}
                            className="hover:bg-[#F9FAFB] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                              {campType.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              <span className="line-clamp-2">
                                {campType.description}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  campType.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {campType.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditClick(campType)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
                                  title="Edit Camp Type"
                                >
                                  <Edit2 size={16} />
                                  Sửa
                                </button>
                                <DeletePopover
                                  onConfirm={() =>
                                    handleDelete(campType.campTypeId)
                                  }
                                  title="Xóa Loại Trại"
                                  message={`Bạn có chắc muốn xóa "${campType.name}"?`}
                                  buttonText="Xóa"
                                  isOpen={deletePopoverOpen === campType.campTypeId}
                                  onOpenChange={(open) =>
                                    setDeletePopoverOpen(
                                      open ? campType.campTypeId : null
                                    )
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
        title={editingCampType ? "Edit Camp Type" : "Create Camp Type"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCampType(null);
          form.resetFields();
        }}
        confirmLoading={submitting}
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="Camp Type Name"
            name="name"
            rules={[
              { required: true, message: "Please input camp type name!" },
              { min: 2, message: "Name must be at least 2 characters!" },
              { max: 100, message: "Name cannot exceed 100 characters!" },
            ]}
          >
            <Input placeholder="e.g., Adventure Camp, Sports Camp" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please input description!" },
              { min: 10, message: "Description must be at least 10 characters!" },
              { max: 500, message: "Description cannot exceed 500 characters!" },
            ]}
          >
            <Input.TextArea
              placeholder="Describe this camp type..."
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CampTypePage;
