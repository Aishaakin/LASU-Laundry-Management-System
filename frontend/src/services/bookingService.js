import api from "./api";

function normalizeListResponse(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

export const bookingService = {
  async getServices() {
    const res = await api.get("/services/");
    return normalizeListResponse(res.data);
  },

  async getClothingItems(category) {
    const params = category ? { category } : {};
    const res = await api.get("/items/", { params });
    return normalizeListResponse(res.data);
  },

  async createBooking(data) {
    const res = await api.post("/bookings/create/", data);
    return res.data;
  },

  async getMyBookings(status) {
    const params = status ? { status } : {};
    const res = await api.get("/bookings/", { params });
    const data = res.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async getBookingDetail(id) {
    const res = await api.get(`/bookings/${id}/`);
    return res.data;
  },

  async validatePromo(code) {
    const res = await api.post("/promos/validate/", { code });
    return res.data;
  },

  async getAvailableSlots(date) {
    const res = await api.get("/bookings/available-slots/", {
      params: { date },
    });
    return res.data;
  },

  async getSavedLocations() {
    const res = await api.get("/profile/locations/");
    return res.data;
  },

  async getDashboardStats() {
    const res = await api.get("/dashboard/");
    return res.data;
  },
};
