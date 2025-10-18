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
import AdminSidebar from "../../../components/admin/AdminSidebar";
import VehicleFormModal from "./VehicleFormModal";
import VehicleDetailModal from "./VehicleDetailModal";
import vehicleService, { type VehicleResponseDto } from "../../../services/vehicleService";
import { message } from "antd";
import "./VehicleManagement.css";

export default function VehicleManagement() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [vehicles, setVehicles] = useState<VehicleResponseDto[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<VehicleResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleResponseDto | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch vehicles
    const fetchVehicles = async () => {
        console.log("🔄 [VehicleManagement] Fetching vehicles...");
        try {
            setLoading(true);
            const data = await vehicleService.getAllVehicles();
            console.log("✅ [VehicleManagement] Received vehicles data:", data);
            console.log("📊 [VehicleManagement] Number of vehicles:", data.length);

            setVehicles(data);
            setFilteredVehicles(data);
            message.success("Vehicles loaded successfully");
        } catch (error: any) {
            console.error("❌ [VehicleManagement] Error fetching vehicles:", error);
            message.error(error.response?.data?.message || "Failed to load vehicles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    // Search and filter
    useEffect(() => {
        let result = vehicles;

        // Search filter
        if (searchTerm) {
            result = result.filter(
                (vehicle) =>
                    vehicle.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    vehicle.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    vehicle.vehicleTypeNavigation?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter(
                (vehicle) => vehicle.status?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        setFilteredVehicles(result);
    }, [searchTerm, statusFilter, vehicles]);

    // Handle create
    const handleCreate = () => {
        setSelectedVehicle(null);
        setIsEditing(false);
        setIsFormModalOpen(true);
    };

    // Handle edit
    const handleEdit = (vehicle: VehicleResponseDto) => {
        console.log("✏️ [VehicleManagement] Opening edit form for vehicle:", vehicle);
        setSelectedVehicle(vehicle);
        setIsEditing(true);
        setIsFormModalOpen(true);
    };

    // Handle view
    const handleView = (vehicle: VehicleResponseDto) => {
        setSelectedVehicle(vehicle);
        setIsDetailModalOpen(true);
    };

    // Handle delete
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
            message.error(error.response?.data?.message || "Failed to delete vehicle");
        }
    };

    // Handle form success
    const handleFormSuccess = () => {
        console.log("🎉 [VehicleManagement] Form submitted successfully, refreshing data...");
        fetchVehicles();
        setIsFormModalOpen(false);
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        const statusClass = status?.toLowerCase() || '';
        return <span className={`status-badge ${statusClass}`}>{status || 'N/A'}</span>;
    };

    // Get total capacity
    const getTotalCapacity = () => {
        return vehicles.reduce((sum, v) => sum + (v.capacity || 0), 0);
    };

    // Get available vehicles
    const getAvailableVehicles = () => {
        return vehicles.filter((v) => v.status?.toLowerCase() === "available").length;
    };

    return (
        <div className="vehicle-management-container">
            <AdminSidebar
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />

            <main className={`vehicle-management-main ${isCollapsed ? "sidebar-collapsed" : ""}`}>
                {/* Header */}
                <div className="vehicle-management-header">
                    <div className="header-left">
                        <h1 className="page-title">Vehicles Management</h1>
                        <p className="page-subtitle">
                            Manage your fleet of vehicles for camp transportation
                        </p>
                    </div>
                    <button className="btn-create" onClick={handleCreate}>
                        <Plus size={20} />
                        <span>Add New Vehicle</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <Truck size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Total Vehicles</p>
                            <h3 className="stat-value">{vehicles.length}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon active">
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Available</p>
                            <h3 className="stat-value">{getAvailableVehicles()}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon pending">
                            <AlertCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">In Maintenance</p>
                            <h3 className="stat-value">
                                {vehicles.filter((v) => v.status?.toLowerCase() === "maintenance").length}
                            </h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon revenue">
                            <Users size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Total Capacity</p>
                            <h3 className="stat-value">{getTotalCapacity()}</h3>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search vehicles by name, number, or type..."
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

                    <button className="btn-refresh" onClick={fetchVehicles} disabled={loading}>
                        <RefreshCw size={18} className={loading ? "spinning" : ""} />
                    </button>
                </div>

                {/* Table */}
                <div className="table-container">
                    {loading ? (
                        <div className="loading-state">
                            <RefreshCw size={48} className="spinning" />
                            <p>Loading vehicles...</p>
                        </div>
                    ) : filteredVehicles.length === 0 ? (
                        <div className="empty-state">
                            <Truck size={64} />
                            <h3>No vehicles found</h3>
                            <p>
                                {searchTerm || statusFilter !== "all"
                                    ? "Try adjusting your filters"
                                    : "Add your first vehicle to get started"}
                            </p>
                            {!searchTerm && statusFilter === "all" && (
                                <button className="btn-create" onClick={handleCreate}>
                                    <Plus size={20} />
                                    Add Vehicle
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="vehicles-table">
                            <thead>
                                <tr>
                                    <th>Vehicle Name</th>
                                    <th>Vehicle Number</th>
                                    <th>Type</th>
                                    <th>Capacity</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle.vehicleId}>
                                        <td>
                                            <div className="vehicle-name-cell">
                                                <Truck size={18} />
                                                <span className="vehicle-name">{vehicle.vehicleName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="vehicle-number">{vehicle.vehicleNumber}</span>
                                        </td>
                                        <td>
                                            <span className="vehicle-type">
                                                {vehicle.vehicleTypeNavigation?.name || "N/A"}
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
                                                    title="View Details"
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

                {/* Results count */}
                {!loading && filteredVehicles.length > 0 && (
                    <div className="results-footer">
                        <p>
                            Showing {filteredVehicles.length} of {vehicles.length} vehicles
                        </p>
                    </div>
                )}
            </main>

            {/* Modals */}
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
        </div>
    );
}
