'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';

interface Location {
  _id: string;
  name: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

interface LocationManagementProps {
  onLocationAdded?: (location: Location) => void;
  onLocationUpdated?: (location: Location) => void;
  onLocationDeleted?: (locationId: string) => void;
}

export default function LocationManagement({ 
  onLocationAdded, 
  onLocationUpdated, 
  onLocationDeleted 
}: LocationManagementProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await api.getLocations();
      if (response.success) {
        setLocations(response.data);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const locationData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined
      };

      let response;
      if (editingLocation) {
        response = await api.updateLocation(editingLocation._id, locationData);
        if (response.success) {
          onLocationUpdated?.(response.data);
        }
      } else {
        response = await api.createLocation(locationData);
        if (response.success) {
          onLocationAdded?.(response.data);
        }
      }

      if (response.success) {
        setFormData({ name: '', city: '', address: '', latitude: '', longitude: '' });
        setIsFormOpen(false);
        setEditingLocation(null);
        loadLocations();
      }
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      city: location.city,
      address: location.address || '',
      latitude: location.latitude?.toString() || '',
      longitude: location.longitude?.toString() || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (locationId: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        const response = await api.deleteLocation(locationId);
        if (response.success) {
          onLocationDeleted?.(locationId);
          loadLocations();
        }
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    }
  };

  if (isLoading && locations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Location Management</h2>
        <button
          onClick={() => {
            setIsFormOpen(true);
            setEditingLocation(null);
            setFormData({ name: '', city: '', address: '', latitude: '', longitude: '' });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Location
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingLocation ? 'Edit Location' : 'Add New Location'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Chennai Central"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Chennai"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 123 MG Road, Chennai, Tamil Nadu"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 13.0827"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 80.2707"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : (editingLocation ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingLocation(null);
                  setFormData({ name: '', city: '', address: '', latitude: '', longitude: '' });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coordinates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locations.map((location) => (
              <tr key={location._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {location.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {location.city}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {location.address || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {location.latitude && location.longitude 
                    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(location)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(location._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
