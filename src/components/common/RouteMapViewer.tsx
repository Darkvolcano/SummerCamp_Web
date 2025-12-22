import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { Input, Button, Form } from 'antd';
import { Search, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import locationService, { type LocationResponseDto } from '../../services/LocationService';
import { useNotification } from '../../contexts/NotificationContext';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface RouteStopItem {
  locationId: number | null;
  locationName: string;
  address: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  estimatedTime: number;
  isNew?: boolean;
}

interface RouteMapViewerProps {
  mode: 'view' | 'edit';
  routeStops: RouteStopItem[];
  onStopsChange?: (stops: RouteStopItem[]) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
  enableSearch?: boolean;
  enableCreate?: boolean;
  className?: string;
  availableLocations?: LocationResponseDto[];
  onLocationCreated?: (location: LocationResponseDto) => void;
}

// Map click handler component
const MapClickHandler: React.FC<{ onClick: (lat: number, lng: number) => void; enabled: boolean }> = ({ onClick, enabled }) => {
  useMapEvents({
    click: (e) => {
      if (enabled) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Map center updater component
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMapEvents({});
  
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  
  return null;
};

const RouteMapViewer: React.FC<RouteMapViewerProps> = ({
  mode,
  routeStops,
  onStopsChange,
  height = '500px',
  center = [10.8231, 106.6297],
  zoom = 13,
  enableSearch = mode === 'edit',
  enableCreate = mode === 'edit',
  className = '',
  availableLocations = [],
  onLocationCreated,
}) => {
  const { toastSuccess, toastError } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [newLocationCoords, setNewLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationForm] = Form.useForm();
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);

  // Create numbered marker icon
  const createNumberedIcon = (order: number) => {
    return L.divIcon({
      className: 'custom-numbered-icon',
      html: `<div style="background-color: #6366F1; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${order}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  // Handle search using Nominatim API
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&countrycodes=vn&format=json&limit=1`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        toastSuccess('Found', `Location found: ${results[0].display_name}`);
      } else {
        toastError('Not Found', 'Location not found in Vietnam');
      }
    } catch (error) {
      console.error('Search error:', error);
      toastError('Cảnh báo', 'Failed to search location');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle map click to create new location
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (mode !== 'edit' || !enableCreate) return;

    // Set temp marker position
    setNewLocationCoords({ lat, lng });
    
    // Try to get address via reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        // Auto-fill with geocoded data
        locationForm.setFieldsValue({
          locationName: data.name || data.address?.road || `Location ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          address: data.display_name,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        });
      } else {
        // Fallback: use coordinates
        locationForm.setFieldsValue({
          locationName: `Location ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          address: '',
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        });
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Fallback: use coordinates
      locationForm.setFieldsValue({
        locationName: `Location ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        address: '',
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      });
    }
  }, [mode, enableCreate, locationForm]);

  // Handle create new pickup point
  const handleCreateLocation = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    console.log('[RouteMapViewer] handleCreateLocation called');
    console.log('[RouteMapViewer] newLocationCoords:', newLocationCoords);
    
    try {
      const values = await locationForm.validateFields();
      console.log('[RouteMapViewer] Form values:', values);
      
      if (!newLocationCoords || !onStopsChange) {
        console.log('[RouteMapViewer] Missing coords or onStopsChange');
        return;
      }

      console.log('[RouteMapViewer] Creating location via API...');
      
      // Create location via API
      const newLocation = await locationService.createPickupPoint(
        values.locationName,
        values.address || `${newLocationCoords.lat.toFixed(4)}, ${newLocationCoords.lng.toFixed(4)}`,
        newLocationCoords.lat,
        newLocationCoords.lng
      );

      console.log('[RouteMapViewer] Location created:', newLocation);

      // Notify parent about new location
      if (onLocationCreated) {
        onLocationCreated(newLocation);
      }

      // Add to route stops
      const newStop: RouteStopItem = {
        locationId: newLocation.locationId,
        locationName: newLocation.name,
        address: newLocation.address || '',
        latitude: newLocation.latitude!,
        longitude: newLocation.longitude!,
        stopOrder: routeStops.length + 1,
        estimatedTime: 5,
        isNew: true,
      };

      console.log('[RouteMapViewer] Adding stop to route:', newStop);
      onStopsChange([...routeStops, newStop]);
      
      console.log('[RouteMapViewer] Showing success toast');
      toastSuccess('Success', `Created pickup point: ${newLocation.name}`);
      
      // Clear temp marker and form
      console.log('[RouteMapViewer] Clearing temp marker');
      setNewLocationCoords(null);
      locationForm.resetFields();
      
      console.log('[RouteMapViewer] handleCreateLocation completed successfully');
    } catch (error: any) {
      console.error('[RouteMapViewer] Error in handleCreateLocation:', error);
      
      if (error.errorFields) {
        console.log('[RouteMapViewer] Form validation error:', error.errorFields);
        return;
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to create location';
      toastError('Cảnh báo', errorMessage);
    }
  };

  // Cancel creating location
  const handleCancelCreateLocation = () => {
    console.log('[RouteMapViewer] handleCancelCreateLocation called');
    setNewLocationCoords(null);
    locationForm.resetFields();
    console.log('[RouteMapViewer] Temp marker cleared');
  };

  // Add existing location to route stops
  const handleAddExistingLocation = (location: LocationResponseDto) => {
    if (!onStopsChange || !location.latitude || !location.longitude) return;

    // Check if already added
    const alreadyAdded = routeStops.some(stop => stop.locationId === location.locationId);
    if (alreadyAdded) {
      toastError('Already Added', 'This location is already in route stops');
      return;
    }

    const newStop: RouteStopItem = {
      locationId: location.locationId,
      locationName: location.name,
      address: location.address || '',
      latitude: location.latitude,
      longitude: location.longitude,
      stopOrder: routeStops.length + 1,
      estimatedTime: 5,
      isNew: false,
    };

    onStopsChange([...routeStops, newStop]);
    toastSuccess('Added', `Added ${location.name} to route stops`);
  };


  // Remove stop from list
  const handleRemoveStop = (stop: RouteStopItem) => {
    if (!onStopsChange) return;

    const updatedStops = routeStops
      .filter((s) => s !== stop)
      .map((s, index) => ({ ...s, stopOrder: index + 1 }));
    
    onStopsChange(updatedStops);
  };

  // Clear all stops
  const clearAllStops = () => {
    if (!onStopsChange) return;
    onStopsChange([]);
  };

  // Reset map view
  const resetMapView = () => {
    setMapCenter(center);
  };

  // Auto-fit bounds in view mode
  useEffect(() => {
    if (mode === 'view' && routeStops.length > 0) {
      // Calculate bounds to fit all stops
      const latitudes = routeStops.map((s) => s.latitude);
      const longitudes = routeStops.map((s) => s.longitude);
      const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
      const centerLng = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
      setMapCenter([centerLat, centerLng]);
    }
  }, [mode, routeStops]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar - Only in Edit Mode */}
      {mode === 'edit' && enableSearch && (
        <div className="flex gap-2">
          <Input
            placeholder="Search address in Vietnam..."
            prefix={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPressEnter={handleSearch}
            className="flex-1"
          />
          <Button 
            type="primary" 
            onClick={handleSearch}
            loading={isSearching}
            className="bg-[#6366F1]"
          >
            Search
          </Button>
        </div>
      )}

      {/* Map Container */}
      <div style={{ height }} className="rounded-lg border border-gray-300 overflow-hidden">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapUpdater center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Available Pickup Points (only in edit mode) */}
          {mode === 'edit' && availableLocations.map((location) => {
            if (!location.latitude || !location.longitude) return null;
            
            // Don't show if already in route stops
            const isInRoute = routeStops.some(stop => stop.locationId === location.locationId);
            if (isInRoute) return null;

            return (
              <Marker
                key={`available-${location.locationId}`}
                position={[location.latitude, location.longitude]}
                icon={L.icon({
                  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                })}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-bold text-sm mb-1">{location.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{location.address}</p>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleAddExistingLocation(location)}
                      className="w-full bg-[#6366F1]"
                    >
                      Add to Route
                    </Button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Route Stops Markers */}
          {routeStops.map((stop, index) => (
            <Marker
              key={stop.locationId || index}
              position={[stop.latitude, stop.longitude]}
              icon={createNumberedIcon(stop.stopOrder)}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-bold text-sm mb-1">{stop.locationName}</h4>
                  <p className="text-xs text-gray-600 mb-1">{stop.address}</p>
                  <p className="text-xs text-gray-500">
                    <MapPin size={12} className="inline mr-1" />
                    Stop #{stop.stopOrder} • {stop.estimatedTime} min
                  </p>
                  {mode === 'edit' && (
                    <Button
                      danger
                      size="small"
                      onClick={() => handleRemoveStop(stop)}
                      className="mt-2 w-full"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Route Polyline */}
          {routeStops.length > 1 && (
            <Polyline
              positions={routeStops.map((s) => [s.latitude, s.longitude])}
              color="#6366F1"
              weight={3}
              opacity={0.7}
            />
          )}

          {/* Temporary Marker for Creating New Location */}
          {newLocationCoords && (
            <Marker
              position={[newLocationCoords.lat, newLocationCoords.lng]}
              icon={L.icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
              })}
            >
              <Popup closeButton={true}>
                <div className="p-2 min-w-[250px]">
                  <h4 className="font-bold text-sm mb-3">Create Pickup Point</h4>
                  <Form form={locationForm} layout="vertical" size="small">
                    <Form.Item
                      label="Location Name"
                      name="locationName"
                      rules={[{ required: true, message: 'Required' }]}
                      className="mb-2"
                    >
                      <Input placeholder="e.g., District 1 Center" size="small" />
                    </Form.Item>

                    <Form.Item label="Address" name="address" className="mb-2">
                      <Input.TextArea 
                        placeholder="Auto-filled or enter manually" 
                        rows={2}
                        size="small"
                      />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Form.Item label="Lat" name="latitude" className="mb-0">
                        <Input disabled size="small" />
                      </Form.Item>
                      <Form.Item label="Lng" name="longitude" className="mb-0">
                        <Input disabled size="small" />
                      </Form.Item>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        htmlType="button"
                        size="small" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCancelCreateLocation();
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        htmlType="button"
                        type="primary"
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCreateLocation(e);
                        }}
                        className="flex-1 bg-[#6366F1]"
                      >
                        Create
                      </Button>
                    </div>
                  </Form>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Map Click Handler - Only in Edit Mode */}
          <MapClickHandler onClick={handleMapClick} enabled={mode === 'edit' && enableCreate} />
        </MapContainer>
      </div>

      {/* Quick Actions - Only in Edit Mode */}
      {mode === 'edit' && routeStops.length > 0 && (
        <div className="flex gap-2">
          <Button onClick={clearAllStops} danger>
            Clear All Stops
          </Button>
          <Button onClick={resetMapView}>Reset Map View</Button>
        </div>
      )}

      {/* Legend */}
      <div className="text-sm text-gray-600 space-y-1">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#6366F1]" />
          <span className="font-semibold text-[#6366F1]">
            {routeStops.length} stop(s) configured
          </span>
          {mode === 'view' && <span className="text-gray-500">(View only)</span>}
        </div>
        {mode === 'edit' && (
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-400" />
            <span className="text-gray-600">
              {availableLocations.filter(loc => 
                !routeStops.some(stop => stop.locationId === loc.locationId)
              ).length} available pickup point(s) {availableLocations.length > 0 ? '(click to add)' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteMapViewer;
