import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Tag,
  CheckCircle,
  XCircle,
} from "lucide-react";
import VehicleTypeFormModal from "./VehicleTypeFormModal";
import vehicleService, {
  type VehicleType,
} from "../../../services/vehicleService";
import { message } from "antd";
import "./VehicleTypeManagement.css";

export default function VehicleTypeManagement() {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchVehicleTypes = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAllVehicleTypes();
      setVehicleTypes(data);
      setFilteredTypes(data);
      message.success("Tải loại xe thành công");
    } catch (error: any) {
      console.error("Lỗi khi tải loại xe:", error);
      message.error(
        error.response?.data?.message || "Lỗi khi tải loại xe"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = vehicleTypes.filter(
        (type) =>
          type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (type.description &&
            type.description?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredTypes(filtered);
    } else {
      setFilteredTypes(vehicleTypes);
    }
  }, [searchTerm, vehicleTypes]);

  const handleCreate = () => {
    setSelectedType(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (type: VehicleType) => {
    setSelectedType(type);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (type: VehicleType) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa loại xe "${type.name}"? Hành động này không thể hoàn tác.`
      )
    ) {
      return;
    }

    try {
      await vehicleService.deleteVehicleType(type.vehicleTypeId);
      message.success("Xóa loại xe thành công");
      fetchVehicleTypes();
    } catch (error: any) {
      console.error("Lỗi khi xóa loại xe:", error);
      message.error(
        error.response?.data?.message || "Lỗi khi xóa loại xe"
      );
    }
  };

  const handleFormSuccess = () => {
    fetchVehicleTypes();
    setIsFormModalOpen(false);
  };

  return (
    <>
      <div className="vehicle-type-management-header">
        <div className="header-left">
          <h1 className="page-title">Quản Lý Loại Xe</h1>
          <p className="page-subtitle">
            Quản lý các danh mục loại xe cho đội xe
          </p>
        </div>
        <button className="btn-create" onClick={handleCreate}>
          <Plus size={20} />
          <span>Tạo Loại Xe</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Tag size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Tổng Loại</p>
            <h3 className="stat-value">{vehicleTypes.length}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Loại Hoạt Động</p>
            <h3 className="stat-value">
              {vehicleTypes.filter((t) => t.isActive).length}
            </h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon inactive">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Loại Không Hoạt Động</p>
            <h3 className="stat-value">
              {vehicleTypes.filter((t) => !t.isActive).length}
            </h3>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm loại xe theo tên hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          className="btn-refresh"
          onClick={fetchVehicleTypes}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? "spinning" : ""} />
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <RefreshCw size={48} className="spinning" />
            <p>Đang tải loại xe...</p>
          </div>
        ) : filteredTypes.length === 0 ? (
          <div className="empty-state">
            <Tag size={64} />
            <h3>Không tìm thấy loại xe</h3>
            <p>
              {searchTerm
                ? "Thử điều chỉnh tìm kiếm"
                : "Tạo loại xe đầu tiên để bắt đầu"}
            </p>
            {!searchTerm && (
              <button className="btn-create" onClick={handleCreate}>
                <Plus size={20} />
                Tạo Loại Xe
              </button>
            )}
          </div>
        ) : (
          <table className="vehicle-types-table">
            <thead>
              <tr>
                <th>Tên Loại</th>
                <th>Mô Tả</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map((type) => (
                <tr key={type.vehicleTypeId}>
                  <td>
                    <div className="type-name-cell">
                      <Tag size={18} />
                      <span className="type-name">{type.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="type-description">
                      {type.description || "Không có mô tả"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${type.isActive ? "active" : "inactive"
                        }`}
                    >
                      {type.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(type)}
                        title="Edit Type"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(type)}
                        title="Delete Type"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filteredTypes.length > 0 && (
        <div className="results-footer">
          <p>
            Hiển thị {filteredTypes.length} trong {vehicleTypes.length} loại xe
          </p>
        </div>
      )}

      {isFormModalOpen && (
        <VehicleTypeFormModal
          vehicleType={selectedType}
          isEditing={isEditing}
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
}
