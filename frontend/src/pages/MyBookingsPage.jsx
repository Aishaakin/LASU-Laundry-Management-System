//mybookingPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "../services/bookingService";
import { formatNaira, formatDate, getStatusConfig } from "../utils/helpers";
import { generateReceiptPDF } from "../utils/helpers";
import toast from "react-hot-toast";
import api from '../services/api';

function BookingCard({ booking }) {
  const s  = getStatusConfig(booking.status);
  const qc = useQueryClient();

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.post(`/bookings/${booking.id}/cancel/`);
      toast.success('Booking cancelled successfully');
      qc.invalidateQueries(['my-bookings']);
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not cancel. Please contact support.';
      toast.error(msg);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      await generateReceiptPDF(booking);
      toast.success("Receipt downloaded!");
    } catch {
      toast.error("Could not generate PDF.");
    }
  };

  // Allow cancel for pending or confirmed bookings (case-insensitive)
  const canCancel = ['pending', 'confirmed'].includes(booking.status?.toLowerCase());

  return (
    <div className="card overflow-hidden hover:shadow-card-lg transition-all">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-44 bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center py-8 sm:py-0 flex-shrink-0">
          <span className="text-5xl">🧺</span>
        </div>
        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <span className={`${s.color} mb-2 inline-flex`}>{s.label}</span>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Order #{booking.order_number}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">{booking.service_name}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary-600 font-display">
                {formatNaira(booking.total_amount)}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {formatDate(booking.created_at)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>Drop-off: {booking.scheduled_date} at {booking.scheduled_time}</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={handleDownload} className="btn-ghost text-xs py-2 px-3">
                <span className="material-symbols-outlined text-sm">receipt_long</span> Receipt
              </button>

              {canCancel && (
                <button
                  onClick={handleCancel}
                  className="btn-ghost text-xs py-2 px-3 text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span> Cancel
                </button>
              )}

              <Link to={`/bookings/${booking.id}`} className="btn-primary text-xs py-2 px-4">
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const [tab, setTab] = useState("current");

  const { data: allBookings = [], isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn:  () => bookingService.getMyBookings(),
  });

  const bookings  = Array.isArray(allBookings) ? allBookings : [];
  const current   = bookings.filter(b =>
    ["pending", "confirmed", "received", "processing", "ready"].includes(b.status?.toLowerCase())
  );
  const past      = bookings.filter(b =>
    ["completed", "cancelled"].includes(b.status?.toLowerCase())
  );
  const displayed = tab === "current" ? current : past;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-display">My Bookings</h1>
        <p className="text-slate-500 mt-1">Track and manage your LASU Viva laundry orders.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {[["current", "Current Orders"], ["past", "Past Orders"]].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              tab === k
                ? "text-primary-600 border-primary-600"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            {label}
            {k === "current" && current.length > 0 && (
              <span className="ml-2 bg-primary-100 text-primary-700 text-xs px-1.5 py-0.5 rounded-full font-bold">
                {current.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card h-32 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="card p-16 text-center">
          <span className="text-6xl block mb-4">🧺</span>
          <h3 className="text-xl font-bold text-slate-800 mb-2 font-display">
            No {tab === "current" ? "active" : "past"} bookings
          </h3>
          <p className="text-slate-500 mb-6">
            {tab === "current"
              ? "You don't have any active orders."
              : "Your completed orders will appear here."}
          </p>
          {tab === "current" && (
            <Link to="/services" className="btn-primary">Book a Service</Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(b => <BookingCard key={b.id} booking={b} />)}
        </div>
      )}
    </div>
  );
}
