import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Calendar } from "lucide-react";
import { Modal, Form, Input, DatePicker, Spin, Select, InputNumber } from "antd";
import dayjs from "dayjs";
import promotionService, {
  type PromotionResponseDto,
  type PromotionRequestDto,
  type PromotionTypeResponseDto,
} from "../../../services/promotionService";
import { useNotification } from "../../../contexts/NotificationContext";
import DeletePopover from "../../../components/DeletePopover";

const { TextArea } = Input;
const { Option } = Select;

const PromotionPage: React.FC = () => {
  const { toastSuccess, toastError } = useNotification();
  const [promotions, setPromotions] = useState<PromotionResponseDto[]>([]);
  const [promotionTypes, setPromotionTypes] = useState<PromotionTypeResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionResponseDto | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await promotionService.getAllPromotions();
      setPromotions(data);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toastError("Error", "Failed to load promotions");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  const fetchPromotionTypes = useCallback(async () => {
    try {
      const data = await promotionService.getAllPromotionTypes();
      setPromotionTypes(data);
    } catch (error) {
      console.error("Error fetching promotion types:", error);
      toastError("Error", "Failed to load promotion types");
    }
  }, [toastError]);

  useEffect(() => {
    fetchPromotions();
    fetchPromotionTypes();
  }, [fetchPromotions, fetchPromotionTypes]);

  const filteredPromotions = promotions.filter((promotion) => {
    const matchesSearch =
      !searchQuery ||
      promotion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promotion.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || promotion.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddClick = () => {
    setEditingPromotion(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditClick = (promotion: PromotionResponseDto) => {
    setEditingPromotion(promotion);
    form.setFieldsValue({
      name: promotion.name,
      description: promotion.description,
      code: promotion.code,
      percent: promotion.percent,
      maxDiscountAmount: promotion.maxDiscountAmount,
      promotionTypeId: promotion.promotionType.id,
      startDate: dayjs(promotion.startDate),
      endDate: dayjs(promotion.endDate),
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: PromotionRequestDto = {
        name: values.name,
        description: values.description,
        code: values.code,
        percent: values.percent,
        maxDiscountAmount: values.maxDiscountAmount,
        promotionTypeId: values.promotionTypeId,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };

      if (editingPromotion) {
        await promotionService.updatePromotion(editingPromotion.id, payload);
        toastSuccess("Success", "Promotion updated successfully");
      } else {
        await promotionService.createPromotion(payload);
        toastSuccess("Success", "Promotion created successfully");
      }

      await fetchPromotions();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error submitting promotion:", error);
      toastError("Error", "Failed to save promotion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await promotionService.deletePromotion(id);
      toastSuccess("Success", "Promotion deleted successfully");
      await fetchPromotions();
      setDeletePopoverOpen(null);
    } catch (error) {
      console.error("Failed to delete promotion:", error);
      toastError("Error", "Failed to delete promotion");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      Active: { bg: "bg-green-100", text: "text-green-700" },
      Expired: { bg: "bg-gray-100", text: "text-gray-700" },
      Scheduled: { bg: "bg-blue-100", text: "text-blue-700" },
    };

    const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-700" };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Promotions</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Manage discount promotions and special offers
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 text-center">
          <p className="text-[#6B7280] text-lg mb-4">No promotions found</p>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
          >
            <Plus size={16} />
            Create Promotion
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
                <h3 className="text-lg font-bold text-[#111827] mb-4">Filters</h3>

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
                      placeholder="By name or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280]"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>

                <button
                  onClick={handleAddClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                >
                  <Plus size={16} />
                  Create Promotion
                </button>

                <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[#6B7280]">Total: </span>
                      <span className="text-lg font-bold text-[#111827]">
                        {promotions.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#6B7280]">Found: </span>
                      <span className="text-lg font-bold text-[#6366F1]">
                        {filteredPromotions.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#6B7280]">Active: </span>
                      <span className="text-lg font-bold text-[#10B981]">
                        {promotions.filter((p) => p.status === "Active").length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-bold text-[#111827]">
                    Found: {filteredPromotions.length}
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Discount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Period
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
                      {filteredPromotions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-12 text-center text-[#6B7280]"
                          >
                            No promotions found matching your filters
                          </td>
                        </tr>
                      ) : (
                        filteredPromotions.map((promotion) => (
                          <tr
                            key={promotion.id}
                            className="hover:bg-[#F9FAFB] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono font-medium text-[#6366F1]">
                              {promotion.code}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-[#111827]">
                                {promotion.name}
                              </div>
                              <div className="text-xs text-[#6B7280] line-clamp-1">
                                {promotion.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              {promotion.promotionType.name}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-[#10B981]">
                                {promotion.percent}% OFF
                              </div>
                              <div className="text-xs text-[#6B7280]">
                                Max: {promotion.maxDiscountAmount.toLocaleString()} VND
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-[#6B7280]">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                {dayjs(promotion.startDate).format("MMM DD, YYYY")}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Calendar size={12} />
                                {dayjs(promotion.endDate).format("MMM DD, YYYY")}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {getStatusBadge(promotion.status)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditClick(promotion)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
                                  title="Edit Promotion"
                                >
                                  <Edit2 size={16} />
                                  Edit
                                </button>
                                <DeletePopover
                                  onConfirm={() => handleDelete(promotion.id)}
                                  title="Delete Promotion"
                                  message={`Are you sure you want to delete "${promotion.name}"?`}
                                  buttonText="Delete"
                                  isOpen={deletePopoverOpen === promotion.id}
                                  onOpenChange={(open) =>
                                    setDeletePopoverOpen(open ? promotion.id : null)
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

      <Modal
        title={editingPromotion ? "Edit Promotion" : "Create Promotion"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingPromotion(null);
          form.resetFields();
        }}
        confirmLoading={submitting}
        width={700}
        okText={editingPromotion ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="Promotion Name"
            name="name"
            rules={[
              { required: true, message: "Please input promotion name!" },
              { min: 3, message: "Name must be at least 3 characters!" },
            ]}
          >
            <Input placeholder="e.g., Summer Special Discount" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please input description!" }]}
          >
            <TextArea
              placeholder="Describe the promotion..."
              rows={3}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Promotion Code"
              name="code"
              rules={[
                { required: true, message: "Please input code!" },
                { pattern: /^[A-Z0-9_]+$/, message: "Code must be uppercase letters, numbers, or underscores!" },
              ]}
            >
              <Input placeholder="e.g., SUMMER2024" />
            </Form.Item>

            <Form.Item
              label="Promotion Type"
              name="promotionTypeId"
              rules={[{ required: true, message: "Please select type!" }]}
            >
              <Select placeholder="Select type">
                {promotionTypes.map((type) => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Discount Percentage"
              name="percent"
              rules={[
                { required: true, message: "Please input discount!" },
                { type: "number", min: 0, max: 100, message: "Must be between 0-100!" },
              ]}
            >
              <InputNumber
                min={0}
                max={100}
                placeholder="0"
                className="w-full"
                addonAfter="%"
              />
            </Form.Item>

            <Form.Item
              label="Max Discount Amount"
              name="maxDiscountAmount"
              rules={[
                { required: true, message: "Please input max amount!" },
                { type: "number", min: 0, message: "Must be positive!" },
              ]}
            >
              <InputNumber
                min={0}
                placeholder="0"
                className="w-full"
                addonAfter="VND"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Start Date"
              name="startDate"
              rules={[{ required: true, message: "Please select start date!" }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="endDate"
              rules={[
                { required: true, message: "Please select end date!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('startDate') || value.isAfter(getFieldValue('startDate'))) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('End date must be after start date!'));
                  },
                }),
              ]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                className="w-full"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionPage;
