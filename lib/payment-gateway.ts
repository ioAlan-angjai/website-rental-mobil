import crypto from 'crypto';

export type CorePaymentMethod =
  | 'QRIS'
  | 'BCA_VA'
  | 'BNI_VA'
  | 'BRI_VA'
  | 'MANDIRI_BILL';

export interface CoreChargeParams {
  bookingId: string;
  orderId: string;
  grossAmount: number;
  paymentMethod: CorePaymentMethod;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  itemName: string;
  itemId: string;
}

export interface CoreChargeResult {
  success: boolean;
  orderId: string;
  transactionId?: string;
  transactionStatus?: string;
  paymentMethod: CorePaymentMethod;
  grossAmount: number;
  expiryTime?: string;
  // QRIS Specific
  qrString?: string;
  qrImageUrl?: string;
  // VA Specific
  vaNumber?: string;
  bankName?: string;
  // Mandiri Specific
  billerCode?: string;
  billKey?: string;
  // General / Error
  message?: string;
}

export interface CreateTransactionParams {
  bookingId: string;
  orderId: string;
  grossAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  itemDetails: {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }[];
}

export interface CreateTransactionResult {
  isGatewayActive: boolean;
  token?: string;
  redirectUrl?: string;
  orderId: string;
  message?: string;
}

export function isMidtransConfigured(): boolean {
  const key = process.env.MIDTRANS_SERVER_KEY;
  return Boolean(key && !key.startsWith('mock-') && key.trim().length > 10);
}

export function getMidtransSnapBaseUrl(): string {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  return isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
}

export function getMidtransCoreApiBaseUrl(): string {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  return isProduction
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com';
}

/**
 * Create a Snap transaction session token
 */
export async function createMidtransTransaction(
  params: CreateTransactionParams
): Promise<CreateTransactionResult> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

  if (!isMidtransConfigured()) {
    return {
      isGatewayActive: false,
      orderId: params.orderId,
      message: 'Payment gateway belum dikonfigurasi. Silakan gunakan metode Transfer Bank Manual.',
    };
  }

  const authString = Buffer.from(`${serverKey}:`).toString('base64');
  const payload = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: Math.round(params.grossAmount),
    },
    customer_details: {
      first_name: params.customerName.slice(0, 50),
      email: params.customerEmail,
      phone: params.customerPhone || '08123456789',
    },
    item_details: params.itemDetails.map((item) => ({
      id: item.id.slice(0, 50),
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.name.slice(0, 50),
    })),
  };

  try {
    const response = await fetch(getMidtransSnapBaseUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Midtrans Snap API error:', data);
      return {
        isGatewayActive: false,
        orderId: params.orderId,
        message: data.error_messages?.join(', ') || 'Gagal menghubungi server pembayaran Snap',
      };
    }

    return {
      isGatewayActive: true,
      token: data.token,
      redirectUrl: data.redirect_url,
      orderId: params.orderId,
    };
  } catch (error) {
    console.error('Create Snap transaction exception:', error);
    return {
      isGatewayActive: false,
      orderId: params.orderId,
      message: 'Koneksi ke gateway pembayaran gagal',
    };
  }
}

/**
 * Charge transaction via Midtrans Core API (Sandbox)
 */
export async function chargeMidtransCoreApi(
  params: CoreChargeParams
): Promise<CoreChargeResult> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

  if (!isMidtransConfigured()) {
    return {
      success: false,
      orderId: params.orderId,
      paymentMethod: params.paymentMethod,
      grossAmount: params.grossAmount,
      message: 'Payment gateway belum dikonfigurasi di server. Silakan hubungi admin.',
    };
  }

  const authString = Buffer.from(`${serverKey}:`).toString('base64');
  const roundedAmount = Math.round(params.grossAmount);

  // Base payload
  const basePayload: any = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: roundedAmount,
    },
    customer_details: {
      first_name: params.customerName.slice(0, 50),
      email: params.customerEmail,
      phone: params.customerPhone || '08123456789',
    },
    item_details: [
      {
        id: params.itemId.slice(0, 50),
        price: roundedAmount,
        quantity: 1,
        name: params.itemName.slice(0, 50),
      },
    ],
  };

  // Method specific payload
  if (params.paymentMethod === 'QRIS') {
    basePayload.payment_type = 'qris';
    basePayload.qris = {
      acquirer: 'gopay',
    };
  } else if (params.paymentMethod === 'BCA_VA') {
    basePayload.payment_type = 'bank_transfer';
    basePayload.bank_transfer = {
      bank: 'bca',
    };
  } else if (params.paymentMethod === 'BNI_VA') {
    basePayload.payment_type = 'bank_transfer';
    basePayload.bank_transfer = {
      bank: 'bni',
    };
  } else if (params.paymentMethod === 'BRI_VA') {
    basePayload.payment_type = 'bank_transfer';
    basePayload.bank_transfer = {
      bank: 'bri',
    };
  } else if (params.paymentMethod === 'MANDIRI_BILL') {
    basePayload.payment_type = 'echannel';
    basePayload.echannel = {
      bill_info1: 'Sewa Mobil',
      bill_info2: 'Pembayaran Rental',
    };
  } else {
    return {
      success: false,
      orderId: params.orderId,
      paymentMethod: params.paymentMethod,
      grossAmount: roundedAmount,
      message: `Metode pembayaran ${params.paymentMethod} tidak didukung.`,
    };
  }

  try {
    const res = await fetch(`${getMidtransCoreApiBaseUrl()}/v2/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(basePayload),
    });

    const data = await res.json();

    if (!res.ok || (data.status_code && !data.status_code.startsWith('2'))) {
      console.error('Midtrans Core API Charge Error:', data);
      return {
        success: false,
        orderId: params.orderId,
        paymentMethod: params.paymentMethod,
        grossAmount: roundedAmount,
        message: data.status_message || data.error_messages?.join(', ') || 'Gagal memproses transaksi di gateway pembayaran.',
      };
    }

    const result: CoreChargeResult = {
      success: true,
      orderId: data.order_id || params.orderId,
      transactionId: data.transaction_id,
      transactionStatus: data.transaction_status || 'pending',
      paymentMethod: params.paymentMethod,
      grossAmount: roundedAmount,
      expiryTime: data.expiry_time,
    };

    // Parse QRIS
    if (params.paymentMethod === 'QRIS') {
      result.qrString = data.qr_string;
      const qrAction = data.actions?.find((a: any) => a.name === 'generate-qr-code');
      if (qrAction?.url) {
        result.qrImageUrl = qrAction.url;
      }
    }

    // Parse Virtual Account
    if (['BCA_VA', 'BNI_VA', 'BRI_VA'].includes(params.paymentMethod)) {
      if (data.va_numbers && data.va_numbers.length > 0) {
        result.vaNumber = data.va_numbers[0].va_number;
        result.bankName = data.va_numbers[0].bank?.toUpperCase();
      } else if (data.permata_va_number) {
        result.vaNumber = data.permata_va_number;
        result.bankName = 'PERMATA';
      }
    }

    // Parse Mandiri Bill Payment
    if (params.paymentMethod === 'MANDIRI_BILL') {
      result.billerCode = data.biller_code;
      result.billKey = data.bill_key;
      result.bankName = 'MANDIRI';
    }

    return result;
  } catch (error: any) {
    console.error('Midtrans charge exception:', error);
    return {
      success: false,
      orderId: params.orderId,
      paymentMethod: params.paymentMethod,
      grossAmount: roundedAmount,
      message: 'Gagal terhubung ke server Midtrans. Periksa koneksi atau kredensial server.',
    };
  }
}

/**
 * Get Transaction Status directly from Midtrans Core API Sandbox
 */
export async function getMidtransTransactionStatus(orderId: string): Promise<{
  success: boolean;
  statusCode?: string;
  transactionStatus?: string;
  fraudStatus?: string;
  paymentType?: string;
  grossAmount?: string;
  settlementTime?: string;
  raw?: any;
  message?: string;
}> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

  if (!isMidtransConfigured()) {
    return { success: false, message: 'Midtrans belum dikonfigurasi.' };
  }

  const authString = Buffer.from(`${serverKey}:`).toString('base64');

  try {
    const res = await fetch(`${getMidtransCoreApiBaseUrl()}/v2/${encodeURIComponent(orderId)}/status`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${authString}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        statusCode: data.status_code,
        message: data.status_message || 'Gagal mengambil status transaksi',
        raw: data,
      };
    }

    return {
      success: true,
      statusCode: data.status_code,
      transactionStatus: data.transaction_status,
      fraudStatus: data.fraud_status,
      paymentType: data.payment_type,
      grossAmount: data.gross_amount,
      settlementTime: data.settlement_time,
      raw: data,
    };
  } catch (err: any) {
    console.error('Get transaction status exception:', err);
    return {
      success: false,
      message: 'Koneksi ke Midtrans gagal saat memeriksa status transaksi.',
    };
  }
}

/**
 * Validates Midtrans Webhook Signature
 * SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');

  return hash === signatureKey;
}
