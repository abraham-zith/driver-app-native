/**
 * Formats a number as a currency string based on the provided locale and currency code.
 * @param amount The numerical amount to format
 * @param currencyCode The ISO 4217 currency code (default: 'INR')
 * @param locale The locale to format the currency in (default: 'en-IN')
 * @returns The formatted currency string (e.g., '₹1,500.00')
 */
export const formatCurrency = (
    amount: number,
    currencyCode: string = 'INR',
    locale: string = 'en-IN'
): string => {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch (error) {
        // Fallback in case Intl is not fully supported in the JS engine
        const symbol = currencyCode === 'INR' ? '₹' : (currencyCode === 'USD' ? '$' : currencyCode);
        return `${symbol}${amount.toFixed(2)}`;
    }
};
