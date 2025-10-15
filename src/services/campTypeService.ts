import axiosInstance from "../config/axios";

export interface CampType {
    campTypeId: number;
    name: string;
    description: string;
    isActive: boolean;
}
const campTypeService = {

    // Camp types
    getAllCampTypes: async (): Promise<CampType[]> => {
        const response = await axiosInstance.get("/camptype");
        return response.data as CampType[];
    },

    getCampTypeById: async (id: number): Promise<CampType> => {
        const response = await axiosInstance.get(`/camptype/${id}`);
        return response.data as CampType;
    }
};

    export default campTypeService;
