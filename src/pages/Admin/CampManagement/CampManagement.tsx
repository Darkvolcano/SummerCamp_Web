import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Filter,
    RefreshCw,
} from "lucide-react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import CampFormModal from "./CampFormModal";
import CampDetailModal from "./CampDetailModal";
import campService, { type CampResponseDto } from "../../../services/campService";
import { message } from "antd";
import "./CampManagement.css";

export default function CampManagement() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [camps, setCamps] = useState<CampResponseDto[]>([]);
    const [filteredCamps, setFilteredCamps] = useState<CampResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedCamp, setSelectedCamp] = useState<CampResponseDto | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch camps
    const fetchCamps = async () => {
        try {
            setLoading(true);
            const data = await campService.getAllCamps();
            setCamps(data);
            setFilteredCamps(data);
            message.success("Camps loaded successfully");
        } catch (error: any) {
            console.error("Error fetching camps:", error);
            message.error(error.response?.data?.message || "Failed to load camps");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCamps();
    }, []);

    // Search and filter
    useEffect(() => {
        let result = camps;

        // Search filter
        if (searchTerm) {
            result = result.filter(
                (camp) =>
                    camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    camp.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    camp.address.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter(
                (camp) => camp.status.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        setFilteredCamps(result);
    }, [searchTerm, statusFilter, camps]);

    // Handle create
    const handleCreate = () => {
        setSelectedCamp(null);
        setIsEditing(false);
        setIsFormModalOpen(true);
    };

    // Handle edit
    const handleEdit = (camp: CampResponseDto) => {
        setSelectedCamp(camp);
        setIsEditing(true);
        setIsFormModalOpen(true);
    };

    // Handle view
    const handleView = (camp: CampResponseDto) => {
        setSelectedCamp(camp);
        setIsDetailModalOpen(true);
    };

    // Handle delete
    const handleDelete = async (camp: CampResponseDto) => {
        if (
            !window.confirm(
                `Are you sure you want to delete "${camp.name}"? This action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            await campService.deleteCamp(camp.campId);
            message.success("Camp deleted successfully");
            fetchCamps();
        } catch (error: any) {
            console.error("Error deleting camp:", error);
            message.error(error.response?.data?.message || "Failed to delete camp");
        }
    };

    // Handle form submit
    const handleFormSuccess = () => {
        fetchCamps();
        setIsFormModalOpen(false);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Format currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        const statusClass = status.toLowerCase();
        return <span className={`status-badge ${statusClass}`}>{status}</span>;
    };

    return (
        <div className="camp-management-container">
            <AdminSidebar
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />

            <main className={`camp-management-main ${isCollapsed ? "sidebar-collapsed" : ""}`}>
                {/* Header */}
                <div className="camp-management-header">
                    <div className="header-left">
                        <h1 className="page-title">Camps Management</h1>
                        <p className="page-subtitle">
                            Manage all summer camp programs and activities
                        </p>
                    </div>
                    <button className="btn-create" onClick={handleCreate}>
                        <Plus size={20} />
                        <span>Create New Camp</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <Users size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Total Camps</p>
                            <h3 className="stat-value">{camps.length}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon active">
                            <Calendar size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Active Camps</p>
                            <h3 className="stat-value">
                                {camps.filter((c) => c.status.toLowerCase() === "active").length}
                            </h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon pending">
                            <MapPin size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Locations</p>
                            <h3 className="stat-value">
                                {new Set(camps.map((c) => c.place)).size}
                            </h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon revenue">
                            <DollarSign size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Avg. Price</p>
                            <h3 className="stat-value">
                                {camps.length > 0
                                    ? formatPrice(
                                        camps.reduce((sum, c) => sum + c.price, 0) / camps.length
                                    )
                                    : "$0"}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search camps by name, place, or address..."
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
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <button className="btn-refresh" onClick={fetchCamps} disabled={loading}>
                        <RefreshCw size={18} className={loading ? "spinning" : ""} />
                    </button>
                </div>

                {/* Table */}
                <div className="table-container">
                    {loading ? (
                        <div className="loading-state">
                            <RefreshCw size={48} className="spinning" />
                            <p>Loading camps...</p>
                        </div>
                    ) : filteredCamps.length === 0 ? (
                        <div className="empty-state">
                            <Users size={64} />
                            <h3>No camps found</h3>
                            <p>
                                {searchTerm || statusFilter !== "all"
                                    ? "Try adjusting your filters"
                                    : "Create your first camp to get started"}
                            </p>
                            {!searchTerm && statusFilter === "all" && (
                                <button className="btn-create" onClick={handleCreate}>
                                    <Plus size={20} />
                                    Create Camp
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="camps-table">
                            <thead>
                                <tr>
                                    <th>Camp Name</th>
                                    <th>Place</th>
                                    <th>Dates</th>
                                    <th>Participants</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCamps.map((camp) => (
                                    <tr key={camp.campId}>
                                        <td>
                                            <div className="camp-name-cell">
                                                {camp.image && (
                                                    <img
                                                        src={camp.image}
                                                        alt={camp.name}
                                                        className="camp-thumbnail"
                                                    />
                                                )}
                                                <div>
                                                    <p className="camp-name">{camp.name}</p>
                                                    <p className="camp-address">{camp.address}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="place-cell">
                                                <MapPin size={16} />
                                                {camp.place}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="dates-cell">
                                                <Calendar size={16} />
                                                <div>
                                                    <p>{formatDate(camp.startDate)}</p>
                                                    <p className="date-separator">to</p>
                                                    <p>{formatDate(camp.endDate)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="participants-cell">
                                                <Users size={16} />
                                                {camp.minParticipants} - {camp.maxParticipants}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="price-cell">{formatPrice(camp.price)}</span>
                                        </td>
                                        <td>{getStatusBadge(camp.status)}</td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="action-btn view"
                                                    onClick={() => handleView(camp)}
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => handleEdit(camp)}
                                                    title="Edit Camp"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDelete(camp)}
                                                    title="Delete Camp"
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
                {!loading && filteredCamps.length > 0 && (
                    <div className="results-footer">
                        <p>
                            Showing {filteredCamps.length} of {camps.length} camps
                        </p>
                    </div>
                )}
            </main>

            {/* Modals */}
            {isFormModalOpen && (
                <CampFormModal
                    camp={selectedCamp}
                    isEditing={isEditing}
                    onClose={() => setIsFormModalOpen(false)}
                    onSuccess={handleFormSuccess}
                />
            )}

            {isDetailModalOpen && selectedCamp && (
                <CampDetailModal
                    camp={selectedCamp}
                    onClose={() => setIsDetailModalOpen(false)}
                    onEdit={() => {
                        setIsDetailModalOpen(false);
                        handleEdit(selectedCamp);
                    }}
                    onDelete={() => {
                        setIsDetailModalOpen(false);
                        handleDelete(selectedCamp);
                    }}
                />
            )}
        </div>
    );
}
