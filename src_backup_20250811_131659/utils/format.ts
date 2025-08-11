// src/utils/format.ts
export function formatCurrency(amount: number, currency: string = 'SAR', locale: string = 'ar-SA') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
} 