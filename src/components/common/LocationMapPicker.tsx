import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Input, Button } from 'antd';
import { Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNotification } from '../../contexts/NotificationContext';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface LocationData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationMapPickerProps {
  onLocationSelect?: (data: LocationData) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
  enableSearch?: boolean;
  initialLocation?: LocationData | null;
}

const MapClickHandler: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMapEvents({});
  
  React.useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  
  return null;
};

const MapInitializer: React.FC = () => {
  const map = useMap();
  
  React.useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  
  return null;
};

const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  onLocationSelect,
  height = '450px',
  center = [10.8231, 106.6297],
  zoom = 13,
  enableSearch = true,
  initialLocation = null,
}) => {
  const { toastSuccess, toastError } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation);

  React.useEffect(() => {
    setSelectedLocation(initialLocation);
    if (initialLocation) {
      setMapCenter([initialLocation.latitude, initialLocation.longitude]);
    }
  }, [initialLocation]);

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

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await response.json();
      
      const locationData: LocationData = {
        name: data.name || data.address?.road || `Location ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latitude: lat,
        longitude: lng,
      };

      setSelectedLocation(locationData);
      
      if (onLocationSelect) {
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      const locationData: LocationData = {
        name: `Location ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latitude: lat,
        longitude: lng,
      };
      setSelectedLocation(locationData);
      
      if (onLocationSelect) {
        onLocationSelect(locationData);
      }
    }
  }, [onLocationSelect]);

  return (
    <div className="space-y-4">
      {enableSearch && (
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

      <div style={{ height }} className="rounded-lg border border-gray-300 overflow-hidden">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapInitializer />
          <MapUpdater center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {selectedLocation && (
            <Marker
              position={[selectedLocation.latitude, selectedLocation.longitude]}
            />
          )}

          <MapClickHandler onClick={handleMapClick} />
        </MapContainer>
      </div>

      {selectedLocation && (
        <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
          <h4 className="text-sm font-bold text-[#111827] mb-2">Selected Location</h4>
          <div className="space-y-1 text-sm">
            <p className="text-[#6B7280]">
              <span className="font-medium">Name:</span> {selectedLocation.name}
            </p>
            <p className="text-[#6B7280]">
              <span className="font-medium">Address:</span> {selectedLocation.address}
            </p>
            <p className="text-[#6B7280]">
              <span className="font-medium">Coordinates:</span> {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-[#6B7280]">
        Click anywhere on the map to select a location
      </p>
    </div>
  );
};

export default LocationMapPicker;
