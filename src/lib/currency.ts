// Format currency utilities for Indonesian Rupiah

/**
 * Format number to Indonesian Rupiah currency with dots as thousand separators
 * @param value - The number to format
 * @returns Formatted string with dots (e.g., "1.000.000")
 */
export const formatRupiah = (value: number | string): string => {
  if (!value && value !== 0) return '';
  
  const numericValue = typeof value === 'string' 
    ? parseInt(value.replace(/\D/g, ''), 10) 
    : value;
  
  if (isNaN(numericValue)) return '';
  
  return numericValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parse formatted rupiah string to number
 * @param formattedValue - Formatted string (e.g., "1.000.000")
 * @returns Numeric value
 */
export const parseRupiah = (formattedValue: string): number => {
  if (!formattedValue) return 0;
  const numericString = formattedValue.replace(/\./g, '');
  return parseInt(numericString, 10) || 0;
};

/**
 * Handle input change for currency fields
 * @param e - React change event
 * @param onChange - Callback function to update state
 */
export const handleCurrencyChange = (
  e: React.ChangeEvent<HTMLInputElement>, 
  onChange: (value: string) => void
) => {
  const inputValue = e.target.value;
  // Remove all non-digit characters except dots
  const numericValue = inputValue.replace(/[^\d]/g, '');
  const formattedValue = formatRupiah(numericValue);
  onChange(formattedValue);
};

/**
 * Create currency input props for consistent behavior
 * @param value - Current formatted value
 * @param onChange - State setter function
 * @returns Props object for input element
 */
export const createCurrencyInputProps = (
  value: string,
  onChange: (value: string) => void
) => ({
  type: 'text',
  value,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
    handleCurrencyChange(e, onChange),
  placeholder: '0',
  className: `mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-right font-mono focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`,
  inputMode: 'numeric' as const,
  pattern: '[0-9.]*',
  autoComplete: 'off',
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only allow numbers and dots
    if (!/[\d.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  }
});

/**
 * Add "Rp " prefix to display formatted currency
 * @param value - Formatted value
 * @returns Value with Rp prefix
 */
export const displayRupiah = (value: string | number): string => {
  if (!value && value !== 0) return 'Rp 0';
  const formatted = typeof value === 'number' ? formatRupiah(value) : value;
  return `Rp ${formatted}`;
};