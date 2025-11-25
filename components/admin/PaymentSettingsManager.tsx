import React, { useState } from 'react';
import { Card } from '../common/Card';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
}

export const PaymentSettingsManager: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'stripe',
      name: 'Card Payment (Stripe)',
      description: 'Accept credit/debit cards securely online',
      enabled: true,
      icon: '💳'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'PayPal payments and PayPal Credit',
      enabled: true,
      icon: '🅿️'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Direct bank transfer (manual verification)',
      enabled: false,
      icon: '🏦'
    },
    {
      id: 'pay_on_site',
      name: 'Pay at Service Location',
      description: 'Cash or card payment at the venue',
      enabled: true,
      icon: '🏢'
    }
  ]);

  const [bankDetails, setBankDetails] = useState({
    accountName: 'MMAD FitBooki Ltd',
    sortCode: '12-34-56',
    accountNumber: '12345678',
    reference: 'Booking-{BOOKING_ID}'
  });

  const togglePaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId ? { ...method, enabled: !method.enabled } : method
    ));
  };

  const handleSaveSettings = async () => {
    try {
      // API call to save payment settings
      console.log('Saving payment settings:', { paymentMethods, bankDetails });
      alert('Payment settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method Configuration</h2>
        
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{method.name}</h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={method.enabled}
                  onChange={() => togglePaymentMethod(method.id)}
                  className="sr-only peer focus-ring"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Bank Transfer Details */}
      {paymentMethods.find(m => m.id === 'bank_transfer')?.enabled && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Bank Transfer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
              <input
                id="account-name"
                type="text"
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              />
            </div>
            <div>
              <label htmlFor="sort-code" className="block text-sm font-medium text-gray-700 mb-2">Sort Code</label>
              <input
                id="sort-code"
                type="text"
                value={bankDetails.sortCode}
                onChange={(e) => setBankDetails(prev => ({ ...prev, sortCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
                placeholder="12-34-56"
              />
            </div>
            <div>
              <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                id="account-number"
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
                placeholder="12345678"
              />
            </div>
            <div>
              <label htmlFor="payment-reference" className="block text-sm font-medium text-gray-700 mb-2">Payment Reference</label>
              <input
                id="payment-reference"
                type="text"
                value={bankDetails.reference}
                onChange={(e) => setBankDetails(prev => ({ ...prev, reference: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
                placeholder="Booking-{BOOKING_ID}"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveSettings}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus-ring"
        >
          Save Payment Settings
        </button>
      </div>
    </div>
  );
};