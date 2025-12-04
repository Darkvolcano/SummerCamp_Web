import React, { useEffect, useState, useCallback } from 'react';
import { Spin, Modal, Form, Input, InputNumber, Select } from 'antd';
import { Search, Plus, Edit2, Clock, Eye, MapPin, Trash2 } from 'lucide-react';
import { useManagerContext } from '../../../hooks/useManagerContext';
import { useNotification } from '../../../contexts/NotificationContext';
import routeService, { type RouteResponseDto, type RouteRequestDto, type RouteStopResponseDto } from '../../../services/routeService';
import locationService, { type LocationResponseDto } from '../../../services/LocationService';
import DeletePopover from '../../../components/DeletePopover';
import RouteMapViewer, { type RouteStopItem } from '../../../components/common/RouteMapViewer';

const { Option } = Select;

const ROUTE_TYPES = ['PickUp', 'DropOff'];

const RouteTab: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastSuccess, toastError } = useNotification();

  const [routes, setRoutes] = useState<RouteResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteResponseDto | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

  // Multi-step route creation states
  const [creationStep, setCreationStep] = useState<'info' | 'stops'>('info');
  const [newRouteStops, setNewRouteStops] = useState<RouteStopItem[]>([]);
  const [routeFormValues, setRouteFormValues] = useState<{
    routeName: string;
    routeType: string;
    estimateDuration: number;
  } | null>(null);

  // Detail modal states
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [detailRoute, setDetailRoute] = useState<RouteResponseDto | null>(null);
  const [routeStops, setRouteStops] = useState<RouteStopResponseDto[]>([]);
  const [locations, setLocations] = useState<LocationResponseDto[]>([]);
  const [loadingStops, setLoadingStops] = useState(false);
  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [detailForm] = Form.useForm();

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const allRoutes = await routeService.getAllRoutes();
      const campRoutes = allRoutes.filter(route => route.campId === selectedCampId);
      setRoutes(campRoutes);
      calculateTypeCounts(campRoutes);
    } catch (error) {
      console.error('Failed to load routes:', error);
      toastError('Error', 'Unable to load routes');
    } finally {
      setLoading(false);
    }
  }, [selectedCampId, toastError]);

  useEffect(() => {
    if (!selectedCampId) {
      setRoutes([]);
      return;
    }

    fetchRoutes();
  }, [selectedCampId, fetchRoutes]);

  const calculateTypeCounts = (data: RouteResponseDto[]) => {
    const counts: Record<string, number> = {};
    data.forEach((route) => {
      counts[route.routeType] = (counts[route.routeType] || 0) + 1;
    });
    setTypeCounts(counts);
  };

  const filteredRoutes = routes.filter((route) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!route.routeName.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (selectedTypes.length > 0 && !selectedTypes.includes(route.routeType)) {
      return false;
    }
    return true;
  });

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleAllTypeToggle = () => {
    setSelectedTypes([]);
  };

  const isAllSelected = selectedTypes.length === 0;

  const handleAddRoute = () => {
    setEditingRoute(null);
    form.resetFields();
    setIsModalVisible(true);
    // Load pickup points for route creation
    loadPickupPoints();
  };

  const loadPickupPoints = async () => {
    try {
      const pickupPoints = await locationService.getLocationsByType('Pickup_point');
      console.log('[RouteTab] Loaded pickup points:', pickupPoints.length, pickupPoints);
      setLocations(pickupPoints);
    } catch (error) {
      console.error('Failed to load pickup points:', error);
    }
  };

  const handleLocationCreated = (newLocation: LocationResponseDto) => {
    console.log('[RouteTab] New location created, adding to availableLocations:', newLocation);
    setLocations(prev => [...prev, newLocation]);
  };

  const handleDetailClick = async (route: RouteResponseDto) => {
    try {
      setDetailRoute(route);
      setLoadingStops(true);
      setIsDetailModalVisible(true);
      setIsEditingInDetail(false);

      // Initialize form with route data
      detailForm.setFieldsValue({
        routeName: route.routeName,
        routeType: route.routeType,
        estimateDuration: route.estimateDuration,
      });

      // Fetch route stops
      const stops = await routeService.getRouteStopsByRouteId(route.routeId);
      setRouteStops(stops);

      // Fetch all locations for the dropdown
      const allLocations = await locationService.getAllLocations();
      setLocations(allLocations);
    } catch (error) {
      console.error('Failed to load route details:', error);
      toastError('Error', 'Failed to load route details');
    } finally {
      setLoadingStops(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const values = await detailForm.validateFields();
      setSubmitting(true);

      const requestData: RouteRequestDto = {
        campId: selectedCampId!,
        routeName: values.routeName,
        routeType: values.routeType,
        estimateDuration: values.estimateDuration,
      };

      await routeService.updateRoute(detailRoute!.routeId, requestData);
      toastSuccess('Success', 'Route updated successfully');
      
      // Update detailRoute state
      setDetailRoute({
        ...detailRoute!,
        ...requestData,
      });
      
      setIsEditingInDetail(false);
      fetchRoutes();
    } catch (error) {
      console.error('Failed to save route:', error);
      toastError('Error', 'Failed to save route');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingRoute(null);
    setCreationStep('info');
    setNewRouteStops([]);
    setRouteFormValues(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const requestData: RouteRequestDto = {
        campId: selectedCampId!,
        routeName: values.routeName,
        routeType: values.routeType,
        estimateDuration: values.estimateDuration,
      };

      if (editingRoute) {
        // Edit mode - update directly
        setSubmitting(true);
        await routeService.updateRoute(editingRoute.routeId, requestData);
        toastSuccess('Success', 'Route updated successfully');
        setIsModalVisible(false);
        form.resetFields();
        setEditingRoute(null);
        fetchRoutes();
        setSubmitting(false);
      } else {
        // Creation mode - save values and go to stops configuration
        setRouteFormValues(values);
        setCreationStep('stops');
      }
    } catch (error) {
      console.error('Failed to save route:', error);
      toastError('Error', 'Failed to save route');
      setSubmitting(false);
    }
  };

  const handleCreateRouteWithStops = async () => {
    try {
      setSubmitting(true);
      
      // Use saved form values
      if (!routeFormValues) {
        toastError('Error', 'Route information is missing');
        return;
      }

      // Step 1: Create the route
      const routeData: RouteRequestDto = {
        campId: selectedCampId!,
        routeName: routeFormValues.routeName,
        routeType: routeFormValues.routeType,
        estimateDuration: routeFormValues.estimateDuration,
      };

      console.log('[RouteTab] Creating route with data:', routeData);
      const createdRoute = await routeService.createRoute(routeData);

      // Step 2: Create route stops
      if (newRouteStops.length > 0) {
        await Promise.all(
          newRouteStops.map((stop) =>
            routeService.createRouteStop({
              routeId: createdRoute.routeId,
              locationId: stop.locationId!,
              stopOrder: stop.stopOrder,
              estimatedTime: stop.estimatedTime,
            })
          )
        );
      }

      toastSuccess('Success', `Route created with ${newRouteStops.length} stops`);
      setIsModalVisible(false);
      form.resetFields();
      setCreationStep('info');
      setNewRouteStops([]);
      setRouteFormValues(null);
      fetchRoutes();
    } catch (error: any) {
      console.error('Failed to create route with stops:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create route';
      toastError('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoute = async (routeId: number) => {
    try {
      await routeService.deleteRoute(routeId);
      toastSuccess('Success', 'Route deleted successfully');
      setDeletePopoverOpen(null);
      fetchRoutes();
    } catch (error) {
      console.error('Failed to delete route:', error);
      toastError('Error', 'Failed to delete route');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sticky top-6">
          <h3 className="text-lg font-bold text-[#111827] mb-4">Search</h3>

          <div className="mb-6">
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

          <div className="mb-6">
            <p className="text-xs font-medium text-[#6B7280] mb-3">Route Type</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleAllTypeToggle}
                  className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
                />
                <span className="text-sm text-[#374151] group-hover:text-[#111827] font-medium">
                  All
                </span>
                <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full ml-auto">
                  {routes.length}
                </span>
              </label>

              {ROUTE_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
                  />
                  <span className="text-sm text-[#374151] group-hover:text-[#111827]">
                    {type}
                  </span>
                  <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full ml-auto">
                    {typeCounts[type] || 0}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddRoute}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
          >
            <Plus size={16} />
            Add Route
          </button>

        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="text-lg font-bold text-[#111827]">
              Found: {filteredRoutes.length}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Route Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Duration
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
                {filteredRoutes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-[#6B7280]"
                    >
                      No routes found
                    </td>
                  </tr>
                ) : (
                  filteredRoutes.map((route, index) => (
                    <tr
                      key={route.routeId}
                      className="hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                        {route.routeName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {route.routeType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-[#9CA3AF]" />
                          {route.estimateDuration} min
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          route.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {route.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDetailClick(route)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
                            title="View Details"
                          >
                            <Eye size={16} />
                            Detail
                          </button>
                          <DeletePopover
                            onConfirm={() => handleDeleteRoute(route.routeId)}
                            title="Delete Route"
                            message={`Are you sure you want to delete "${route.routeName}"?`}
                            disabled={submitting}
                            isOpen={deletePopoverOpen === route.routeId}
                            onOpenChange={(open) =>
                              setDeletePopoverOpen(open ? route.routeId : null)
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        title={
          <div className="text-lg font-bold text-[#111827]">
            {editingRoute ? 'Edit Route' : `Add New Route${creationStep === 'stops' ? ' - Configure Stops' : ''}`}
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={creationStep === 'stops' ? 900 : 600}
      >
        {creationStep === 'info' && (
          <Form
            form={form}
            layout="vertical"
            className="mt-4"
            onFinish={handleSubmit}
          >
            <Form.Item
              label={<span className="text-sm font-semibold text-[#374151]">Route Name</span>}
              name="routeName"
              rules={[{ required: true, message: 'Please enter route name' }]}
            >
              <Input 
                placeholder="Enter route name" 
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-semibold text-[#374151]">Route Type</span>}
              name="routeType"
              rules={[{ required: true, message: 'Please select route type' }]}
            >
              <Select placeholder="Select route type" className="rounded-lg">
                {ROUTE_TYPES.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-semibold text-[#374151]">Estimated Duration (minutes)</span>}
              name="estimateDuration"
              rules={[
                { required: true, message: 'Please enter estimated duration' },
                { type: 'number', min: 1, message: 'Duration must be at least 1 minute' },
              ]}
            >
              <InputNumber 
                placeholder="Enter duration in minutes" 
                className="w-full rounded-lg"
                min={1}
              />
            </Form.Item>

            <div className="flex gap-2 justify-end mt-6">
              <button
                type="button"
                onClick={handleModalCancel}
                className="px-4 py-2 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : editingRoute ? 'Update' : 'Next: Configure Stops'}
              </button>
            </div>
          </Form>
        )}

        {creationStep === 'stops' && (
          <div className="space-y-6 mt-4">
            {/* Route Stops List */}
            <div className="border border-[#E5E7EB] rounded-lg p-4">
              <h4 className="text-base font-bold text-[#111827] mb-3">
                Route Stops ({newRouteStops.length})
              </h4>
              {newRouteStops.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Click on the map below to add pickup points
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {newRouteStops.map((stop, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-[#F9FAFB] p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6366F1] text-white text-xs font-bold">
                          {stop.stopOrder}
                        </span>
                        <MapPin size={16} className="text-[#6B7280]" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#111827]">{stop.locationName}</p>
                          <p className="text-xs text-[#6B7280]">{stop.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center mr-2">
                          <InputNumber
                            value={stop.estimatedTime}
                            onChange={(val) => {
                              const updated = [...newRouteStops];
                              updated[index].estimatedTime = val || 5;
                              setNewRouteStops(updated);
                            }}
                            min={1}
                            size="small"
                            className="w-16 mr-1"
                          />
                          <span className="text-sm text-gray-500">min</span>
                        </div>
                        <button
                          onClick={() => {
                            const updated = newRouteStops
                              .filter((_, i) => i !== index)
                              .map((s, i) => ({ ...s, stopOrder: i + 1 }));
                            setNewRouteStops(updated);
                          }}
                          className="p-1.5 text-red-500 bg-[#f9c7c7] hover:bg-[#f9a6a6] rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map Editor */}
            <RouteMapViewer
              mode="edit"
              routeStops={newRouteStops}
              onStopsChange={setNewRouteStops}
              height="450px"
              enableSearch={true}
              enableCreate={true}
              availableLocations={locations}
              onLocationCreated={handleLocationCreated}
            />

            {/* Footer Buttons */}
            <div className="flex gap-2 justify-between">
              <button
                onClick={() => setCreationStep('info')}
                className="px-4 py-2 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-colors font-medium text-sm"
              >
                Back to Route Info
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleModalCancel}
                  className="px-4 py-2 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRouteWithStops}
                  disabled={submitting || newRouteStops.length === 0}
                  className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : `Create Route (${newRouteStops.length} stops)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="text-lg font-bold text-[#111827]">
            Route Details
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setDetailRoute(null);
          setRouteStops([]);
        }}
        footer={null}
        width={1200}
      >
        {detailRoute && (
          <div className="space-y-6">
            {/* Route Information */}
            <div className="bg-[#F9FAFB] rounded-lg p-4 space-y-3">
              {isEditingInDetail ? (
                <Form form={detailForm} layout="vertical">
                  <Form.Item
                    label={<span className="text-sm font-semibold text-[#374151]">Route Name</span>}
                    name="routeName"
                    rules={[{ required: true, message: 'Please enter route name' }]}
                  >
                    <Input placeholder="Enter route name" className="rounded-lg" />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-sm font-semibold text-[#374151]">Route Type</span>}
                    name="routeType"
                    rules={[{ required: true, message: 'Please select route type' }]}
                  >
                    <Select placeholder="Select route type" className="rounded-lg">
                      {ROUTE_TYPES.map((type) => (
                        <Option key={type} value={type}>
                          {type}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-sm font-semibold text-[#374151]">Estimated Duration (minutes)</span>}
                    name="estimateDuration"
                    rules={[
                      { required: true, message: 'Please enter estimated duration' },
                      { type: 'number', min: 1, message: 'Duration must be at least 1 minute' },
                    ]}
                  >
                    <InputNumber placeholder="Enter duration in minutes" className="w-full rounded-lg" min={1} />
                  </Form.Item>
                </Form>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#6B7280] mb-1">Route Name</p>
                    <p className="text-sm font-semibold text-[#111827]">{detailRoute.routeName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#6B7280] mb-1">Type</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {detailRoute.routeType}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#6B7280] mb-1">Duration</p>
                    <div className="flex items-center gap-1 text-sm text-[#374151]">
                      <Clock size={14} className="text-[#9CA3AF]" />
                      {detailRoute.estimateDuration} min
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#6B7280] mb-1">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      detailRoute.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {detailRoute.status}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
                {isEditingInDetail ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditingInDetail(false);
                        detailForm.setFieldsValue({
                          routeName: detailRoute.routeName,
                          routeType: detailRoute.routeType,
                          estimateDuration: detailRoute.estimateDuration,
                        });
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-colors font-medium text-sm"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors font-medium text-sm disabled:opacity-50"
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingInDetail(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors font-medium text-sm"
                  >
                    <Edit2 size={16} />
                    Edit Route
                  </button>
                )}
              </div>
            </div>

            {/* Route Stops */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#111827]">Route Stops</h3>
              </div>

              {loadingStops ? (
                <div className="flex justify-center py-8">
                  <Spin />
                </div>
              ) : routeStops.length === 0 ? (
                <div className="text-center py-8 text-[#6B7280] bg-[#F9FAFB] rounded-lg">
                  <MapPin size={32} className="mx-auto mb-2 text-[#9CA3AF]" />
                  <p>No stops configured for this route</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Route Stops Table */}
                  <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                            Order
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {routeStops
                          .sort((a, b) => a.stopOrder - b.stopOrder)
                          .map((stop) => {
                            return (
                              <tr key={stop.routeStopId} className="hover:bg-[#F9FAFB]">
                                <td className="px-4 py-3 text-sm font-mono text-[#6B7280]">
                                  {stop.stopOrder}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm font-medium text-[#374151]">
                                    {stop.location?.name || `Location #${stop.location?.id || 'N/A'}`}
                                  </div>
                                  <div className="text-xs text-[#9CA3AF] truncate">
                                    {stop.location?.address || 'No address'}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-[#6B7280]">
                                  <div className="flex items-center gap-1">
                                    <Clock size={14} className="text-[#9CA3AF]" />
                                    {stop.estimatedTime} min
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {/* Route Map */}
                  <div className="overflow-hidden">
                    <RouteMapViewer
                      mode="view"
                      routeStops={routeStops.map(stop => ({
                        locationId: stop.location?.id || null,
                        locationName: stop.location?.name || '',
                        address: stop.location?.address || '',
                        latitude: stop.location?.latitude || 0,
                        longitude: stop.location?.longitude || 0,
                        stopOrder: stop.stopOrder,
                        estimatedTime: stop.estimatedTime,
                      }))}
                      height="450px"
                      enableSearch={false}
                      enableCreate={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RouteTab;
