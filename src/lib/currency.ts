import { Currency, CURRENCIES } from "@/types/expense";

// Exchange rates relative to USD (1 USD = X units of currency)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
  MXN: 17.15,
  BRL: 4.97,
};

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;
  // Convert to USD first, then to target
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  return amountInUSD * EXCHANGE_RATES[toCurrency];
}

export function getCurrencySymbol(currency: Currency): string {
  const info = CURRENCIES.find((c) => c.code === currency);
  return info?.symbol ?? currency;
}

export function formatCurrencyAmount(amount: number, currency: Currency): string {
  const localeMap: Record<Currency, string> = {
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    JPY: "ja-JP",
    CAD: "en-CA",
    AUD: "en-AU",
    MXN: "es-MX",
    BRL: "pt-BR",
  };

  return new Intl.NumberFormat(localeMap[currency], {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "JPY" ? 0 : 2,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(amount);
}
