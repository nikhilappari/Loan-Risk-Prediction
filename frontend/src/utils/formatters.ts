export const formatCurrency = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

export const formatPercent = (val: number | undefined | null, decimals = 1): string => {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  return `${(val * 100).toFixed(decimals)}%`;
};

export const formatRatio = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return '0.00x';
  return `${val.toFixed(2)}x`;
};

export const formatNumber = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-US').format(val);
};

export const formatDate = (isoStr: string | undefined | null): string => {
  if (!isoStr) return 'N/A';
  try {
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return isoStr;
  }
};
