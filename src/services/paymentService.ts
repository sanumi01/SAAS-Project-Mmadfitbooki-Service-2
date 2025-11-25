// Enhanced Payment Processing Service for MMAD FitBooki
// Supports multiple payment providers and subscription management

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  clientSecret?: string;
  metadata?: { [key: string]: string };
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export class PaymentService {
  private static apiKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '';
  private static baseUrl = process.env.REACT_APP_API_URL || '';

  // Initialize payment provider
  static async initialize(): Promise<void> {
    // Initialize Stripe or other payment provider
    if (typeof window !== 'undefined' && (window as any).Stripe) {
      // Stripe is already loaded
      return;
    }
    
    // Load Stripe script dynamically
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.head.appendChild(script);
    
    return new Promise((resolve) => {
      script.onload = () => resolve();
    });
  }

  // Create payment intent
  static async createPaymentIntent(
    amount: number,
    currency: string = 'gbp',
    metadata?: { [key: string]: string }
  ): Promise<PaymentIntent> {
    const response = await fetch(`${this.baseUrl}/api/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return response.json();
  }

  // Process payment
  static async processPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentIntent> {
    const response = await fetch(`${this.baseUrl}/api/payments/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        paymentIntentId,
        paymentMethodId,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment processing failed');
    }

    return response.json();
  }

  // Get payment methods for user
  static async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    const response = await fetch(`${this.baseUrl}/api/payments/methods/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }

    return response.json();
  }

  // Add payment method
  static async addPaymentMethod(
    customerId: string,
    paymentMethodData: any
  ): Promise<PaymentMethod> {
    const response = await fetch(`${this.baseUrl}/api/payments/methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        customerId,
        ...paymentMethodData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add payment method');
    }

    return response.json();
  }

  // Create subscription
  static async createSubscription(
    customerId: string,
    planId: string,
    paymentMethodId: string
  ): Promise<Subscription> {
    const response = await fetch(`${this.baseUrl}/api/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        customerId,
        planId,
        paymentMethodId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }

    return response.json();
  }

  // Get user subscriptions
  static async getSubscriptions(customerId: string): Promise<Subscription[]> {
    const response = await fetch(`${this.baseUrl}/api/subscriptions/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscriptions');
    }

    return response.json();
  }

  // Cancel subscription
  static async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Subscription> {
    const response = await fetch(`${this.baseUrl}/api/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        cancelAtPeriodEnd,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return response.json();
  }

  // Get pricing plans
  static async getPricingPlans(): Promise<PricingPlan[]> {
    const response = await fetch(`${this.baseUrl}/api/pricing/plans`);

    if (!response.ok) {
      throw new Error('Failed to fetch pricing plans');
    }

    return response.json();
  }

  // Process booking payment
  static async processBookingPayment(
    bookingId: string,
    amount: number,
    paymentMethodId: string
  ): Promise<PaymentIntent> {
    // Default booking payments are billed in GBP (pounds)
    const paymentIntent = await this.createPaymentIntent(amount, 'gbp', {
      bookingId,
      type: 'booking_payment',
    });

    return this.processPayment(paymentIntent.id, paymentMethodId);
  }

  // Refund payment
  static async refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/payments/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason,
      }),
    });

    if (!response.ok) {
      throw new Error('Refund failed');
    }

    return response.json();
  }

  // Get payment history
  static async getPaymentHistory(
    customerId: string,
    limit: number = 10
  ): Promise<PaymentIntent[]> {
    const response = await fetch(
      `${this.baseUrl}/api/payments/history/${customerId}?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }

    return response.json();
  }

  // Validate payment method
  static async validatePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  // Helper method to get auth token
  private static getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  // Format currency
  static formatCurrency(amount: number, currency: string = 'GBP'): string {
    // Use en-GB locale for GBP formatting; currency param is upper-cased for Intl
    const locale = currency && currency.toUpperCase() === 'GBP' ? 'en-GB' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  // Calculate tax
  static calculateTax(amount: number, taxRate: number = 0.08): number {
    return Math.round(amount * taxRate * 100) / 100;
  }

  // Calculate total with tax
  static calculateTotal(amount: number, taxRate: number = 0.08): number {
    return amount + this.calculateTax(amount, taxRate);
  }
}

export default PaymentService;