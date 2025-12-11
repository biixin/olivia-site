// Utilitários para integração com PushinPay API

const API_BASE_URL = import.meta.env.VITE_PUSHINPAY_API_URL || 'https://api.pushinpay.com.br/api';
const API_TOKEN = import.meta.env.VITE_PUSHINPAY_API_TOKEN;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_TOKEN}`,
  'Accept': 'application/json'
};

// Função para gerar nome aleatório
export const generateRandomName = (): string => {
  const firstNames = [
    'Ana', 'Maria', 'João', 'Pedro', 'Carla', 'Lucas', 'Fernanda', 'Rafael',
    'Juliana', 'Bruno', 'Camila', 'Diego', 'Larissa', 'Thiago', 'Beatriz',
    'Gabriel', 'Amanda', 'Felipe', 'Natália', 'Rodrigo'
  ];
  
  const lastNames = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
    'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
    'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa'
  ];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
};

// Função para gerar email aleatório
export const generateRandomEmail = (): string => {
  const domains = ['gmail.com'];
  const randomString = Math.random().toString(36).substring(2, 10);
  const domain = domains[Math.floor(Math.random() * domains.length)];
  
  return `${randomString}@${domain}`;
};

// Função para converter valor em reais para centavos
export const convertToCents = (valueInReais: number): number => {
  return Math.round(valueInReais * 100);
};

// Interface para resposta da API de criação de PIX
export interface PixCreationResponse {
  qr_code: string;
  id: string;
  qr_code_base64: string;
}

// Interface para resposta da API de verificação de pagamento
export interface PaymentStatusResponse {
  status: string;
}

// Função para criar PIX
export const createPix = async (valueInReais: number): Promise<PixCreationResponse> => {
  if (!API_TOKEN) {
    throw new Error('Token da API PushinPay não configurado');
  }

  const body = {
    value: convertToCents(valueInReais),
    name: generateRandomName(),
    email: generateRandomEmail()
  };

  try {
    const response = await fetch(`${API_BASE_URL}/pix/cashIn`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar PIX:', error);
    throw error;
  }
};

// Função para verificar status do pagamento
export const checkPaymentStatus = async (qrcodeId: string): Promise<PaymentStatusResponse> => {
  if (!API_TOKEN) {
    throw new Error('Token da API PushinPay não configurado');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/transactions/${qrcodeId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    console.log("test:", data);
    return data;
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    throw error;
  }
};