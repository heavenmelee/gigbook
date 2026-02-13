const apiKey = process.env.XENDIT_API_KEY;
if (!apiKey) {
  throw new Error("XENDIT_API_KEY environment variable is not set");
}

const XENDIT_BASE_URL = "https://api.xendit.co";

/**
 * Make authenticated request to Xendit API
 */
async function xenditRequest<T>(method: string, path: string, body?: any): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
  };

  const url = `${XENDIT_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Xendit API error: ${error.message || response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`[Xendit] ${method} ${path} failed:`, error);
    throw error;
  }
}

/**
 * Create a Xendit invoice for booking payment
 */
export async function createInvoice(params: {
  bookingId: number;
  userId: number;
  musicianId: number;
  amount: number;
  commissionPercentage: number;
  description: string;
  expiryDays?: number;
}) {
  const { bookingId, userId, musicianId, amount, commissionPercentage, description, expiryDays = 7 } = params;

  const commissionAmount = (amount * commissionPercentage) / 100;
  const musicianPayoutAmount = amount - commissionAmount;

  try {
    const invoiceData = {
      externalId: `gigbook-booking-${bookingId}-${Date.now()}`,
      amount: Math.round(amount * 100) / 100,
      description,
      invoiceDuration: expiryDays * 24 * 60 * 60,
      customer: {
        givenNames: `User ${userId}`,
        email: `user${userId}@gigbook.local`,
      },
      items: [
        {
          name: "Booking Service",
          quantity: 1,
          price: Math.round(amount * 100) / 100,
        },
      ],
      successRedirectUrl: "gigbook://payment-success",
      failureRedirectUrl: "gigbook://payment-failed",
    };

    console.log("[Xendit] Creating invoice with data:", invoiceData);
    const response = await xenditRequest<any>("POST", "/v2/invoices", invoiceData);

    console.log("[Xendit] Invoice created:", response);

    return {
      xenditInvoiceId: response.id,
      invoiceUrl: response.invoiceUrl,
      expiresAt: new Date(response.expiryDate),
      amount,
      commissionAmount,
      musicianPayoutAmount,
    };
  } catch (error) {
    console.error("[Xendit] Error creating invoice:", error);
    throw new Error(`Failed to create Xendit invoice: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get invoice status from Xendit
 */
export async function getInvoiceStatus(invoiceId: string) {
  try {
    const response = await xenditRequest<any>("GET", `/v2/invoices/${invoiceId}`);

    console.log("[Xendit] Invoice status:", response);

    return {
      status: response.status,
      paidAt: response.paidAt,
      paymentMethod: response.paymentMethod,
    };
  } catch (error) {
    console.error("[Xendit] Error getting invoice status:", error);
    throw new Error(`Failed to get invoice status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create a payout to musician's bank account
 */
export async function createPayout(params: {
  musicianId: number;
  amount: number;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  description?: string;
}) {
  const { musicianId, amount, bankCode, bankAccountNumber, bankAccountHolder, description } = params;

  try {
    const payoutData = {
      externalId: `gigbook-payout-${musicianId}-${Date.now()}`,
      amount: Math.round(amount * 100) / 100,
      bankCode,
      accountNumber: bankAccountNumber,
      accountHolderName: bankAccountHolder,
      description: description || "Gigbook Musician Payout",
      emailTo: `musician${musicianId}@gigbook.local`,
    };

    console.log("[Xendit] Creating payout with data:", payoutData);
    const response = await xenditRequest<any>("POST", "/payouts", payoutData);

    console.log("[Xendit] Payout created:", response);

    return {
      xenditPayoutId: response.id,
      status: response.status,
      amount,
    };
  } catch (error) {
    console.error("[Xendit] Error creating payout:", error);
    throw new Error(`Failed to create payout: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get payout status from Xendit
 */
export async function getPayoutStatus(payoutId: string) {
  try {
    const response = await xenditRequest<any>("GET", `/payouts/${payoutId}`);

    console.log("[Xendit] Payout status:", response);

    return {
      status: response.status,
      failureCode: response.failureCode,
      failureMessage: response.failureMessage,
      completedAt: response.completedAt,
    };
  } catch (error) {
    console.error("[Xendit] Error getting payout status:", error);
    throw new Error(`Failed to get payout status: ${error instanceof Error ? error.message : String(error)}`);
  }
}
