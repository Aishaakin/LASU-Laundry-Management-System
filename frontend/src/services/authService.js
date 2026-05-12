import api from './api'

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register/', data)
    return res.data
  },

  async login(email, password) {
    const res = await api.post('/auth/login/', { email, password })
    return res.data
  },

  async logout(refresh) {
    const res = await api.post('/auth/logout/', { refresh })
    return res.data
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/password/reset/', { email })
    return res.data
  },

  async resetPassword(uid, token, newPassword, confirmPassword) {
    const res = await api.post('/auth/password/reset/confirm/', {
      uid, token, new_password: newPassword, confirm_password: confirmPassword,
    })
    return res.data
  },

  async changePassword(currentPassword, newPassword) {
    const res = await api.post('/auth/password/change/', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return res.data
  },

  async getProfile() {
    const res = await api.get('/auth/profile/')
    return res.data
  },

  async updateProfile(data) {
    const res = await api.patch('/auth/profile/', data)
    return res.data
  },
}
