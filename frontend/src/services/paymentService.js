import api from './api'

export const paymentService = {
  // Initiate Paystack payment
  async initiatePayment(bookingId, email, amount) {
    const res = await api.post('/payment/initiate/', {
      booking_id: bookingId,
      email,
      amount,    // in kobo (amount * 100)
    })
    return res.data  // returns { authorization_url, reference }
  },

  // Verify payment after redirect
  async verifyPayment(reference) {
    const res = await api.post('/payment/verify/', { reference })
    return res.data
  },

  // Request PDF receipt download URL
  async downloadReceipt(bookingId) {
    const res = await api.get(`/payment/receipt/${bookingId}/pdf/`, {
      responseType: 'blob',
    })
    return res.data
  },

  async getPaymentHistory() {
    const res = await api.get('/payment/history/')
    return res.data
  },
}

// Helper: open Paystack popup inline (alternative to redirect)
export function openPaystackPopup({ publicKey, email, amount, reference, onSuccess, onClose }) {
  const handler = window.PaystackPop?.setup({
    key: publicKey,
    email,
    amount: amount * 100, // kobo
    ref: reference,
    currency: 'NGN',
    callback: (response) => onSuccess(response),
    onClose: () => onClose?.(),
  })
  handler?.openIframe()
}
