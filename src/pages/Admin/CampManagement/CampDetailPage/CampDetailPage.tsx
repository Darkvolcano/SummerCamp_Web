import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import CampDetailNavbar from './CampDetailNavbar';
import CampDetailOverview from './CampDetailOverview';
import CampDetailSchedule from './CampDetailSchedule';
import CampDetailStaffAssignment from './CampDetailStaffAssignment';
import CampDetailGroup from './CampDetailGroup';
import CampDetailAccommodation from './CampDetailAccommodation';
import CampDetailDashboard from './CampDetailDashboard';
import CampDetailJobs from './CampDetailJobs';
import campService from '../../../../services/campService';

const CampDetailPage: React.FC = () => {
  const { campId } = useParams<{ campId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [campName, setCampName] = useState('Loading...');
  const [campStatus, setCampStatus] = useState('DRAFT');
  const [isLoading, setIsLoading] = useState(true);

  const numericCampId = parseInt(campId || '0', 10);

  // Fetch camp name
  useEffect(() => {
    if (numericCampId > 0) {
      fetchCampName();
    }
  }, [numericCampId]);

  const fetchCampName = async () => {
    try {
      setIsLoading(true);
      const camp = await campService.getCampById(numericCampId);
      setCampName(camp.name);
      setCampStatus(camp.status);
    } catch (error) {
      console.error('Error fetching camp:', error);
      setCampName('Camp Not Found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleUpdate = () => {
    fetchCampName();
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <CampDetailOverview
            campId={numericCampId}
            onBack={handleBack}
            onUpdate={handleUpdate}
          />
        );
      case 'schedule':
        return <CampDetailSchedule campId={numericCampId} campStatus={campStatus} />;
      case 'staff':
        return <CampDetailStaffAssignment campId={numericCampId} />;
      case 'group':
        return <CampDetailGroup campId={numericCampId} campStatus={campStatus} />;
      case 'accommodation':
        return <CampDetailAccommodation campId={numericCampId} campStatus={campStatus} />;
      case 'dashboard':
        return <CampDetailDashboard campId={numericCampId} campStatus={campStatus} />;
      case 'jobs':
        return <CampDetailJobs campId={numericCampId} />;
      default:
        return <CampDetailOverview campId={numericCampId} onBack={handleBack} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Loading camp..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#111827]">{campName}</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage camp details and information</p>
        </div>

        {/* Tab Navigation */}
        <CampDetailNavbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={handleBack}
        />

        {/* Tab Content */}
        {renderTab()}
      </div>
    </div>
  );
};

export default CampDetailPage;
