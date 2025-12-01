import axiosInstance from "../config/axios";

export interface CampJobDto {
    jobName: string;
    jobGroup: string;
    triggerTime: string;
    status: string;
    lastRun: string | null;
    errorMessage: string | null;
    campId?: number;
    campName?: string;
}

export interface RunJobResponseDto {
    success: boolean;
    message: string;
}

const campJobService = {
    // Get all jobs for a specific camp
    getJobsByCampId: async (campId: number): Promise<CampJobDto[]> => {
        console.log(`[campJobService] GET /api/camp-jobs/${campId}`);
        const response = await axiosInstance.get(`/camp-jobs/${campId}`);
        return response.data as CampJobDto[];
    },

    // Get all jobs in the system
    getAllJobs: async (): Promise<CampJobDto[]> => {
        console.log("[campJobService] GET /api/camp-jobs/all");
        const response = await axiosInstance.get("/camp-jobs/all");
        return response.data as CampJobDto[];
    },

    // Run a job manually
    runJob: async (jobName: string): Promise<RunJobResponseDto> => {
        console.log(`[campJobService] POST /api/camp-jobs/run/${jobName}`);
        const response = await axiosInstance.post(`/camp-jobs/run/${jobName}`);
        return response.data as RunJobResponseDto;
    },

    // Delete jobs for a camp
    deleteJobs: async (campId: number): Promise<void> => {
        console.log(`[campJobService] DELETE /api/camp-jobs/${campId}`);
        await axiosInstance.delete(`/camp-jobs/${campId}`);
    },

    // Rebuild jobs for a camp
    rebuildJobs: async (campId: number): Promise<void> => {
        console.log(`[campJobService] POST /api/camp-jobs/rebuild/${campId}`);
        await axiosInstance.post(`/camp-jobs/rebuild/${campId}`);
    },
};

export default campJobService;
