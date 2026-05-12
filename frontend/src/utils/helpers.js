import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns'

// ── Currency ──────────────────────────────────────────────────────────────────
export function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── Date/Time ──────────────────────────────────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy')
  } catch { return dateStr }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = parseISO(dateStr)
    if (isToday(d))    return `Today, ${format(d, 'hh:mm a')}`
    if (isTomorrow(d)) return `Tomorrow, ${format(d, 'hh:mm a')}`
    return format(d, 'dd MMM yyyy, hh:mm a')
  } catch { return dateStr }
}

export function formatTime(timeStr) {
  if (!timeStr) return '—'
  try {
    const [h, m] = timeStr.split(':')
    const d = new Date(); d.setHours(+h); d.setMinutes(+m)
    return format(d, 'hh:mm a')
  } catch { return timeStr }
}

export function getMinBookingDate() {
  return addDays(new Date(), 1)
}

// ── Booking status ────────────────────────────────────────────────────────────
export const STATUS_CONFIG = {
  pending:    { label: 'Pending',          color: 'badge-amber',  icon: 'hourglass_empty' },
  confirmed:  { label: 'Confirmed',        color: 'badge-blue',   icon: 'check_circle' },
  received:   { label: 'Items Received',   color: 'badge-blue',   icon: 'inventory_2' },
  processing: { label: 'In Progress',      color: 'badge-blue',   icon: 'autorenew' },
  ready:      { label: 'Ready for Pickup', color: 'badge-green',  icon: 'check_circle' },
  completed:  { label: 'Completed',        color: 'badge-slate',  icon: 'done_all' },
  cancelled:  { label: 'Cancelled',        color: 'badge-red',    icon: 'cancel' },
  rejected:   { label: 'Slot Unavailable', color: 'badge-red',    icon: 'event_busy' },
}

export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || { label: status, color: 'badge-slate', icon: 'help' }
}

// ── Payment status ────────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  pending:  { label: 'Pending Payment', color: 'text-amber-600'  },
  paid:     { label: 'Paid',            color: 'text-emerald-600' },
  failed:   { label: 'Payment Failed',  color: 'text-red-600'    },
  refunded: { label: 'Refunded',        color: 'text-slate-500'  },
}

// ── Misc ──────────────────────────────────────────────────────────────────────
export function generateOrderId() {
  return `LAU-${Math.floor(10000 + Math.random() * 90000)}`
}

export function clsx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function truncate(str, n = 40) {
  return str?.length > n ? str.slice(0, n) + '…' : str
}

// ── PDF receipt (client-side using jsPDF) ─────────────────────────────────────
export async function generateReceiptPDF(booking) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const blue = [26, 94, 219]
  const dark = [15, 23, 42]
  const muted = [100, 116, 139]

  // Header
  doc.setFillColor(...blue)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('LASU Viva Laundromat', 20, 20)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Lagos State University Campus, Lagos, Nigeria', 20, 28)
  doc.text('info@lasuivivalaundrmat.com.ng', 20, 35)

  // Receipt title
  doc.setTextColor(...dark)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('BOOKING RECEIPT', 20, 55)

  // Order info box
  doc.setFillColor(238, 246, 255)
  doc.roundedRect(15, 60, 180, 30, 3, 3, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Order #${booking.order_number}`, 20, 72)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...muted)
  doc.text(`Date: ${formatDate(booking.created_at)}`, 20, 80)
  doc.text(`Status: ${booking.status?.toUpperCase()}`, 100, 72)
  doc.text(`Payment: ${booking.payment_method}`, 100, 80)

  // Customer
  doc.setTextColor(...dark)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Customer Details', 20, 102)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...muted)
  doc.text(booking.user_name || 'N/A', 20, 110)
  doc.text(booking.user_email || 'N/A', 20, 117)
  doc.text(booking.user_phone || 'N/A', 20, 124)

  // Items table
  doc.setTextColor(...dark)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Order Items', 20, 140)

  doc.setFillColor(241, 245, 249)
  doc.rect(15, 144, 180, 8, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Item', 20, 150)
  doc.text('Qty', 110, 150)
  doc.text('Price', 140, 150)
  doc.text('Total', 170, 150)

  let y = 162
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...muted)
  for (const item of (booking.items || [])) {
    doc.text(item.clothing_item_name || 'Item', 20, y)
    doc.text(String(item.quantity), 110, y)
    doc.text(`₦${item.unit_price}`, 140, y)
    doc.text(`₦${item.line_total}`, 170, y)
    y += 9
  }

  // Totals
  y += 4
  doc.setDrawColor(...muted)
  doc.line(15, y, 195, y)
  y += 8
  doc.setTextColor(...dark)
  doc.setFontSize(10)
  doc.text('Subtotal:', 130, y)
  doc.text(`₦${booking.subtotal}`, 170, y)
  y += 7
  doc.text('Service Fee:', 130, y)
  doc.text(`₦${booking.service_fee || 0}`, 170, y)
  y += 7
  if (booking.discount > 0) {
    doc.setTextColor(16, 185, 129)
    doc.text('Discount:', 130, y)
    doc.text(`-₦${booking.discount}`, 170, y)
    y += 7
    doc.setTextColor(...dark)
  }
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...blue)
  doc.text('TOTAL:', 130, y + 4)
  doc.text(`₦${booking.total_amount}`, 170, y + 4)

  // Footer
  doc.setFillColor(...dark)
  doc.rect(0, 270, 210, 27, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Present this receipt at the laundry service counter.', 20, 280)
  doc.text('Drop-off: LASU Main Campus Laundry Center', 20, 287)
  doc.text('© 2024 LASU Viva Laundromat. All rights reserved.', 20, 294)

  doc.save(`LASU-Viva-Receipt-${booking.order_number}.pdf`)
}
