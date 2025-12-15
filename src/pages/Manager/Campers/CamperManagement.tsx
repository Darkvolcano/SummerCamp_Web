import React, { useEffect, useState } from 'react';
import { Spin, message } from 'antd';
import { Search, Eye } from 'lucide-react';
import { useManagerContext } from '../../../hooks/useManagerContext';
import camperService, { type CamperCampResponseDto } from '../../../services/camperService';
import CamperDetailModal from '../../../components/CamperDetailModal';

const CamperManagement: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const [campers, setCampers] = useState<CamperCampResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  // Gender counts
  const [genderCounts, setGenderCounts] = useState<Record<string, number>>({});

  // Camper Detail Modal
  const [camperDetailModalOpen, setCamperDetailModalOpen] = useState(false);
  const [selectedCamperId, setSelectedCamperId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedCampId) {
      setCampers([]);
      return;
    }

    const fetchCampers = async () => {
      try {
        setLoading(true);
        const data = await camperService.getCampersByCampId(selectedCampId);
        setCampers(data);
        calculateGenderCounts(data);
      } catch (error) {
        console.error('Failed to load campers:', error);
        message.error('Unable to load campers');
      } finally {
        setLoading(false);
      }
    };

    fetchCampers();
  }, [selectedCampId]);

  const calculateGenderCounts = (data: CamperCampResponseDto[]) => {
    const counts: Record<string, number> = {};
    data.forEach((camper) => {
      counts[camper.gender] = (counts[camper.gender] || 0) + 1;
    });
    setGenderCounts(counts);
  };

  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Select Camp</h3>
          <p className="text-indigo-700 text-base leading-relaxed">Please select a camp from the left sidebar to view campers</p>
        </div>
      </div>
    );
  }

  // Filter campers
  const filteredCampers = campers.filter((camper) => {
    // Search filter (by name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!camper.camperName.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Gender filter
    if (selectedGenders.length > 0 && !selectedGenders.includes(camper.gender)) {
      return false;
    }

    return true;
  });

  // Handle gender checkbox
  const handleGenderToggle = (gender: string) => {
    setSelectedGenders((prev) =>
      prev.includes(gender)
        ? prev.filter((g) => g !== gender)
        : [...prev, gender]
    );
  };

  const handleAllGenderToggle = () => {
    setSelectedGenders([]);
  };

  const isAllSelected = selectedGenders.length === 0;

  // Get gender badge color
  const getGenderColor = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male':
        return 'bg-blue-100 text-blue-700';
      case 'female':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Calculate age
  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Campers</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          View and manage camp campers
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : campers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 text-center">
          <p className="text-[#6B7280] text-lg">No campers found for this camp</p>
        </div>
      ) : (
        <>
          {/* Filters and Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sticky top-6">
                <h3 className="text-lg font-bold text-[#111827] mb-4">Filters</h3>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wider">
                    Search
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="By name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-3 uppercase tracking-wider">
                    Gender
                  </label>
                  <div className="space-y-2">
                    {/* All checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleAllGenderToggle}
                        className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
                      />
                      <span className="text-sm text-[#374151] group-hover:text-[#111827] font-medium">
                        All
                      </span>
                      <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full ml-auto">
                        {campers.length}
                      </span>
                    </label>

                    {/* Individual gender checkboxes */}
                    {Object.keys(genderCounts).map((gender) => (
                      <label
                        key={gender}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGenders.includes(gender)}
                          onChange={() => handleGenderToggle(gender)}
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
                        />
                        <span className="text-sm text-[#374151] group-hover:text-[#111827]">
                          {gender}
                        </span>
                        <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full ml-auto">
                          {genderCounts[gender] || 0}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[#6B7280]">Total: </span>
                      <span className="text-lg font-bold text-[#111827]">
                        {campers.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#6B7280]">Male: </span>
                      <span className="text-lg font-bold text-blue-600">
                        {genderCounts['Male'] || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#6B7280]">Female: </span>
                      <span className="text-lg font-bold text-pink-600">
                        {genderCounts['Female'] || 0}
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
                    Found: {filteredCampers.length}
                  </h2>
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
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Gender
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Date of Birth
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Age
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredCampers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-12 text-center text-[#6B7280]"
                          >
                            No campers found matching your filters
                          </td>
                        </tr>
                      ) : (
                        filteredCampers.map((camper) => (
                          <tr
                            key={camper.camperId}
                            className="hover:bg-[#F9FAFB] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                              #{camper.camperId}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                              {camper.camperName}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGenderColor(
                                  camper.gender
                                )}`}
                              >
                                {camper.gender}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#374151]">
                              {formatDate(camper.dob)}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              {calculateAge(camper.dob)} years old
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                {camper.camperRegistrationStatus || 'Registered'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedCamperId(camper.camperId);
                                  setCamperDetailModalOpen(true);
                                }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
                                title="View Details"
                              >
                                <Eye size={16} />
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Camper Detail Modal */}
      {selectedCamperId && (
        <CamperDetailModal
          isOpen={camperDetailModalOpen}
          onClose={() => {
            setCamperDetailModalOpen(false);
            setSelectedCamperId(null);
          }}
          camperId={selectedCamperId}
          campId={selectedCampId}
        />
      )}
    </div>
  );
};

export default CamperManagement;
