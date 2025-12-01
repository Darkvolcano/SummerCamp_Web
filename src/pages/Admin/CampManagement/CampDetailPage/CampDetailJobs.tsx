import React, { useState, useEffect } from "react";
import { Spin, Modal } from "antd";
import { RefreshCw, Play, Trash2, Wrench, AlertCircle } from "lucide-react";
import campJobService, { type CampJobDto } from "../../../../services/campJobService";
import { useNotification } from "../../../../contexts/NotificationContext";

interface CampDetailJobsProps {
    campId: number;
}

const CampDetailJobs: React.FC<CampDetailJobsProps> = ({ campId }) => {
    const { toastSuccess, toastError } = useNotification();
    const [jobs, setJobs] = useState<CampJobDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await campJobService.getJobsByCampId(campId);
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
            toastError("Error", "Failed to load scheduled jobs");
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [campId]);

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

    const handleDeleteJobs = () => {
        Modal.confirm({
            title: "Delete All Jobs for This Camp",
            content: "Are you sure you want to delete all scheduled jobs for this camp? This action cannot be undone.",
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    setActionLoading("delete-all");
                    await campJobService.deleteJobs(campId);
                    toastSuccess("Success", "All jobs deleted successfully");
                    await fetchJobs();
                } catch (error) {
                    console.error("Error deleting jobs:", error);
                    toastError("Error", "Failed to delete jobs");
                } finally {
                    setActionLoading(null);
                }
            },
        });
    };

    const handleRebuildJobs = () => {
        Modal.confirm({
            title: "Rebuild All Jobs for This Camp",
            content: "This will recreate all scheduled jobs for this camp. Existing jobs will be replaced.",
            okText: "Rebuild",
            okType: "primary",
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    setActionLoading("rebuild-all");
                    await campJobService.rebuildJobs(campId);
                    toastSuccess("Success", "Jobs rebuilt successfully");
                    await fetchJobs();
                } catch (error) {
                    console.error("Error rebuilding jobs:", error);
                    toastError("Error", "Failed to rebuild jobs");
                } finally {
                    setActionLoading(null);
                }
            },
        });
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-[#111827]">
                        Scheduled Jobs
                    </h2>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                        Automated camp status update jobs
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchJobs}
                        disabled={!!actionLoading}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={actionLoading === "refresh" ? "animate-spin" : ""} />
                        Refresh
                    </button>
                    <button
                        onClick={handleRebuildJobs}
                        disabled={!!actionLoading}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm disabled:opacity-50"
                    >
                        <Wrench size={16} />
                        Rebuild All
                    </button>
                    <button
                        onClick={handleDeleteJobs}
                        disabled={!!actionLoading || jobs.length === 0}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-all font-medium text-sm disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        Delete All
                    </button>
                </div>
            </div>

            {/* Table */}
            {jobs.length === 0 ? (
                <div className="px-6 py-12 text-center">
                    <p className="text-[#6B7280] text-lg mb-2">No scheduled jobs found</p>
                    <p className="text-[#9CA3AF] text-sm">Click "Rebuild All" to create jobs for this camp</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                            <tr>
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
                                    Last Execution
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB]">
                            {jobs.map((job, index) => (
                                <React.Fragment key={index}>
                                    <tr className="hover:bg-[#F9FAFB] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-[#111827]">
                                                {job.jobName}
                                            </div>
                                            <div className="text-xs text-[#6B7280]">
                                                Group: {job.jobGroup}
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
                                                Run Now
                                            </button>
                                        </td>
                                    </tr>
                                    {job.errorMessage && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-2 bg-red-50">
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
    );
};

export default CampDetailJobs;
