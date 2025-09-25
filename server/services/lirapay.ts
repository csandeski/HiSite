import fetch from 'node-fetch';

const LIRAPAY_API_URL = 'https://api.lirapaybr.com';
const LIRAPAY_API_KEY = process.env.LIRAPAY_API_KEY;

interface LiraPayTransactionRequest {
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

interface LiraPayTransactionResponse {
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

interface LiraPayAccountInfo {
  email: string;
  name: string;
  document: string;
}

interface LiraPayCashoutRequest {
  external_id: string;
  pix_key: string;
  pix_type: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
  amount: number;
  webhook_url: string;
}

interface LiraPayCashoutResponse {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  pix_key: string;
  pix_type: string;
  created_at: string;
}

export class LiraPayService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    if (!LIRAPAY_API_KEY) {
      throw new Error('LIRAPAY_API_KEY environment variable is not set');
    }
    this.apiKey = LIRAPAY_API_KEY;
    this.apiUrl = LIRAPAY_API_URL;
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
      throw new Error(`LiraPay API error: ${response.status} - ${error}`);
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
  ): Promise<{ pixCode: string; qrCode?: string; reference: string }> {
    try {
      // Different product names for different operations (appears in bank statement)
      let productName = 'RádioPlay - Pagamento';
      
      // Use description to determine the type of operation
      if (description.includes('autorização') || description.includes('Autorização')) {
        productName = 'RádioPlay - Autorização de Conta';
      } else if (description.includes('PIX') || description.includes('autenticação')) {
        productName = 'RádioPlay - Autenticação PIX';
      } else if (description.includes('premium') || description.includes('Premium')) {
        productName = 'RádioPlay - Assinatura Premium';
      } else if (description.includes('conversão') || description.includes('pontos')) {
        productName = 'RádioPlay - Conversão de Pontos';
      }
      
      const request: LiraPayTransactionRequest = {
        external_id: reference,
        total_amount: amount,
        payment_method: 'PIX',
        webhook_url: webhookUrl,
        items: [
          {
            id: '1',
            title: productName,
            description: productName,
            price: amount,
            quantity: 1,
            is_physical: false,
          },
        ],
        ip: '0.0.0.0', // This should ideally be the actual client IP
        customer: {
          name: customer.name || 'Cliente',
          email: customer.email || 'cliente@example.com',
          phone: customer.phone || '00000000000',
          document_type: 'CPF',
          document: customer.document || '00000000000',
          ...utmParams,
        },
      };

      const response = await this.makeRequest<LiraPayTransactionResponse>(
        '/v1/transactions',
        'POST',
        request
      );

      if (response.hasError || !response.pix?.payload) {
        throw new Error('Failed to create PIX payment');
      }

      return {
        pixCode: response.pix.payload,
        qrCode: undefined, // LiraPay doesn't return a QR code image
        reference: response.id,
      };
    } catch (error) {
      console.error('LiraPay createPixPayment error:', error);
      // NEVER use fallback or mock PIX - only real LiraPay integration
      throw error;
    }
  }

  async getAccountInfo(): Promise<LiraPayAccountInfo> {
    try {
      const response = await this.makeRequest<LiraPayAccountInfo>('/v1/account-info');
      return response;
    } catch (error) {
      console.error('LiraPay getAccountInfo error:', error);
      throw error;
    }
  }

  async getPaymentStatus(transactionId: string): Promise<string> {
    try {
      const response = await this.makeRequest<{
        id: string;
        status: string;
        external_id: string | null;
        amount: number;
        payment_method: string;
        customer: any;
        created_at: string;
      }>(`/v1/transactions/${transactionId}`);

      // Map LiraPay status to our internal status
      const statusMap: Record<string, string> = {
        'AUTHORIZED': 'approved',
        'PENDING': 'pending', 
        'CHARGEBACK': 'refunded',
        'FAILED': 'failed',
        'IN_DISPUTE': 'disputed',
      };

      return statusMap[response.status] || 'pending';
    } catch (error) {
      console.error('LiraPay getPaymentStatus error:', error);
      return 'pending';
    }
  }

  async createCashout(
    amount: number,
    pixKey: string,
    pixType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM',
    reference: string,
    webhookUrl: string
  ): Promise<{ id: string; status: string }> {
    try {
      const request: LiraPayCashoutRequest = {
        external_id: reference,
        pix_key: pixKey,
        pix_type: pixType,
        amount: amount,
        webhook_url: webhookUrl,
      };

      const response = await this.makeRequest<LiraPayCashoutResponse>(
        '/v1/cashout',
        'POST',
        request
      );

      return {
        id: response.id,
        status: response.status.toLowerCase(),
      };
    } catch (error) {
      console.error('LiraPay createCashout error:', error);
      throw error;
    }
  }

  // Webhook signature verification (if LiraPay provides it)
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // LiraPay documentation doesn't mention webhook signature verification
    // This would need to be implemented if they provide it
    return true;
  }
}

// Export a singleton instance
export const liraPayService = new LiraPayService();