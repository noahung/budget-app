export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  CHF: 'CHF',
  KRW: '₩',
  THB: '฿',
  MYR: 'RM',
  VND: '₫',
  IDR: 'Rp',
  PHP: '₱',
  MMK: 'K',
};

export const CURRENCY_LOCALES: Record<string, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  CNY: 'zh-CN',
  INR: 'en-IN',
  AUD: 'en-AU',
  CAD: 'en-CA',
  SGD: 'en-SG',
  CHF: 'de-CH',
  KRW: 'ko-KR',
  THB: 'th-TH',
  MYR: 'ms-MY',
  VND: 'vi-VN',
  IDR: 'id-ID',
  PHP: 'en-PH',
  MMK: 'my-MM',
};

export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  options?: { showSymbol?: boolean; showCode?: boolean }
): string {
  const { showSymbol = true, showCode = false } = options || {};
  
  const locale = CURRENCY_LOCALES[currencyCode] || 'en-US';
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';
  
  // Format with proper decimal places
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const formattedNumber = formatter.format(amount);
  
  if (showSymbol && showCode) {
    return `${symbol}${formattedNumber} ${currencyCode}`;
  } else if (showSymbol) {
    return `${symbol}${formattedNumber}`;
  } else if (showCode) {
    return `${formattedNumber} ${currencyCode}`;
  }
  
  return formattedNumber;
}
