import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import { RefreshCw, Play, AlertCircle, ArrowUpDown } from "lucide-react";
import campJobService, { type CampJobDto } from "../../../services/campJobService";
import { useNotification } from "../../../contexts/NotificationContext";

const CampJobManagement: React.FC = () => {
    const { toastSuccess, toastError } = useNotification();
    const [jobs, setJobs] = useState<CampJobDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await campJobService.getAllJobs();
            // Ensure data is an array
            if (Array.isArray(data)) {
                setJobs(data);
            } else if (data && typeof data === 'object') {
                // If data is an object, try to extract array from common property names
                const jobsArray = (data as any).jobs || (data as any).data || (data as any).items || [];
                setJobs(Array.isArray(jobsArray) ? jobsArray : []);
            } else {
                setJobs([]);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
            toastError("Error", "Failed to load jobs");
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleRunJob = async (jobName: string) => {
        try {
            setActionLoading(jobName);
            await campJobService.runJob(jobName);
            toastSuccess("Success", `Job "${jobName}" executed successfully`);
            await fetchJobs();
        } catch (error) {
            console.error("Error running job:", error);
            toastError("Error", `Failed to run job "${jobName}"`);
        } finally {
            setActionLoading(null);
        }
    };

    const sortedJobs = [...jobs].sort((a, b) => {
        const dateA = a.triggerTime ? new Date(a.triggerTime).getTime() : 0;
        const dateB = b.triggerTime ? new Date(b.triggerTime).getTime() : 0;
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "scheduled":
            case "awaiting":
                return "bg-blue-100 text-blue-700";
            case "processing":
            case "running":
                return "bg-yellow-100 text-yellow-700";
            case "succeeded":
            case "completed":
                return "bg-green-100 text-green-700";
            case "failed":
            case "error":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const statusCounts = {
        total: jobs.length,
        scheduled: jobs.filter((j) => ["scheduled", "awaiting"].includes(j.status.toLowerCase())).length,
        succeeded: jobs.filter((j) => ["succeeded", "completed"].includes(j.status.toLowerCase())).length,
        failed: jobs.filter((j) => ["failed", "error"].includes(j.status.toLowerCase())).length,
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-6">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-[#111827]">Camp Job Management</h1>
                <p className="text-xs text-[#6B7280] mt-0.5">
                    Monitor and manage all Hangfire scheduled jobs system-wide
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <Spin size="large" />
                </div>
            ) : (
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
                                    {sortOrder === "asc" ? "Earliest First" : "Latest First"}
                                </button>
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={fetchJobs}
                                disabled={!!actionLoading}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm mb-6 disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={actionLoading === "refresh" ? "animate-spin" : ""} />
                                Refresh
                            </button>

                            {/* Summary Stats */}
                            <div className="pt-6 border-t border-[#E5E7EB]">
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs text-[#6B7280]">Total Jobs: </span>
                                        <span className="text-lg font-bold text-[#111827]">
                                            {statusCounts.total}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-[#6B7280]">Scheduled: </span>
                                        <span className="text-lg font-bold text-[#3B82F6]">
                                            {statusCounts.scheduled}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-[#6B7280]">Succeeded: </span>
                                        <span className="text-lg font-bold text-[#10B981]">
                                            {statusCounts.succeeded}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-[#6B7280]">Failed: </span>
                                        <span className="text-lg font-bold text-[#EF4444]">
                                            {statusCounts.failed}
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
                                    All Jobs: {sortedJobs.length}
                                </h2>
                            </div>

                            {/* Table */}
                            {sortedJobs.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <p className="text-[#6B7280] text-lg">No jobs found in the system</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                                    Camp
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                                    Job Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                                    Scheduled Time
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                                    Last Run
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E5E7EB]">
                                            {sortedJobs.map((job, index) => (
                                                <React.Fragment key={index}>
                                                    <tr className="hover:bg-[#F9FAFB] transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-[#111827]">
                                                                {job.campName || "N/A"}
                                                            </div>
                                                            {job.campId && (
                                                                <div className="text-xs text-[#6B7280]">
                                                                    ID: {job.campId}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-[#111827]">
                                                                {job.jobName}
                                                            </div>
                                                            <div className="text-xs text-[#6B7280]">
                                                                {job.jobGroup}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-[#6B7280] whitespace-nowrap">
                                                            {formatDate(job.triggerTime)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                                    job.status
                                                                )}`}
                                                            >
                                                                {job.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-[#6B7280] whitespace-nowrap">
                                                            {formatDate(job.lastRun)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => handleRunJob(job.jobName)}
                                                                disabled={actionLoading === job.jobName}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-all font-medium text-sm disabled:opacity-50"
                                                            >
                                                                {actionLoading === job.jobName ? (
                                                                    <RefreshCw size={14} className="animate-spin" />
                                                                ) : (
                                                                    <Play size={14} />
                                                                )}
                                                                Run
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {job.errorMessage && (
                                                        <tr>
                                                            <td colSpan={6} className="px-6 py-2 bg-red-50">
                                                                <div className="flex items-start gap-2 text-sm text-red-700">
                                                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                                                    <div>
                                                                        <span className="font-semibold">Error: </span>
                                                                        {job.errorMessage}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampJobManagement;
