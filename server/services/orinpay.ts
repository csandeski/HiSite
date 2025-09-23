import axios from 'axios';

const ORINPAY_API_URL = 'https://www.orinpay.com.br/api/v1';

// Use environment variable for API key - NEVER hardcode tokens
if (!process.env.ORINPAY_API_KEY) {
  console.error('WARNING: ORINPAY_API_KEY environment variable is not set');
}

export interface PixTransaction {
  paymentMethod: 'pix';
  reference: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    document: {
      number: string;
      type: 'cpf';
    };
  };
  shipping: {
    fee: number;
    address: {
      street: string;
      streetNumber: string;
      zipCode: string;
      neighborhood: string;
      city: string;
      state: string;
      country: string;
      complement?: string;
    };
  };
  items: {
    title: string;
    description: string;
    unitPrice: number; // Em centavos
    quantity: number;
    tangible: boolean;
  }[];
  isInfoProducts: boolean;
  utms?: {
    sck?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_id?: string;
    utm_term?: string;
    utm_content?: string;
  };
}

export interface PixResponse {
  id: number;
  orderId: number;
  status: string;
  isInfoProducts: boolean;
  customer: {
    name: string;
    email: string;
    phone: string;
    document: {
      number: string;
      type: string;
    };
  };
  paymentMethod: string;
  items: {
    id: number;
    quantity: number;
    title: string;
    amount: number;
    created_at: string;
  }[];
  pix: {
    encodedImage: string;
    payload: string;
  };
  transaction_db_id: number;
  reference: string;
}

export interface WebhookPayload {
  event: 'pix_gerado' | 'compra_aprovada' | 'compra_recusada' | 'reembolso' | 'estorno';
  id: number;
  orderId: number;
  status: 'pending' | 'approved' | 'rejected' | 'TRANSACTION_REFUNDED' | 'TRANSACTION_CHARGEDBACK';
  isInfoProducts: boolean;
  customer: {
    name: string;
    email: string;
    phone: string;
    document: {
      number: string;
      type: string;
    };
  };
  paymentMethod: string;
  items: {
    id: number;
    title: string;
    amount: number;
    quantity: number;
    created_at: string;
  }[];
  storeId: number;
  transaction_db_id: number;
  reference: string;
  pix?: {
    encodedImage: string;
    payload: string;
  };
}

class OrinPayService {
  private headers = {
    'Authorization': process.env.ORINPAY_API_KEY || '',
    'Content-Type': 'application/json'
  };

  async createPixTransaction(data: PixTransaction): Promise<PixResponse> {
    if (!process.env.ORINPAY_API_KEY) {
      throw new Error('ORINPAY_API_KEY não está configurada');
    }
    
    try {
      console.log('Sending PIX request to OrinPay:', {
        url: `${ORINPAY_API_URL}/transactions/pix`,
        hasApiKey: !!this.headers.Authorization
      });
      
      const response = await axios.post(
        `${ORINPAY_API_URL}/transactions/pix`,
        data,
        { headers: this.headers }
      );

      console.log('OrinPay API Response:', {
        status: response.status,
        hasData: !!response.data,
        hasPix: !!response.data?.pix,
        hasEncodedImage: !!response.data?.pix?.encodedImage,
        hasPayload: !!response.data?.pix?.payload,
        transactionId: response.data?.id,
        reference: response.data?.reference
      });
      
      // Log actual values to debug encodedImage issue
      if (response.data?.pix) {
        console.log('PIX Data Details:', {
          encodedImageLength: response.data.pix.encodedImage?.length,
          payloadLength: response.data.pix.payload?.length,
          encodedImageSample: response.data.pix.encodedImage?.substring(0, 50),
          payloadSample: response.data.pix.payload?.substring(0, 50)
        });
      }

      return response.data;
    } catch (error: any) {
      console.error('OrinPay API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data.erro || 'Dados inválidos');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Erro ao criar transação. Verifique os dados e tente novamente.');
      }
      
      throw new Error('Erro ao processar pagamento');
    }
  }

  validateCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  }

  formatPhone(phone: string): string {
    // Remove caracteres não numéricos
    phone = phone.replace(/[^\d]/g, '');
    
    // Adiciona o código do país se não tiver
    if (phone.length === 11) {
      phone = '55' + phone;
    }
    
    return phone;
  }

  formatCPF(cpf: string): string {
    // Remove caracteres não numéricos
    return cpf.replace(/[^\d]/g, '');
  }

  // Converte valor em reais para centavos
  reaisToCentavos(valor: number): number {
    return Math.round(valor * 100);
  }

  // Converte centavos para reais
  centavosToReais(centavos: number): number {
    return centavos / 100;
  }

  // Gera uma referência única para o pedido
  generateReference(userId: string, type: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type.toUpperCase()}-${userId}-${timestamp}-${random}`.substring(0, 50);
  }
  
  // Verifica assinatura do webhook (quando OrinPay fornecer)
  verifyWebhookSignature(payload: any, signature?: string): boolean {
    // TODO: Implementar verificação de assinatura quando OrinPay fornecer secret
    // Por enquanto, verificaremos se a referência existe no nosso banco
    return true;
  }

  // Valida se o valor está dentro do limite permitido
  validateAmount(centavos: number): boolean {
    return centavos > 0 && centavos <= 99999; // Max R$ 999,99
  }
}

export default new OrinPayService();