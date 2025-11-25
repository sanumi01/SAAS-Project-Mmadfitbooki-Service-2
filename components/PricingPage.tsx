import React, { useState } from 'react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  maxBookings: number | string;
}

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showContactForm, setShowContactForm] = useState(false);

  // 2% platform markup included in prices
  const pricingPlans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: billingCycle === 'monthly' ? 5.99 : 59.99,
      originalPrice: billingCycle === 'monthly' ? 5.87 : 58.81, // Before 2% markup
      currency: '£',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Perfect for individual beauty professionals',
      maxBookings: 50,
      features: [
        'Up to 50 bookings per month',
        'Basic appointment scheduling',
        'Client management system',
        'Email notifications',
        'Mobile app access',
        'Basic reporting',
        'Email support'
      ],
      buttonText: 'Start Free Trial'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: billingCycle === 'monthly' ? 14.99 : 149.99,
      originalPrice: billingCycle === 'monthly' ? 14.70 : 147.05, // Before 2% markup
      currency: '£',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Ideal for growing beauty salons',
      maxBookings: 200,
      popular: true,
      features: [
        'Up to 200 bookings per month',
        'Advanced scheduling & calendar',
        'Staff management system',
        'Service & pricing management',
        'Client profiles & history',
        'SMS & email notifications',
        'Payment processing integration',
        'Advanced analytics & reports',
        'Priority support'
      ],
      buttonText: 'Start Free Trial'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 39.99 : 399.99,
      originalPrice: billingCycle === 'monthly' ? 39.21 : 392.15, // Before 2% markup
      currency: '£',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Complete solution for large beauty businesses',
      maxBookings: 'Unlimited',
      features: [
        'Unlimited bookings',
        'Multi-location management',
        'Advanced staff scheduling',
        'Inventory management',
        'Customer loyalty programs',
        'API access & integrations',
        'White-label options',
        'Custom branding',
        'Dedicated account manager',
        '24/7 priority support',
        'Custom training & onboarding'
      ],
      buttonText: 'Start Free Trial'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    if (planId === 'custom') {
      setShowContactForm(true);
    } else {
      // Redirect to payment page with selected plan
      window.location.href = `/payment?plan=${planId}&billing=${billingCycle}`;
    }
  };

  const ContactForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Sales</h3>
        <p className="text-gray-600 mb-6">
          Get a custom quote tailored to your beauty business needs.
        </p>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Locations
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Bookings (Estimate)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus-ring"
              placeholder="Tell us about your specific needs..."
            />
          </div>
            <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 transition-colors focus-ring"
            >
              Send Request
            </button>
            <button
              type="button"
              onClick={() => setShowContactForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors focus-ring"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-pink-600 rounded-full mr-3 flex items-center justify-center">
                <span className="text-white font-bold text-sm">MB</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">MMADBooki Beauty</h1>
            </div>
            <div className="flex items-center space-x-4 mr-32">
              <a href="/" className="text-gray-600 hover:text-gray-900 focus-ring">Dashboard</a>
              <a href="/features" className="text-gray-600 hover:text-gray-900 focus-ring">Features</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900 focus-ring">Contact</a>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Beauty Business Plan
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional booking and management solutions for beauty salons, spas, and independent practitioners. 
            Start with a 14-day free trial, no credit card required.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-pink-600' : 'bg-gray-200'
              } focus-ring`}
              aria-pressed={billingCycle === 'yearly' ? 'true' : 'false'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Save 17%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-pink-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <span className="mr-1">⭐</span>
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.currency}{plan.price}
                  </span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500">
                  Up to {plan.maxBookings} booking{typeof plan.maxBookings === 'number' && plan.maxBookings !== 1 ? 's' : ''} per month
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handlePlanSelect(plan.id)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-pink-600 text-white hover:bg-pink-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } focus-ring`}
                aria-label={`Select ${plan.name} plan`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Custom Enterprise Card */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Custom Enterprise Solution</h3>
            <p className="text-xl text-pink-100 mb-6">
              Need something more? We'll create a tailored solution for your beauty business 
              with custom features, integrations, and dedicated support.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
              <div className="flex items-center">
                <span className="mr-2">👥</span>
                Unlimited Users
              </div>
              <div className="flex items-center">
                <span className="mr-2">🏢</span>
                Multi-Location Support
              </div>
              <div className="flex items-center">
                <span className="mr-2">🔧</span>
                Custom Integrations
              </div>
              <div className="flex items-center">
                <span className="mr-2">📞</span>
                Dedicated Support
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowContactForm(true)}
              className="bg-white text-pink-600 px-8 py-3 rounded-lg font-medium hover:bg-pink-50 transition-colors focus-ring"
              aria-label="Contact sales for quote"
            >
              Contact Sales for Quote
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-8">Trusted by beauty professionals worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center">
              <span className="mr-2">🔒</span>
              <span>Secure & Compliant</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📞</span>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && <ContactForm />}
    </div>
  );
};

export default PricingPage;