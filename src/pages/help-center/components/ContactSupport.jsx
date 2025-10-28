import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { MessageCircle, Mail, Phone, Clock, Send, CheckCircle } from 'lucide-react';

const ContactSupport = () => {
  const [user, setUser] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  });

  useEffect(() => {
    const data = localStorage.getItem('smarttech_user');
    if (data) {
      const parsed = JSON.parse(data);
      setUser(parsed);
      setFormData(prev => ({
        ...prev,
        name: parsed?.name || '',
        email: parsed?.email || ''
      }));
    }
  }, []);

  const supportOptions = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      availability: 'Available 24/7',
      color: 'bg-blue-100 text-blue-600',
      action: () => {
        // Implement live chat
        alert('Live chat feature coming soon!');
      }
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      availability: 'Response within 24 hours',
      color: 'bg-green-100 text-green-600',
      action: () => setShowContactForm(true)
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our team',
      icon: Phone,
      availability: 'Mon-Fri, 9 AM - 6 PM EST',
      color: 'bg-purple-100 text-purple-600',
      action: () => {
        window.open('tel:+1-800-SMARTTECH', '_self');
      }
    }
  ];

  const categoryOptions = [
    { value: '', label: 'Select a category' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'account', label: 'Account Management' },
    { value: 'service', label: 'Service Request' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'other', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low - General inquiry' },
    { value: 'medium', label: 'Medium - Standard support' },
    { value: 'high', label: 'High - Urgent issue' },
    { value: 'critical', label: 'Critical - System down' }
  ];

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitContact = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically send the form data to your backend
      console.log('Support request submitted:', formData);
      
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setShowContactForm(false);
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          subject: '',
          category: '',
          priority: 'medium',
          message: ''
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting support request:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showContactForm) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Contact Support</h2>
          <Button
            variant="ghost"
            onClick={() => setShowContactForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </Button>
        </div>
        {isSubmitted ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Request Submitted Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              We've received your support request and will get back to you soon.
            </p>
            <p className="text-sm text-gray-500">
              You should receive a confirmation email shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitContact} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                required
                value={formData?.name || ''}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                disabled={isSubmitting}
              />

              <Input
                label="Email Address"
                type="email"
                required
                value={formData?.email || ''}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                disabled={isSubmitting}
              />
            </div>

            <Input
              label="Subject"
              required
              value={formData?.subject || ''}
              onChange={(e) => handleInputChange('subject', e?.target?.value)}
              disabled={isSubmitting}
              placeholder="Brief description of your issue"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Category"
                required
                value={formData?.category || ''}
                onChange={(value) => handleInputChange('category', value)}
                options={categoryOptions}
                disabled={isSubmitting}
              />

              <Select
                label="Priority"
                value={formData?.priority || 'medium'}
                onChange={(value) => handleInputChange('priority', value)}
                options={priorityOptions}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                required
                rows="6"
                value={formData?.message || ''}
                onChange={(e) => handleInputChange('message', e?.target?.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Please describe your issue in detail..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowContactForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? 'Sending...' : 'Send Request'}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Need More Help?
        </h2>
        <p className="text-gray-600">
          Can't find what you're looking for? Our support team is here to help.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {supportOptions?.map((option) => {
          const IconComponent = option?.icon;
          return (
            <div
              key={option?.title}
              onClick={option?.action}
              className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${option?.color} mb-4 group-hover:scale-110 transition-transform`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {option?.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {option?.description}
              </p>
              <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{option?.availability}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Quick Contact Info
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div>📧 support@smarttechconnect.com</div>
          <div>📞 1-800-SMARTTECH (1-800-762-7883)</div>
          <div>🕒 Support Hours: Monday - Friday, 9:00 AM - 6:00 PM EST</div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;