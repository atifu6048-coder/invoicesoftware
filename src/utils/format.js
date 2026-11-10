/**
 * Format numbers in standard PKR format with commas.
 * e.g. 1250 -> "1,250", 1250000 -> "1,000,000", 0 -> "0"
 */
export const formatPKR = (val, showZero = true) => {
  if (val === '' || val === null || val === undefined) {
    return showZero ? '0' : '';
  }
  const num = Number(val);
  if (isNaN(num)) return showZero ? '0' : '';
  if (num === 0 && !showZero) return '';

  return num.toLocaleString('en-US', {
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  });
};
