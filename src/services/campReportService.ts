import axiosInstance from "../config/axios";

// ==================== RESPONSE DTOs ====================

export interface ExportReportResponseDto {
  downloadUrl: string;
  fileName: string;
  fileSize?: number;
  expiresAt?: string;
}

// ==================== SERVICE ====================

const campReportService = {
  /**
   * GET /api/camp-reports/{campId}/export/excel
   * Export camp performance report to Excel format
   * @param campId - The camp ID
   * @returns Download URL for the Excel file
   */
  exportToExcel: async (campId: number): Promise<ExportReportResponseDto | Blob> => {
    console.log(`[campReportService] GET /camp-reports/${campId}/export/excel`);
    
    try {
      const response = await axiosInstance.get(
        `/camp-reports/${campId}/export/excel`,
        {
          responseType: 'blob', // Handle binary file response
        }
      );

      // If response is JSON with download URL
      if (response.headers['content-type']?.includes('application/json')) {
        return response.data as ExportReportResponseDto;
      }

      // If response is direct file blob
      return response.data as Blob;
    } catch (error) {
      console.error(`[campReportService] Error exporting to Excel:`, error);
      throw error;
    }
  },

  /**
   * GET /api/camp-reports/{campId}/export/pdf
   * Export camp performance report to PDF format
   * @param campId - The camp ID
   * @returns Download URL for the PDF file
   */
  exportToPdf: async (campId: number): Promise<ExportReportResponseDto | Blob> => {
    console.log(`[campReportService] GET /camp-reports/${campId}/export/pdf`);
    
    try {
      const response = await axiosInstance.get(
        `/camp-reports/${campId}/export/pdf`,
        {
          responseType: 'blob', // Handle binary file response
        }
      );

      // If response is JSON with download URL
      if (response.headers['content-type']?.includes('application/json')) {
        return response.data as ExportReportResponseDto;
      }

      // If response is direct file blob
      return response.data as Blob;
    } catch (error) {
      console.error(`[campReportService] Error exporting to PDF:`, error);
      throw error;
    }
  },

  /**
   * Helper function to trigger file download from blob
   * @param blob - The file blob
   * @param filename - The filename for download
   */
  downloadFile: (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Helper function to download file from URL
   * @param downloadUrl - The download URL
   * @param filename - The filename for download
   */
  downloadFromUrl: async (downloadUrl: string, filename: string): Promise<void> => {
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      campReportService.downloadFile(blob, filename);
    } catch (error) {
      console.error(`[campReportService] Error downloading file:`, error);
      throw error;
    }
  },
};

export default campReportService;
