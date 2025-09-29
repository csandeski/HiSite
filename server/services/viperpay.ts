import fetch from 'node-fetch';

const VIPERPAY_API_URL = 'https://api.viperpay.org';
const VIPERPAY_API_KEY = process.env.VIPERPAY_API_KEY;

interface ViperPayTransactionRequest {
  external_id: string;
  total_amount: number;
  payment_method: 'PIX';
  webhook_url: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    quantity: number;
    is_physical: boolean;
  }>;
  ip: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    document_type: 'CPF' | 'CNPJ';
    document: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  splits?: Array<{
    recipient_id: string;
    percentage: number;
  }>;
}

interface ViperPayTransactionResponse {
  id: string;
  external_id: string;
  status: 'AUTHORIZED' | 'PENDING' | 'CHARGEBACK' | 'FAILED' | 'IN_DISPUTE';
  total_value: number;
  customer: {
    email: string;
    name: string;
  };
  payment_method: string;
  pix?: {
    payload: string;
  };
  hasError: boolean;
}

interface ViperPayAccountInfo {
  email: string;
  name: string;
  document: string;
}

interface ViperPayCashoutRequest {
  external_id: string;
  pix_key: string;
  pix_type: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
  amount: number;
  webhook_url: string;
}

interface ViperPayCashoutResponse {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  pix_key: string;
  pix_type: string;
  created_at: string;
}

export class ViperPayService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    if (!VIPERPAY_API_KEY) {
      throw new Error('VIPERPAY_API_KEY environment variable is not set');
    }
    this.apiKey = VIPERPAY_API_KEY;
    this.apiUrl = VIPERPAY_API_URL;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method,
      headers: {
        'api-secret': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ViperPay API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<T>;
  }

  async createPixPayment(
    amount: number,
    description: string,
    reference: string,
    webhookUrl: string,
    customer: {
      name: string;
      email: string;
      phone?: string;
      document?: string;
    },
    utmParams?: {
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
      utm_term?: string;
    }
  ): Promise<{ pixCode: string; reference: string; transactionId: string }> {
    const request: ViperPayTransactionRequest = {
      external_id: reference,
      total_amount: amount,
      payment_method: 'PIX',
      webhook_url: webhookUrl,
      items: [
        {
          id: '1',
          title: description,
          description: description,
          price: amount,
          quantity: 1,
          is_physical: false,
        },
      ],
      ip: '0.0.0.0',
      customer: {
        name: customer.name || 'Cliente',
        email: customer.email || 'cliente@example.com',
        phone: customer.phone || '00000000000',
        document_type: 'CPF',
        document: customer.document || '00000000000',
        ...(utmParams || {}),
      },
    };

    try {
      console.log('Creating PIX transaction with ViperPay...');
      console.log('Request:', JSON.stringify(request, null, 2));

      const response = await this.makeRequest<ViperPayTransactionResponse>(
        '/v1/transactions',
        'POST',
        request
      );

      console.log('ViperPay Response:', JSON.stringify(response, null, 2));

      if (response.hasError) {
        throw new Error('ViperPay transaction creation failed');
      }

      if (!response.pix?.payload) {
        throw new Error('PIX code not received from ViperPay');
      }

      return {
        pixCode: response.pix.payload,
        reference: response.external_id,
        transactionId: response.id,
      };
    } catch (error) {
      console.error('ViperPay createPixPayment error:', error);
      throw error;
    }
  }

  async getTransaction(transactionId: string): Promise<any> {
    return this.makeRequest(`/v1/transactions/${transactionId}`);
  }

  async getAccountInfo(): Promise<ViperPayAccountInfo> {
    return this.makeRequest<ViperPayAccountInfo>('/v1/account-info');
  }

  async createCashout(
    pixKey: string,
    pixType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM',
    amount: number,
    reference: string,
    webhookUrl: string
  ): Promise<ViperPayCashoutResponse> {
    const request: ViperPayCashoutRequest = {
      external_id: reference,
      pix_key: pixKey,
      pix_type: pixType,
      amount,
      webhook_url: webhookUrl,
    };

    return this.makeRequest<ViperPayCashoutResponse>(
      '/v1/cashout',
      'POST',
      request
    );
  }
}

// Export singleton instance
export const viperPayService = new ViperPayService();