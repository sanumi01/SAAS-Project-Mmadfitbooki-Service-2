import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PaymentPageProps {
  selectedPlan?: string;
  billingCycle?: 'monthly' | 'yearly';
}

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
}

const PaymentPage: React.FC<PaymentPageProps> = ({ selectedPlan = 'professional', billingCycle = 'monthly' }) => {
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    businessName: '',
    phone: ''
  });

  // PayPal configuration - using your business account
  const paypalOptions = {
    // include both runtime "client-id" and typed clientId for the React types
    "client-id": "YOUR_PAYPAL_CLIENT_ID", // Replace with actual PayPal Client ID
    clientId: "YOUR_PAYPAL_CLIENT_ID",
    currency: "GBP",
    intent: "subscription"
  };

  const planDetails: Record<string, PlanDetails> = {
    starter: {
      id: 'starter',
      name: 'Starter Plan',
      price: billingCycle === 'monthly' ? 5.99 : 59.99,
      currency: 'GBP',
      period: billingCycle === 'monthly' ? 'month' : 'year',
      features: ['50 bookings/month', 'Basic scheduling', 'Client management', 'Email notifications']
    },
    professional: {
      id: 'professional',
      name: 'Professional Plan',
      price: billingCycle === 'monthly' ? 14.99 : 149.99,
      currency: 'GBP',
      period: billingCycle === 'monthly' ? 'month' : 'year',
      features: ['200 bookings/month', 'Advanced scheduling', 'Staff management', 'SMS notifications', 'Analytics']
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: billingCycle === 'monthly' ? 39.99 : 399.99,
      currency: 'GBP',
      period: billingCycle === 'monthly' ? 'month' : 'year',
      features: ['Unlimited bookings', 'Multi-location', 'API access', 'Custom branding', '24/7 support']
    }
  };

  const currentPlan = planDetails[selectedPlan];

  const handlePayPalSuccess = async (details: any, actions?: any): Promise<void> => {
    console.log('PayPal payment successful:', details);
    setIsProcessing(true);

    // Process the payment and create subscription
    await processSubscription(details);
    return;
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal payment error:', error);
    alert('Payment failed. Please try again.');
  };

  const processSubscription = async (paymentDetails: any) => {
    try {
      // Send payment details to your backend
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          billingCycle,
          customerInfo,
          paymentDetails,
          paypalAccount: 'koladeadio@googlemail.com' // Your PayPal account
        }),
      });

      if (response.ok) {
        // Redirect to success page
        window.location.href = '/payment-success';
      } else {
        throw new Error('Subscription creation failed');
      }
    } catch (error) {
      console.error('Subscription processing error:', error);
      alert('There was an error processing your subscription. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await processSubscription({ method: 'card' });
    } catch (error) {
      console.error('Card payment error:', error);
      alert('Card payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm relative">
        {/* MMAD Logo - Bottom Right */}
        <div className="absolute bottom-4 right-4 z-10">
          <img
            src="https://d24yjjd2bt1m89.cloudfront.net/assets/mmad-logo.png"
            alt="MMAD Company Logo"
            className="mmad-logo-footer"
            style={{ width: '120px', height: 'auto' }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-pink-600 rounded-full mr-3 flex items-center justify-center">
              <span className="text-white font-bold text-sm">MB</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MMADBooki Beauty</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="border-b pb-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentPlan.name}</h3>
                  <p className="text-gray-600">
                    Billed {billingCycle === 'monthly' ? 'monthly' : 'annually'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    £{currentPlan.price}
                  </div>
                  <div className="text-gray-600">
                    per {currentPlan.period}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">£{(currentPlan.price / 1.02).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (2%)</span>
                <span className="font-medium">£{(currentPlan.price - (currentPlan.price / 1.02)).toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>£{currentPlan.price}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-pink-50 rounded-lg">
              <div className="flex items-center text-pink-800">
                <span className="mr-2">🔒</span>
                <span className="text-sm font-medium">14-day free trial included</span>
              </div>
              <p className="text-sm text-pink-700 mt-1">
                You won't be charged until your trial ends. Cancel anytime.
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>

            {/* Customer Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus-ring"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus-ring"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={customerInfo.businessName}
                  onChange={(e) => setCustomerInfo({...customerInfo, businessName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus-ring"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 border-2 rounded-lg flex items-center justify-center ${
                    paymentMethod === 'paypal' 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } focus-ring`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">PayPal</div>
                    <div className="text-sm text-gray-600">Pay with PayPal</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg flex items-center justify-center ${
                    paymentMethod === 'card' 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } focus-ring`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">💳</div>
                    <div className="text-sm text-gray-600">Credit/Debit Card</div>
                  </div>
                </button>
              </div>
            </div>

            {/* PayPal Payment */}
            {paymentMethod === 'paypal' && (
              <div className="mb-6">
                <PayPalScriptProvider options={paypalOptions}>
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createSubscription={(data, actions) => {
                      return actions.subscription.create({
                        plan_id: `MMADBOOKI_${selectedPlan.toUpperCase()}_${billingCycle.toUpperCase()}`,
                        subscriber: {
                          email_address: customerInfo.email,
                          name: {
                            given_name: customerInfo.firstName,
                            surname: customerInfo.lastName
                          }
                        }
                      });
                    }}
                    onApprove={handlePayPalSuccess}
                    onError={handlePayPalError}
                    disabled={isProcessing || !customerInfo.email || !customerInfo.firstName || !customerInfo.lastName}
                  />
                </PayPalScriptProvider>
              </div>
            )}

            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <form onSubmit={handleCardPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus-ring"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV *
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus-ring"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                >
                  {isProcessing ? 'Processing...' : `Start Trial - £${currentPlan.price}/${currentPlan.period}`}
                </button>
              </form>
            )}

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-gray-700">
                <span className="mr-2">🔒</span>
                <span className="text-sm">
                  Your payment information is secure and encrypted. 
                  All payments are processed through PayPal's secure servers.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;