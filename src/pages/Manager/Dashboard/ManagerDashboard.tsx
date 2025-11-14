import React, { useEffect, useState } from "react";
import { Spin, Button } from "antd";
import { useManagerContext } from "../../../hooks/useManagerContext";
import campService, { type CampResponseDto } from "../../../services/campService";
import { useNotification } from "../../../contexts/NotificationContext";

const ManagerDashboard: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastSuccess, toastError } = useNotification();
  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedCampId) {
      setCamp(null);
      return;
    }

    const fetchCamp = async () => {
      try {
        setLoading(true);
        const data = await campService.getCampById(selectedCampId);
        setCamp(data);
      } catch (error) {
        console.error("Failed to load camp:", error);
        toastError("Error", "Unable to load camp details");
      } finally {
        setLoading(false);
      }
    };

    fetchCamp();
  }, [selectedCampId, toastError]);

  const handleSubmitForApproval = async () => {
    if (!camp) return;

    try {
      setLoading(true);
      // Submit camp for approval
      const updatedCamp = await campService.submitCampForApproval(camp.campId);
      toastSuccess("Success", "Camp submitted for approval");
      setCamp(updatedCamp);
    } catch (error) {
      console.error("Failed to submit camp:", error);
      toastError("Error", "Failed to submit camp for approval");
    } finally {
      setLoading(false);
    }
  };

  // If no camp selected
  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Select Camp</h3>
          <p className="text-indigo-700 text-base leading-relaxed">
            Please select a camp from the left sidebar to view the dashboard
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  // Draft status message
  if (camp && (camp.status === "DRAFT" || camp.status === "Draft")) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Camp Not Published Yet
            </h3>
            <p className="text-blue-700 mb-6 text-lg">
              Your camp is still in Draft status. Please complete the camp setup
              to publish it for registrations.
            </p>
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-blue-900 mb-3">
                Required Setup Steps:
              </h4>
              <ul className="text-left text-blue-800 space-y-2 list-disc list-inside">
                <li>Staff assignments</li>
                <li>Groups</li>
                <li>Location and accommodation setup</li>
                <li>Schedule and activities</li>
              </ul>
            </div>
            <Button
              type="primary"
              size="large"
              onClick={handleSubmitForApproval}
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-2 h-auto text-base"
            >
              Submit for Approval
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Camp details view
  if (camp) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camp Header */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#111827] mb-2">
                    {camp.name}
                  </h1>
                  <p className="text-[#6B7280] mb-4">{camp.description}</p>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      {camp.status}
                    </span>
                    <span className="text-[#6B7280] text-sm">
                      Location: {camp.location?.name || "N/A"}
                    </span>
                  </div>
                </div>
                {camp.image && (
                  <img
                    src={camp.image}
                    alt={camp.name}
                    className="w-48 h-48 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Camp Info Cards */}
          <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
            <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
              Duration
            </h3>
            <p className="text-2xl font-bold text-[#111827] mb-1">
              {new Date(camp.startDate).toLocaleDateString()}
            </p>
            <p className="text-[#6B7280] text-sm">
              to {new Date(camp.endDate).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
            <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
              Price
            </h3>
            <p className="text-2xl font-bold text-[#111827]">
              ${camp.price.toFixed(2)}
            </p>
            <p className="text-[#6B7280] text-sm mt-1">Per participant</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
            <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
              Participants
            </h3>
            <p className="text-2xl font-bold text-[#111827]">
              {camp.minParticipants} - {camp.maxParticipants}
            </p>
            <p className="text-[#6B7280] text-sm mt-1">Min - Max</p>
          </div>

          {/* Details */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
            <h3 className="text-lg font-bold text-[#111827] mb-4">
              Camp Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                  Age Range
                </p>
                <p className="text-[#111827] font-medium">
                  {camp.minAge} - {camp.maxAge} years
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                  Camp Type
                </p>
                <p className="text-[#111827] font-medium">
                  {camp.campType?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                  Location
                </p>
                <p className="text-[#111827] font-medium">
                  {camp.location?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                  Registration Opens
                </p>
                <p className="text-[#111827] font-medium">
                  {new Date(camp.registrationStartDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                  Registration Closes
                </p>
                <p className="text-[#111827] font-medium">
                  {new Date(camp.registrationEndDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                  Promotion
                </p>
                <p className="text-[#111827] font-medium">
                  {camp.promotion?.name || "None"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ManagerDashboard;
