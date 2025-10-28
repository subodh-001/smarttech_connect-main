import React, { useState, useEffect } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import { Checkbox } from '../../../components/ui/Checkbox'
import { Briefcase, DollarSign, Star, MapPin, Award, Clock } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../../../contexts/NewAuthContext'

const TechnicianSettings = ({ technicianProfile, onUpdate }) => {
  const { userProfile, fetchUserProfile } = useAuth()
  const [user, setUser] = useState(null)
  useEffect(() => {
    if (userProfile) {
      setUser({ id: userProfile?.id, email: userProfile?.email })
    }
  }, [userProfile])
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    specializations: [],
    experience_years: 0,
    hourly_rate: 0,
    bio: '',
    certifications: [],
    service_radius: 10,
    current_status: 'offline'
  })

  const serviceCategories = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'appliance_repair', label: 'Appliance Repair' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'handyman', label: 'Handyman' },
    { value: 'gardening', label: 'Gardening' }
  ]

  const statusOptions = [
    { value: 'available', label: 'Available for bookings' },
    { value: 'busy', label: 'Currently busy' },
    { value: 'offline', label: 'Offline/Unavailable' }
  ]

  useEffect(() => {
    if (technicianProfile) {
      setFormData({
        specializations: technicianProfile?.specializations || [],
        experience_years: technicianProfile?.years_of_experience || 0,
        hourly_rate: technicianProfile?.hourly_rate || 0,
        bio: technicianProfile?.bio || '',
        certifications: technicianProfile?.certifications || [],
        service_radius: technicianProfile?.service_radius || 10,
        current_status: technicianProfile?.current_status || 'offline'
      })
    }
  }, [technicianProfile])

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSpecializationToggle = (category) => {
    setFormData(prev => {
      const specializations = prev?.specializations?.includes(category)
        ? prev?.specializations?.filter(s => s !== category)
        : [...prev?.specializations, category]
      return { ...prev, specializations }
    })
  }

  const handleCertificationAdd = (certification) => {
    if (certification?.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev?.certifications, certification?.trim()]
      }))
    }
  }

  const handleCertificationRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev?.certifications?.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    const technicianId = technicianProfile?.id
    if (!technicianId) {
      alert('Technician profile not found.')
      return
    }
    setIsSaving(true)
    try {
      const updatePayload = {
        specializations: formData.specializations,
        yearsOfExperience: formData.experience_years,
        hourlyRate: formData.hourly_rate,
        bio: formData.bio,
        certifications: formData.certifications,
        serviceRadius: formData.service_radius,
        currentStatus: formData.current_status
      }
      await axios.put(`/api/technicians/${technicianId}`, updatePayload)
      await fetchUserProfile()
      setIsEditing(false)
      onUpdate?.()
      alert('Technician settings saved.')
    } catch (error) {
      console.error('Error saving technician settings:', error)
      alert('Error saving settings. Please try again.')
    }
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Technician Settings</h2>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2"
          >
            <Briefcase className="h-4 w-4" />
            <span>Edit Technician Profile</span>
          </Button>
        )}
      </div>
      {/* Technician Stats */}
      {technicianProfile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-2xl font-bold text-gray-900">
                {technicianProfile?.average_rating?.toFixed(1) || technicianProfile?.rating?.toFixed(1) || '0.0'}
              </span>
            </div>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Briefcase className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">
                {technicianProfile?.total_jobs || 0}
              </span>
            </div>
            <p className="text-sm text-gray-600">Jobs Completed</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">
                ${technicianProfile?.hourly_rate || '0'}
              </span>
            </div>
            <p className="text-sm text-gray-600">Hourly Rate</p>
          </div>
        </div>
      )}
      <div className="space-y-6">
        {/* Status */}
        <div>
          <Select
            label="Current Status"
            value={formData?.current_status || 'offline'}
            onChange={(value) => handleInputChange('current_status', value)}
            options={statusOptions}
            disabled={!isEditing}
            icon={Clock}
          />
          <p className="mt-1 text-sm text-gray-500">
            This affects your visibility to customers looking for services.
          </p>
        </div>

        {/* Specializations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Service Specializations
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {serviceCategories?.map((category) => (
              <div key={category?.value} className="flex items-center space-x-2">
                <Checkbox
                  checked={formData?.specializations?.includes(category?.value) || false}
                  onChange={(checked) => {
                    if (isEditing) {
                      handleSpecializationToggle(category?.value)
                    }
                  }}
                  disabled={!isEditing}
                />
                <label className="text-sm text-gray-700">{category?.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Years of Experience"
            type="number"
            min="0"
            max="50"
            value={formData?.experience_years || ''}
            onChange={(e) => handleInputChange('experience_years', parseInt(e?.target?.value) || 0)}
            disabled={!isEditing}
            icon={Award}
          />

          <Input
            label="Hourly Rate ($)"
            type="number"
            min="0"
            step="0.01"
            value={formData?.hourly_rate || ''}
            onChange={(e) => handleInputChange('hourly_rate', parseFloat(e?.target?.value) || 0)}
            disabled={!isEditing}
            icon={DollarSign}
          />

          <Input
            label="Service Radius (km)"
            type="number"
            min="1"
            max="100"
            value={formData?.service_radius || ''}
            onChange={(e) => handleInputChange('service_radius', parseInt(e?.target?.value) || 10)}
            disabled={!isEditing}
            icon={MapPin}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Bio
          </label>
          <textarea
            rows="4"
            value={formData?.bio || ''}
            onChange={(e) => handleInputChange('bio', e?.target?.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Describe your experience, expertise, and what makes you unique..."
          />
        </div>

        {/* Certifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certifications
          </label>
          <div className="space-y-2">
            {formData?.certifications?.map((cert, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm">{cert}</span>
                {isEditing && (
                  <button
                    onClick={() => handleCertificationRemove(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add certification..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  onKeyPress={(e) => {
                    if (e?.key === 'Enter') {
                      handleCertificationAdd(e?.target?.value);
                      e.target.value = '';
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={(e) => {
                    const input = e?.target?.parentElement?.querySelector('input');
                    handleCertificationAdd(input?.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isEditing && (
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              // Reset form data
              if (technicianProfile) {
                setFormData({
                  specializations: technicianProfile?.specializations || [],
                  experience_years: technicianProfile?.years_of_experience || 0,
                  hourly_rate: technicianProfile?.hourly_rate || 0,
                  bio: technicianProfile?.bio || '',
                  certifications: technicianProfile?.certifications || [],
                  service_radius: technicianProfile?.service_radius || 10,
                  current_status: technicianProfile?.current_status || 'offline'
                });
              }
            }}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Technician Settings'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TechnicianSettings;