import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: number;
  category: string;
}

export const ServicePricingManager: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Sample services with GBP pricing
  useEffect(() => {
    setServices([
      { id: 'service-001', name: 'Personal Training Session', price: 60, description: 'One-on-one training', duration: 60, category: 'Personal Training' },
      { id: 'service-002', name: 'Group Fitness Class', price: 20, description: 'High-energy group workout', duration: 45, category: 'Group Classes' },
      { id: 'service-003', name: 'Nutrition Consultation', price: 40, description: 'Personalized nutrition planning', duration: 30, category: 'Nutrition' },
      { id: 'service-004', name: 'Fitness Assessment', price: 80, description: 'Complete fitness evaluation', duration: 90, category: 'Assessment' }
    ]);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  const handleEditStart = (service: Service) => {
    setEditingId(service.id);
    setEditPrice(service.price.toString());
  };

  const handleSave = async (serviceId: string) => {
    const newPrice = parseFloat(editPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      // API call to update price
      // await updateServicePrice(serviceId, newPrice);
      
      setServices(prev => prev.map(service => 
        service.id === serviceId ? { ...service, price: newPrice } : service
      ));
      
      setEditingId(null);
      setEditPrice('');
    } catch (error) {
      console.error('Failed to update price:', error);
      alert('Failed to update price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPrice('');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Service Pricing Management</h2>
        <div className="text-sm text-gray-500">
          All prices in GBP (£)
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Duration</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Current Price</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <div className="font-medium text-gray-900">{service.name}</div>
                    <div className="text-sm text-gray-500">{service.description}</div>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600">{service.category}</td>
                <td className="py-4 px-4 text-gray-600">{service.duration} min</td>
                <td className="py-4 px-4">
                  {editingId === service.id ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">£</span>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus-ring"
                        min="0"
                        step="0.01"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <span className="text-lg font-semibold text-green-600">
                      {formatPrice(service.price)}
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  {editingId === service.id ? (
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleSave(service.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium focus-ring"
                        aria-label={`Save price for ${service.name}`}
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm font-medium focus-ring"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEditStart(service)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium focus-ring"
                      aria-label={`Edit price for ${service.name}`}
                    >
                      Edit Price
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Pricing Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Personal Training: £50-£100 per hour (industry standard)</li>
          <li>• Group Classes: £15-£30 per session</li>
          <li>• Consultations: £30-£60 per session</li>
          <li>• Assessments: £60-£120 per session</li>
        </ul>
      </div>
    </Card>
  );
};