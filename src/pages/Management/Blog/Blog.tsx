/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Table,
  Space,
  Button,
  Input,
  Card,
  Modal,
  Descriptions,
  Tooltip,
  message,
  Form,
  Image,
  Skeleton,
  Typography,
  Tag,
  Popconfirm,
  type UploadFile,
  type UploadProps,
  Upload,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";
import {
  useBlogs,
  useCreateBlogs,
  useGetBlogById,
  useUpdateBlogs,
  useDeleteBlogs,
  type BlogDto,
} from "../../../services/blogService";
import { useQueryClient } from "@tanstack/react-query";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../config/firebase";

const { Text } = Typography;

const uploadImageAndGetUrl = async (file: File) => {
  const storageRef = ref(storage, `blogs/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  console.log("Uploaded URL:", url);
  return url;
};

const BlogManagement = () => {
  const [selectedBlog, setSelectedBlog] = useState<BlogDto | null>(null);
  const [form] = Form.useForm();
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { data: blogs, isLoading: isBlogLoading } = useBlogs();
  const queryClient = useQueryClient();
  const { mutate: createBlog, isPending: isCreating } = useCreateBlogs();
  const { mutate: updateBlog, isPending: isUpdating } = useUpdateBlogs();
  const { mutate: deleteBlog } = useDeleteBlogs();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // State để lưu URL sau upload

  const headerColor = "#A05A2C";
  const headerBgColor = "#F9E4B7";
  const evenRowBgColor = "#FFFDF5";
  const oddRowBgColor = "#FFF7E6";
  const cellTextColor = "#5D4037";
  const borderColor = "#F5EAD9";
  const tableBorderColor = "#E9C97B";

  const {
    data: detailedBlog,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useGetBlogById(selectedBlog?.id || 0);

  const handleOpenDetailModal = (record: BlogDto) => {
    setSelectedBlog(record);
    setIsDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedBlog(null);
  };

  const handleOpenEditModal = (record: BlogDto) => {
    setSelectedBlog(record);
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      image: record.image,
    });
    setUploadedImageUrl(record.image || null);
    setFileList([]);
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedBlog(null);
    form.resetFields();
    setUploadedImageUrl(null);
    setFileList([]);
  };

  const handleAddBlog = () => {
    form
      .validateFields()
      .then(async (values) => {
        let imageUrl = uploadedImageUrl || values.image;
        if (fileList.length > 0 && fileList[0].originFileObj) {
          try {
            imageUrl = await uploadImageAndGetUrl(
              fileList[0].originFileObj as File
            );
            setUploadedImageUrl(imageUrl);
          } catch (error) {
            message.error(
              "Lỗi khi upload hình ảnh: " + (error as Error).message
            );
            return;
          }
        }
        createBlog(
          { ...values, image: imageUrl },
          {
            onSuccess: () => {
              message.success("Tạo blog thành công!");
              setIsAddModalVisible(false);
              form.resetFields();
              setUploadedImageUrl(null);
              setFileList([]);
              queryClient.invalidateQueries({ queryKey: ["blogs"] });
            },
            onError: (error: any) => {
              const errorMessage = error.response?.data?.message;
              if (
                errorMessage ===
                "Title is required and must be under 255 characters"
              ) {
                message.error("Tiêu đề là bắt buộc và phải dưới 255 ký tự");
              } else if (errorMessage === "Content is required") {
                message.error("Nội dung là bắt buộc");
              } else if (
                errorMessage === "Image URL must end with .jpg, .jpeg, or .png"
              ) {
                message.error(
                  "Hình ảnh phải có định dạng .jpg, .jpeg hoặc .png"
                );
              } else {
                message.error(errorMessage || "Tạo blog thất bại");
              }
            },
          }
        );
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleEditBlog = () => {
    if (!selectedBlog) return;
    form
      .validateFields()
      .then(async (values) => {
        let imageUrl = uploadedImageUrl || selectedBlog.image;
        if (fileList.length > 0 && fileList[0].originFileObj) {
          try {
            imageUrl = await uploadImageAndGetUrl(
              fileList[0].originFileObj as File
            );
            setUploadedImageUrl(imageUrl); // Cập nhật state với URL mới
          } catch (error) {
            message.error(
              "Lỗi khi upload hình ảnh: " + (error as Error).message
            );
            return;
          }
        }
        updateBlog(
          {
            id: selectedBlog.id,
            blog: { ...selectedBlog, ...values, image: imageUrl },
          },
          {
            onSuccess: () => {
              message.success("Cập nhật blog thành công!");
              setIsEditModalVisible(false);
              form.resetFields();
              setUploadedImageUrl(null);
              setFileList([]);
              queryClient.invalidateQueries({ queryKey: ["blogs"] });
            },
            onError: (error: any) => {
              const errorMessage = error.response?.data?.message;
              if (
                errorMessage === "Image URL must end with .jpg, .jpeg, or .png"
              ) {
                message.error(
                  "Hình ảnh phải có định dạng .jpg, .jpeg hoặc .png"
                );
              } else if (
                errorMessage === "Title must be under 255 characters"
              ) {
                message.error("Tiêu đề phải dưới 255 ký tự");
              } else {
                message.error(errorMessage || "Cập nhật thất bại");
              }
            },
          }
        );
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleDelete = (id: number) => {
    deleteBlog(id, {
      onSuccess: () => {
        message.success("Xóa blog thành công!");
        queryClient.invalidateQueries({ queryKey: ["blogs"] });
      },
      onError: (error: any) => {
        message.error(error.message || "Xóa blog thất bại!");
      },
    });
  };

  const getStatusTagColor = (isActive: boolean) => {
    return isActive ? "#C8E6C9" : "#FFCDD2";
  };

  const getStatusTagTextColor = (isActive: boolean) => {
    return isActive ? "#388E3C" : "#C62828";
  };

  const columns: ColumnType<BlogDto>[] = [
    {
      title: "Mã blog",
      dataIndex: "id",
      key: "id",
      width: 120,
      sorter: (a, b) => (a.id ?? 0) - (b.id ?? 0),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (title) => (
        <Tooltip title={title}>
          <span style={{ fontWeight: 600, color: "#D97B41" }}>{title}</span>
        </Tooltip>
      ),
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 85,
      render: (img: string, record: BlogDto) => (
        <Image
          src={img}
          alt={record.title}
          width={60}
          height={60}
          style={{
            objectFit: "cover",
            borderRadius: 6,
            border: "1px solid #f0f0f0",
          }}
          preview={{ mask: <EyeOutlined style={{ fontSize: 14 }} /> }}
        />
      ),
    },
    {
      title: "Người tạo",
      dataIndex: ["Author", "fullName"],
      key: "fullName",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      render: (isActive: boolean) => (
        <Tag
          style={{
            background: getStatusTagColor(isActive),
            color: getStatusTagTextColor(isActive),
            fontWeight: "bold",
            borderRadius: 6,
            padding: "2px 10px",
          }}
        >
          {isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#D97B41", fontSize: 17 }} />}
              onClick={() => handleOpenDetailModal(record)}
              style={{ outline: "none", boxShadow: "none", border: "none" }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#A05A2C", fontSize: 17 }} />}
              onClick={() => handleOpenEditModal(record)}
              style={{ outline: "none", boxShadow: "none", border: "none" }}
            />
          </Tooltip>
          <Tooltip title="Ngừng hoạt động">
            <Popconfirm
              title="Ngừng hoạt động blog"
              description="Bạn có chắc muốn ngừng hoạt động blog này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xác nhận"
              cancelText="Hủy"
              okButtonProps={{
                danger: true,
                style: { background: "#D97B41", borderColor: "#D97B41" },
              }}
            >
              <Button
                type="text"
                danger
                icon={<CloseCircleOutlined style={{ fontSize: 16 }} />}
                style={{ outline: "none", boxShadow: "none", border: "none" }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const onUploadChange: UploadProps["onChange"] = async ({
    fileList: newFileList,
    file,
  }) => {
    setFileList(newFileList);
    if (
      newFileList.length > 0 &&
      file.status === "uploading" &&
      file.originFileObj
    ) {
      try {
        const imageUrl = await uploadImageAndGetUrl(file.originFileObj as File);
        setUploadedImageUrl(imageUrl);
        form.setFieldsValue({ image: imageUrl });
        console.log("Upload successful, URL set to:", imageUrl);
      } catch (error) {
        message.error("Lỗi khi upload hình ảnh: " + (error as Error).message);
        setFileList([]);
        setUploadedImageUrl(null);
      }
    } else if (newFileList.length === 0) {
      form.setFieldsValue({ image: null });
      setUploadedImageUrl(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFF9F0",
        padding: "20px 30px 30px 60px",
      }}
    >
      <style>{`
        .ant-table-thead > tr > th { background-color: ${headerBgColor} !important; color: ${headerColor} !important; font-weight: bold !important; border-right: 1px solid ${borderColor} !important; border-bottom: 2px solid ${tableBorderColor} !important; }
        .ant-table-thead > tr > th.ant-table-cell-fix-right:last-child { border-right: none !important; }
        .promo-table .ant-table-tbody > tr.even-row-promo > td { background-color: ${evenRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .promo-table .ant-table-tbody > tr.odd-row-promo > td { background-color: ${oddRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .promo-table .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) { border-right: none; }
        .promo-table .ant-table-tbody > tr:hover > td { background-color: #FDEBC8 !important; }
        .promo-table .ant-table-cell-fix-right { background: inherit !important; }
        .promo-table .ant-table-thead > tr > th.ant-table-cell-fix-right { background-color: ${headerBgColor} !important; }
        .ant-input-number:focus, .ant-input-number-focused, .ant-input-number:hover,
        .ant-select-focused .ant-select-selector, .ant-select-selector:focus, .ant-select-selector:hover,
        .ant-picker:focus, .ant-picker:hover, .ant-input:focus, .ant-input:hover,
        .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused, .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper:focus-within {
          border-color: #D97B41 !important; box-shadow: none !important;
        }
        .ant-pagination .ant-pagination-item-active, .ant-pagination .ant-pagination-item-active a { border-color: #D97B41 !important; color: #D97B41 !important; }
        .ant-select-selector { border-color: #E9C97B !important; }
        .ant-select-selector:hover { border-color: #D97B41 !important; }
      `}</style>
      <div style={{ maxWidth: 1300 }}>
        <h1
          style={{
            fontWeight: 700,
            color: "#A05A2C",
            fontSize: 36,
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          Quản lý Blog
        </h1>
        <Card
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 6px 16px rgba(30, 64, 175, 0.08)",
            padding: "16px 24px",
            border: `1px solid ${tableBorderColor}`,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              marginBottom: 24,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Space wrap className="order-search">
              <Input
                placeholder="Tìm theo mã, tiêu đề..."
                prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 280,
                  borderRadius: 6,
                  borderColor: "#E9C97B",
                  height: 32,
                }}
                allowClear
              />
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                background: "#D97B41",
                borderColor: "#D97B41",
                fontWeight: 600,
                borderRadius: 6,
              }}
              onClick={() => setIsAddModalVisible(true)}
            >
              Thêm blog
            </Button>
          </div>

          <Table
            className="material-table"
            columns={columns}
            dataSource={blogs}
            loading={isBlogLoading}
            rowKey="id"
            style={{
              borderRadius: 8,
              border: `1px solid ${tableBorderColor}`,
              overflow: "hidden",
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? "even-row-material" : "odd-row-material"
            }
            scroll={{ x: 980 }}
            sticky
          />
        </Card>

        <Modal
          title={
            <span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>
              Chi tiết blog
            </span>
          }
          open={isDetailModalVisible}
          onCancel={handleCloseDetailModal}
          centered
          footer={[
            <Button key="close" onClick={handleCloseDetailModal}>
              Đóng
            </Button>,
          ]}
          width={500}
        >
          {isDetailLoading ? (
            <Skeleton active />
          ) : isDetailError || !detailedBlog ? (
            <div>
              <Text type="danger">Không thể tải chi tiết blog.</Text>
            </div>
          ) : (
            <div>
              <Descriptions
                bordered
                column={1}
                size="middle"
                labelStyle={{ width: "150px", background: evenRowBgColor }}
              >
                <Descriptions.Item label="Mã">
                  {detailedBlog.id}
                </Descriptions.Item>
                <Descriptions.Item label="Tiêu đề">
                  {detailedBlog.title}
                </Descriptions.Item>
                <Descriptions.Item label="Nội dung">
                  {detailedBlog.content.substring(0, 100) + "..."}
                </Descriptions.Item>
                <Descriptions.Item label="Hình ảnh">
                  <Image
                    src={detailedBlog.image}
                    alt={detailedBlog.title}
                    style={{
                      display: "block",
                      margin: "auto",
                      maxWidth: "100%",
                    }}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x400/EFE6DB/2D1E1A?text=No+Image";
                    }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">
                  {detailedBlog.Author?.fullName || "Ẩn danh"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {new Date(detailedBlog.createdAt).toLocaleDateString("vi-VN")}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>

        <Modal
          title={
            <span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>
              Thêm blog
            </span>
          }
          open={isAddModalVisible}
          onCancel={() => {
            setIsAddModalVisible(false);
            form.resetFields();
            setUploadedImageUrl(null);
            setFileList([]);
          }}
          centered
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsAddModalVisible(false);
                form.resetFields();
                setUploadedImageUrl(null);
                setFileList([]);
              }}
            >
              Hủy
            </Button>,
            <Button
              key="create"
              type="primary"
              onClick={handleAddBlog}
              loading={isCreating}
              style={{ background: "#D97B41", borderColor: "#D97B41" }}
              disabled={isCreating}
            >
              Tạo
            </Button>,
          ]}
          width={500}
        >
          <Form
            form={form}
            name="addBlogForm"
            layout="vertical"
            onFinish={handleAddBlog}
          >
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
            >
              <Input placeholder="Nhập tiêu đề" />
            </Form.Item>
            <Form.Item
              name="content"
              label="Nội dung"
              rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
            >
              <Input.TextArea placeholder="Nhập nội dung" rows={4} />
            </Form.Item>
            <Form.Item
              name="image"
              label="Hình ảnh"
              rules={[
                { required: true, message: "Vui lòng tải lên hình ảnh!" },
              ]}
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={onUploadChange}
                beforeUpload={() => false}
                maxCount={1}
                accept="image/*"
              >
                {fileList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>
              {uploadedImageUrl && (
                <Image
                  src={uploadedImageUrl}
                  alt="Preview"
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: 200,
                  }}
                />
              )}
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>
              Chỉnh sửa blog
            </span>
          }
          open={isEditModalVisible}
          onCancel={handleCloseEditModal}
          centered
          footer={[
            <Button key="cancel" onClick={handleCloseEditModal}>
              Hủy
            </Button>,
            <Button
              key="update"
              type="primary"
              onClick={handleEditBlog}
              loading={isUpdating}
              style={{ background: "#D97B41", borderColor: "#D97B41" }}
              disabled={isUpdating}
            >
              Cập nhật
            </Button>,
          ]}
          width={600}
        >
          <Form
            form={form}
            name="editBlogForm"
            layout="vertical"
            onFinish={handleEditBlog}
          >
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
            >
              <Input placeholder="Nhập tiêu đề" />
            </Form.Item>
            <Form.Item
              name="content"
              label="Nội dung"
              rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
            >
              <Input.TextArea placeholder="Nhập nội dung" rows={4} />
            </Form.Item>
            <Form.Item
              name="image"
              label="Hình ảnh"
              rules={[
                { required: true, message: "Vui lòng tải lên hình ảnh!" },
              ]}
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={onUploadChange}
                beforeUpload={() => false}
                maxCount={1}
                accept="image/*"
              >
                {fileList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>
              {uploadedImageUrl && (
                <Image
                  src={uploadedImageUrl}
                  alt="Preview"
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: 200,
                  }}
                />
              )}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default BlogManagement;
