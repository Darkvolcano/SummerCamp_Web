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
import AdminSidebar from "../../../components/admin/AdminSidebar";
import VehicleTypeFormModal from "./VehicleTypeFormModal";
import vehicleService, { type VehicleType } from "../../../services/vehicleService";
import { message } from "antd";
import "./VehicleTypeManagement.css";

export default function VehicleTypeManagement() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
    const [filteredTypes, setFilteredTypes] = useState<VehicleType[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<VehicleType | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch vehicle types
    const fetchVehicleTypes = async () => {
        try {
            setLoading(true);
            const data = await vehicleService.getAllVehicleTypes();
            setVehicleTypes(data);
            setFilteredTypes(data);
            message.success("Vehicle types loaded successfully");
        } catch (error: any) {
            console.error("Error fetching vehicle types:", error);
            message.error(error.response?.data?.message || "Failed to load vehicle types");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicleTypes();
    }, []);

    // Search filter
    useEffect(() => {
        if (searchTerm) {
            const filtered = vehicleTypes.filter(
                (type) =>
                    type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (type.description && type.description?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredTypes(filtered);
        } else {
            setFilteredTypes(vehicleTypes);
        }
    }, [searchTerm, vehicleTypes]);

    // Handle create
    const handleCreate = () => {
        setSelectedType(null);
        setIsEditing(false);
        setIsFormModalOpen(true);
    };

    // Handle edit
    const handleEdit = (type: VehicleType) => {
        setSelectedType(type);
        setIsEditing(true);
        setIsFormModalOpen(true);
    };

    // Handle delete
    const handleDelete = async (type: VehicleType) => {
        if (
            !window.confirm(
                `Are you sure you want to delete vehicle type "${type.name}"? This action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            await vehicleService.deleteVehicleType(type.vehicleTypeId);
            message.success("Vehicle type deleted successfully");
            fetchVehicleTypes();
        } catch (error: any) {
            console.error("Error deleting vehicle type:", error);
            message.error(error.response?.data?.message || "Failed to delete vehicle type");
        }
    };

    // Handle form submit
    const handleFormSuccess = () => {
        fetchVehicleTypes();
        setIsFormModalOpen(false);
    };

    return (
        <div className="vehicle-type-management-container">
            <AdminSidebar
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />

            <main className={`vehicle-type-management-main ${isCollapsed ? "sidebar-collapsed" : ""}`}>
                {/* Header */}
                <div className="vehicle-type-management-header">
                    <div className="header-left">
                        <h1 className="page-title">Vehicle Types Management</h1>
                        <p className="page-subtitle">
                            Manage vehicle type categories for your fleet
                        </p>
                    </div>
                    <button className="btn-create" onClick={handleCreate}>
                        <Plus size={20} />
                        <span>Create Vehicle Type</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <Tag size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Total Types</p>
                            <h3 className="stat-value">{vehicleTypes.length}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon active">
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Active Types</p>
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
                            <p className="stat-label">Inactive Types</p>
                            <h3 className="stat-value">
                                {vehicleTypes.filter((t) => !t.isActive).length}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="filters-section">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search vehicle types by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className="btn-refresh" onClick={fetchVehicleTypes} disabled={loading}>
                        <RefreshCw size={18} className={loading ? "spinning" : ""} />
                    </button>
                </div>

                {/* Table */}
                <div className="table-container">
                    {loading ? (
                        <div className="loading-state">
                            <RefreshCw size={48} className="spinning" />
                            <p>Loading vehicle types...</p>
                        </div>
                    ) : filteredTypes.length === 0 ? (
                        <div className="empty-state">
                            <Tag size={64} />
                            <h3>No vehicle types found</h3>
                            <p>
                                {searchTerm
                                    ? "Try adjusting your search"
                                    : "Create your first vehicle type to get started"}
                            </p>
                            {!searchTerm && (
                                <button className="btn-create" onClick={handleCreate}>
                                    <Plus size={20} />
                                    Create Vehicle Type
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="vehicle-types-table">
                            <thead>
                                <tr>
                                    <th>Type Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
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
                                                {type.description || "No description"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${type.isActive ? "active" : "inactive"}`}>
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

                {/* Results count */}
                {!loading && filteredTypes.length > 0 && (
                    <div className="results-footer">
                        <p>
                            Showing {filteredTypes.length} of {vehicleTypes.length} vehicle types
                        </p>
                    </div>
                )}
            </main>

            {/* Modal */}
            {isFormModalOpen && (
                <VehicleTypeFormModal
                    vehicleType={selectedType}
                    isEditing={isEditing}
                    onClose={() => setIsFormModalOpen(false)}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
}
