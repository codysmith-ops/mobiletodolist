/**
 * Receipt Scanning Service
 * OCR-based receipt processing, expense tracking, and warranty management
 */

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  sku?: string;
}

export interface Receipt {
  id: string;
  storeName: string;
  storeAddress?: string;
  date: Date;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  receiptNumber?: string;
  imageUri?: string;
  ocrText?: string;
  categories: string[];
}

export interface Warranty {
  id: string;
  productName: string;
  purchaseDate: Date;
  expiryDate: Date;
  storeName: string;
  price: number;
  warrantyType: 'manufacturer' | 'extended' | 'store';
  coverageDetails?: string;
  receiptId: string;
  isExpired: boolean;
  daysRemaining: number;
}

/**
 * Parse OCR text into structured receipt data
 */
export const parseReceiptText = (ocrText: string): Partial<Receipt> => {
  const lines = ocrText.split('\n').map(l => l.trim()).filter(l => l);
  
  // Extract store name (usually first significant line)
  const storeName = lines[0] || 'Unknown Store';
  
  // Extract date
  const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
  const dateMatch = ocrText.match(dateRegex);
  const date = dateMatch ? new Date(dateMatch[1]) : new Date();
  
  // Extract total
  const totalRegex = /total[:\s]*\$?(\d+\.\d{2})/i;
  const totalMatch = ocrText.match(totalRegex);
  const total = totalMatch ? parseFloat(totalMatch[1]) : 0;
  
  // Extract tax
  const taxRegex = /tax[:\s]*\$?(\d+\.\d{2})/i;
  const taxMatch = ocrText.match(taxRegex);
  const tax = taxMatch ? parseFloat(taxMatch[1]) : 0;
  
  // Extract items
  const items: ReceiptItem[] = [];
  const itemRegex = /(.+?)\s+(\d+)\s*@?\s*\$?(\d+\.\d{2})/g;
  let match;
  
  while ((match = itemRegex.exec(ocrText)) !== null) {
    const [, name, qty, price] = match;
    items.push({
      name: name.trim(),
      quantity: parseInt(qty),
      unitPrice: parseFloat(price),
      totalPrice: parseInt(qty) * parseFloat(price)
    });
  }
  
  const subtotal = total - tax;
  
  return {
    storeName,
    date,
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    ocrText,
    categories: [...new Set(items.map(i => categorizeItem(i.name)))]
  };
};

/**
 * Categorize item based on name
 */
const categorizeItem = (itemName: string): string => {
  const name = itemName.toLowerCase();
  
  if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt')) {
    return 'Dairy';
  }
  if (name.includes('bread') || name.includes('cereal') || name.includes('pasta')) {
    return 'Grains';
  }
  if (name.includes('apple') || name.includes('banana') || name.includes('fruit')) {
    return 'Produce';
  }
  if (name.includes('chicken') || name.includes('beef') || name.includes('meat')) {
    return 'Meat';
  }
  
  return 'General';
};

/**
 * Save scanned receipt
 */
export const saveReceipt = async (receipt: Receipt): Promise<string> => {
  const receiptId = `receipt-${Date.now()}`;
  
  // In production, save to Firebase/AsyncStorage
  console.log('Receipt saved:', receiptId);
  
  return receiptId;
};

/**
 * Get all receipts
 */
export const getReceipts = async (params?: {
  startDate?: Date;
  endDate?: Date;
  storeName?: string;
  minAmount?: number;
  maxAmount?: number;
}): Promise<Receipt[]> => {
  // In production, fetch from storage
  // For now, return mock data
  return [];
};

/**
 * Calculate spending by category
 */
export const getSpendingByCategory = async (
  receipts: Receipt[]
): Promise<{ category: string; amount: number; percentage: number }[]> => {
  const categoryTotals = new Map<string, number>();
  let grandTotal = 0;
  
  receipts.forEach(receipt => {
    receipt.categories.forEach(category => {
      const categoryItems = receipt.items.filter(
        item => categorizeItem(item.name) === category
      );
      const categoryAmount = categoryItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      
      categoryTotals.set(
        category,
        (categoryTotals.get(category) || 0) + categoryAmount
      );
      grandTotal += categoryAmount;
    });
  });
  
  return Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: Math.round((amount / grandTotal) * 100)
    }))
    .sort((a, b) => b.amount - a.amount);
};

/**
 * Create warranty from receipt
 */
export const createWarranty = async (params: {
  receiptId: string;
  productName: string;
  purchaseDate: Date;
  warrantyMonths: number;
  warrantyType: Warranty['warrantyType'];
  storeName: string;
  price: number;
}): Promise<Warranty> => {
  const expiryDate = new Date(params.purchaseDate);
  expiryDate.setMonth(expiryDate.getMonth() + params.warrantyMonths);
  
  const daysRemaining = Math.floor(
    (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  const warranty: Warranty = {
    id: `warranty-${Date.now()}`,
    productName: params.productName,
    purchaseDate: params.purchaseDate,
    expiryDate,
    storeName: params.storeName,
    price: params.price,
    warrantyType: params.warrantyType,
    receiptId: params.receiptId,
    isExpired: daysRemaining <= 0,
    daysRemaining: Math.max(0, daysRemaining)
  };
  
  // Save to storage
  console.log('Warranty created:', warranty.id);
  
  return warranty;
};

/**
 * Get active warranties
 */
export const getActiveWarranties = async (): Promise<Warranty[]> => {
  // In production, fetch from storage
  return [];
};

/**
 * Get expiring warranties (within 30 days)
 */
export const getExpiringWarranties = async (): Promise<Warranty[]> => {
  const all = await getActiveWarranties();
  return all.filter(w => !w.isExpired && w.daysRemaining <= 30);
};

export default {
  parseReceiptText,
  saveReceipt,
  getReceipts,
  getSpendingByCategory,
  createWarranty,
  getActiveWarranties,
  getExpiringWarranties
};
