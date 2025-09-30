// Valores de autorização e autenticação PIX em centavos
export const AUTHORIZATION_AMOUNT_CENTS = 1999; // R$ 19,99
export const PIX_AUTH_AMOUNT_CENTS = 1990; // R$ 19,90

// Helpers para conversão
export function centsToBRL(cents: number): number {
  return cents / 100;
}

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(centsToBRL(cents));
}

export function formatBRLFromValue(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}