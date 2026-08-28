import crypto from 'crypto';

interface CreateTransactionParams {
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

interface TransactionResult {
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

export function getMidtransBaseUrl(): string {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  return isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
}

/**
 * Creates Midtrans Snap transaction token or returns fallback if gateway is not yet configured.
 */
export async function createMidtransTransaction(
  params: CreateTransactionParams
): Promise<TransactionResult> {
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
      first_name: params.customerName,
      email: params.customerEmail,
      phone: params.customerPhone || '08123456789',
    },
    item_details: params.itemDetails.map((item) => ({
      id: item.id.slice(0, 50),
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.name.slice(0, 50),
    })),
    enabled_payments: [
      'gopay',
      'shopeepay',
      'other_qris',
      'bca_va',
      'bni_va',
      'mandiri_va',
      'permata_va',
      'credit_card',
    ],
  };

  try {
    const response = await fetch(getMidtransBaseUrl(), {
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
      console.error('Midtrans API error:', data);
      return {
        isGatewayActive: false,
        orderId: params.orderId,
        message: data.error_messages?.join(', ') || 'Gagal menghubungi server pembayaran',
      };
    }

    return {
      isGatewayActive: true,
      token: data.token,
      redirectUrl: data.redirect_url,
      orderId: params.orderId,
    };
  } catch (error) {
    console.error('Create transaction exception:', error);
    return {
      isGatewayActive: false,
      orderId: params.orderId,
      message: 'Koneksi ke gateway pembayaran gagal',
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
