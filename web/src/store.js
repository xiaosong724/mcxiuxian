import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('ctm_token') || '',
    username: localStorage.getItem('ctm_username') || '',
    xuid: localStorage.getItem('ctm_xuid') || '',
    serverId: localStorage.getItem('ctm_server_id') || '',
    isAdmin: localStorage.getItem('ctm_admin') === '1',
    spiritStone: 0,
  }),
  getters: {
    isLogin: (s) => !!s.token,
  },
  actions: {
    setLogin(data) {
      this.token = data.token
      this.username = data.user.username
      this.xuid = data.user.xuid || ''
      this.serverId = data.user.server_id || ''
      this.isAdmin = !!data.user.is_admin
      localStorage.setItem('ctm_token', data.token)
      localStorage.setItem('ctm_username', this.username)
      localStorage.setItem('ctm_xuid', this.xuid)
      localStorage.setItem('ctm_server_id', this.serverId)
      localStorage.setItem('ctm_admin', this.isAdmin ? '1' : '0')
    },
    logout() {
      this.token = ''
      this.username = ''
      this.xuid = ''
      this.serverId = ''
      this.isAdmin = false
      this.spiritStone = 0
      localStorage.removeItem('ctm_token')
      localStorage.removeItem('ctm_username')
      localStorage.removeItem('ctm_xuid')
      localStorage.removeItem('ctm_server_id')
      localStorage.removeItem('ctm_admin')
    },
  },
})
