import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { MessageCircle, Mail, Phone, Clock, CheckCircle } from 'lucide-react';

const ContactSupport = ({ user }) => {
  const navigate = useNavigate();
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
  });

  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      name: user?.full_name || user?.fullName || user?.name || '',
      email: user?.email || '',
    }));
  }, [user]);

  const supportOptions = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      availability: 'Available 24/7',
      color: 'bg-blue-100 text-blue-600',
      action: () => navigate('/chat-communication'),
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      availability: 'Response within 24 hours',
      color: 'bg-green-100 text-green-600',
      action: () => {
        setError(null);
        setIsSubmitted(false);
        setShowContactForm(true);
      },
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our team',
      icon: Phone,
      availability: 'Mon-Fri, 9 AM - 6 PM IST',
      color: 'bg-purple-100 text-purple-600',
      action: () => {
        window.open('tel:+91-800-555-0199', '_self');
      },
    },
  ];

  const categoryOptions = [
    { value: '', label: 'Select a category' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'account', label: 'Account Management' },
    { value: 'service', label: 'Service Request' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'other', label: 'Other' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low - General inquiry' },
    { value: 'medium', label: 'Medium - Standard support' },
    { value: 'high', label: 'High - Urgent issue' },
    { value: 'critical', label: 'Critical - System down' },
  ];

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitContact = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name?.trim(),
        email: formData.email?.trim(),
        subject: formData.subject?.trim(),
        category: formData.category || 'other',
        priority: formData.priority || 'medium',
        message: formData.message?.trim(),
        channel: 'email',
      };

      if (!payload.name || !payload.email || !payload.subject || !payload.message) {
        setError('Please fill in all required fields.');
        setIsSubmitting(false);
        return;
      }

      await axios.post('/api/support/tickets', payload);

      setIsSubmitted(true);
      setFormData({
        name: payload.name,
        email: payload.email,
        subject: '',
        category: '',
        priority: 'medium',
        message: '',
      });

      setTimeout(() => {
        setIsSubmitted(false);
        setShowContactForm(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting support request:', err);
      setError(
        err?.response?.data?.error || 'We could not send your request right now. Please try again shortly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showContactForm) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Contact Support</h2>
          <Button variant="ghost" onClick={() => setShowContactForm(false)} className="text-gray-500 hover:text-gray-700">
            ← Back
          </Button>
        </div>

        {isSubmitted ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Request submitted successfully!</h3>
            <p className="text-gray-600 mb-4">Our support team will get back to you shortly.</p>
            <p className="text-sm text-gray-500">You will also receive a confirmation email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitContact} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                disabled={isSubmitting}
              />

              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                disabled={isSubmitting}
              />
            </div>

            <Input
              label="Subject"
              required
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e?.target?.value)}
              disabled={isSubmitting}
              placeholder="Brief description of your issue"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Category"
                required
                value={formData.category}
                onChange={(value) => handleInputChange('category', value)}
                options={categoryOptions}
                disabled={isSubmitting}
              />

              <Select
                label="Priority"
                value={formData.priority}
                onChange={(value) => handleInputChange('priority', value)}
                options={priorityOptions}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Describe your issue</label>
              <textarea
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={6}
                required
                value={formData.message}
                onChange={(e) => handleInputChange('message', e?.target?.value)}
                disabled={isSubmitting}
                placeholder="Include details like booking ID, technician name, error messages, etc."
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting} iconName="Send">
              {isSubmitting ? 'Sending…' : 'Submit request'}
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Contact Support</h2>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-2" />
          Response within 24 hours
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {supportOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <button
              key={option.title}
              type="button"
              onClick={option.action}
              className="border border-gray-100 rounded-lg p-4 text-left hover:border-blue-200 hover:shadow-sm transition"
            >
              <div className={`inline-flex items-center justify-center rounded-lg p-3 ${option.color} mb-3`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">{option.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              <p className="text-xs text-gray-400 mt-3">{option.availability}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-800">Need urgent help?</p>
        <p className="mt-1">
          Call us on <span className="font-semibold text-gray-900">+91 800 555 0199</span> or start a chat. Our support
          team is available around the clock for critical issues.
        </p>
        <Button variant="link" className="mt-3 px-0" onClick={() => setShowContactForm(true)}>
          Send us a detailed message
        </Button>
      </div>
    </div>
  );
};

export default ContactSupport;

