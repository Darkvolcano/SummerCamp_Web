import React, { useState, useEffect } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Spin } from "antd";
import transactionService, {
    type TransactionResponseDto,
} from "../../../services/transactionService";
import { useNotification } from "../../../contexts/NotificationContext";

const TransactionPage: React.FC = () => {
    const { toastError } = useNotification();
    const [transactions, setTransactions] = useState<TransactionResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await transactionService.getAllTransactions();
            setTransactions(data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toastError("Error", "Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const sortedTransactions = [...transactions].sort((a, b) => {
        const dateA = new Date(a.transactionTime).getTime();
        const dateB = new Date(b.transactionTime).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    // Pagination calculations
    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        setCurrentPage(1); // Reset to first page when sorting changes
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setCurrentPage(1); // Reset to first page when items per page changes
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "success":
            case "completed":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            case "failed":
            case "cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case "payment":
                return "bg-blue-100 text-blue-700";
            case "refund":
                return "bg-purple-100 text-purple-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-6">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-[#111827]">Transactions</h1>
                <p className="text-xs text-[#6B7280] mt-0.5">
                    View all payment transactions across the system
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <Spin size="large" />
                </div>
            ) : transactions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 text-center">
                    <p className="text-[#6B7280] text-lg mb-4">No transactions found</p>
                </div>
            ) : (
                <>
                    {/* Main Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Left Sidebar - Stats */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sticky top-6">
                                <h3 className="text-lg font-bold text-[#111827] mb-4">Statistics</h3>

                                {/* Sort Control */}
                                <div className="mb-6">
                                    <label className="block text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wider">
                                        Sort by Time
                                    </label>
                                    <button
                                        onClick={toggleSortOrder}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
                                    >
                                        <ArrowUpDown size={16} />
                                        {sortOrder === "asc" ? "Oldest First" : "Newest First"}
                                    </button>
                                </div>

                                {/* Summary Stats */}
                                <div className="pt-6 border-t border-[#E5E7EB]">
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs text-[#6B7280]">Total: </span>
                                            <span className="text-lg font-bold text-[#111827]">
                                                {transactions.length}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-[#6B7280]">Success: </span>
                                            <span className="text-lg font-bold text-[#10B981]">
                                                {
                                                    transactions.filter((t) =>
                                                        ["success", "completed"].includes(t.status.toLowerCase())
                                                    ).length
                                                }
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-[#6B7280]">Pending: </span>
                                            <span className="text-lg font-bold text-[#F59E0B]">
                                                {
                                                    transactions.filter((t) =>
                                                        t.status.toLowerCase() === "pending"
                                                    ).length
                                                }
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-[#6B7280]">Failed: </span>
                                            <span className="text-lg font-bold text-[#EF4444]">
                                                {
                                                    transactions.filter((t) =>
                                                        ["failed", "cancelled"].includes(t.status.toLowerCase())
                                                    ).length
                                                }
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
                                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-[#111827]">
                                        Total: {sortedTransactions.length}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-[#6B7280]">Show:</span>
                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                            className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                        <span className="text-sm text-[#6B7280]">per page</span>
                                    </div>
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
                                                    Code
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                                    Camp Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                                    User ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                                    Method
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                                    Time
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E5E7EB]">
                                            {paginatedTransactions.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={9}
                                                        className="px-6 py-12 text-center text-[#6B7280]"
                                                    >
                                                        No transactions found
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedTransactions.map((transaction) => (
                                                    <tr
                                                        key={transaction.transactionId}
                                                        className="hover:bg-[#F9FAFB] transition-colors"
                                                    >
                                                        <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                                                            #{transaction.transactionId}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-mono text-[#111827]">
                                                            {transaction.transactionCode}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-[#111827]">
                                                            <span className="line-clamp-2">
                                                                {transaction.campName}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                                                            #{transaction.userId}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                                                            {formatAmount(transaction.amount)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                                                                    transaction.type
                                                                )}`}
                                                            >
                                                                {transaction.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-[#6B7280]">
                                                            {transaction.method}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                                    transaction.status
                                                                )}`}
                                                            >
                                                                {transaction.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-[#6B7280] whitespace-nowrap">
                                                            {formatDate(transaction.transactionTime)}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
                                        <div className="text-sm text-[#6B7280]">
                                            Showing {startIndex + 1} to {Math.min(endIndex, sortedTransactions.length)} of {sortedTransactions.length} transactions
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="inline-flex items-center gap-1 px-3 py-2 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft size={16} />
                                                Previous
                                            </button>

                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                    .filter(page => {
                                                        // Show first page, last page, current page, and pages around current
                                                        if (page === 1 || page === totalPages) return true;
                                                        if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                                                        return false;
                                                    })
                                                    .map((page, index, array) => {
                                                        // Add ellipsis if there's a gap
                                                        const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;

                                                        return (
                                                            <React.Fragment key={page}>
                                                                {showEllipsisBefore && (
                                                                    <span className="px-2 text-[#6B7280]">...</span>
                                                                )}
                                                                <button
                                                                    onClick={() => handlePageChange(page)}
                                                                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${currentPage === page
                                                                            ? "bg-[#6366F1] text-white"
                                                                            : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                                                                        }`}
                                                                >
                                                                    {page}
                                                                </button>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                            </div>

                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="inline-flex items-center gap-1 px-3 py-2 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TransactionPage;
