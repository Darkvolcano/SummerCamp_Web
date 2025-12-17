import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Truck,
  Users,
  CheckCircle,
  AlertCircle,
  Filter,
  RefreshCw,
} from "lucide-react";
import VehicleFormModal from "./VehicleFormModal";
import VehicleDetailModal from "./VehicleDetailModal";
import vehicleService, {
  type VehicleResponseDto,
} from "../../../services/vehicleService";
import { message } from "antd";
import "./VehicleManagement.css";

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<VehicleResponseDto[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<
    VehicleResponseDto[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleResponseDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
      setFilteredVehicles(data);
      message.success("Vehicles loaded successfully");
    } catch (error: any) {
      console.error("Error fetching vehicles:", error);
      message.error(error.response?.data?.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    let result = vehicles;

    if (searchTerm) {
      result = result.filter(
        (vehicle) =>
          vehicle.vehicleName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          vehicle.vehicleNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          vehicle.vehicleType?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (vehicle) =>
          vehicle.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredVehicles(result);
  }, [searchTerm, statusFilter, vehicles]);

  const handleCreate = () => {
    setSelectedVehicle(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (vehicle: VehicleResponseDto) => {
    setSelectedVehicle(vehicle);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleView = (vehicle: VehicleResponseDto) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (vehicle: VehicleResponseDto) => {
    if (
      !window.confirm(
        `Are you sure you want to delete vehicle "${vehicle.vehicleName}" (${vehicle.vehicleNumber})? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await vehicleService.deleteVehicle(vehicle.vehicleId);
      message.success("Vehicle deleted successfully");
      fetchVehicles();
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      message.error(
        error.response?.data?.message || "Failed to delete vehicle"
      );
    }
  };

  const handleFormSuccess = () => {
    fetchVehicles();
    setIsFormModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusClass = status?.toLowerCase() || "";
    return (
      <span className={`status-badge ${statusClass}`}>{status || "Không có"}</span>
    );
  };

  const getTotalCapacity = () => {
    return vehicles.reduce((sum, v) => sum + (v.capacity || 0), 0);
  };

  const getAvailableVehicles = () => {
    return vehicles.filter((v) => v.status?.toLowerCase() === "available")
      .length;
  };

  return (
    <>
      <div className="vehicle-management-header">
        <div className="header-left">
          <h1 className="page-title">Quản Lý Xe</h1>
          <p className="page-subtitle">
            Quản lý đội xe cho việc vận chuyển trại
          </p>
        </div>
        <button className="btn-create" onClick={handleCreate}>
          <Plus size={20} />
          <span>Thêm Xe Mới</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Truck size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Tổng Số Xe</p>
            <h3 className="stat-value">{vehicles.length}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Sẵn Sàng</p>
            <h3 className="stat-value">{getAvailableVehicles()}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Đang Bảo Trì</p>
            <h3 className="stat-value">
              {
                vehicles.filter(
                  (v) => v.status?.toLowerCase() === "maintenance"
                ).length
              }
            </h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Tổng Sức Chứa</p>
            <h3 className="stat-value">{getTotalCapacity()}</h3>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm xe theo tên, biển số, loại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="in use">In Use</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          className="btn-refresh"
          onClick={fetchVehicles}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? "spinning" : ""} />
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <RefreshCw size={48} className="spinning" />
            <p>Đang tải xe...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="empty-state">
            <Truck size={64} />
            <h3>Không tìm thấy xe</h3>
            <p>
              {searchTerm || statusFilter !== "all"
                ? "Thử điều chỉnh bộ lọc"
                : "Thêm xe đầu tiên để bắt đầu"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button className="btn-create" onClick={handleCreate}>
                <Plus size={20} />
                Thêm Xe
              </button>
            )}
          </div>
        ) : (
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Tên Xe</th>
                <th>Biển Số</th>
                <th>Loại</th>
                <th>Sức Chứa</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.vehicleId}>
                  <td>
                    <div className="vehicle-name-cell">
                      <Truck size={18} />
                      <span className="vehicle-name">
                        {vehicle.vehicleName}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="vehicle-number">
                      {vehicle.vehicleNumber}
                    </span>
                  </td>
                  <td>
                    <span className="vehicle-type">
                      {vehicle.vehicleType?.name || "Không có"}
                    </span>
                  </td>
                  <td>
                    <div className="capacity-cell">
                      <Users size={16} />
                      <span>{vehicle.capacity}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(vehicle.status)}</td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-btn view"
                        onClick={() => handleView(vehicle)}
                        title="Xem Chi Tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(vehicle)}
                        title="Edit Vehicle"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(vehicle)}
                        title="Delete Vehicle"
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

      {!loading && filteredVehicles.length > 0 && (
        <div className="results-footer">
          <p>
            Hiển thị {filteredVehicles.length} trong {vehicles.length} xe
          </p>
        </div>
      )}

      {isFormModalOpen && (
        <VehicleFormModal
          vehicle={selectedVehicle}
          isEditing={isEditing}
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {isDetailModalOpen && selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={() => {
            setIsDetailModalOpen(false);
            handleEdit(selectedVehicle);
          }}
          onDelete={() => {
            setIsDetailModalOpen(false);
            handleDelete(selectedVehicle);
          }}
        />
      )}
    </>
  );
}
