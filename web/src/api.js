// API 请求封装
const BASE = '/api'

function getToken() {
  return localStorage.getItem('ctm_token') || ''
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getToken()
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(BASE + path, { ...options, headers })
  let data
  try { data = await res.json() } catch (e) { data = { code: -1, msg: '服务器响应异常' } }
  if (!res.ok && res.status === 401 && path !== '/auth/login') {
    localStorage.removeItem('ctm_token')
  }
  return data
}

export const api = {
  // 排行榜（realm境界/stone灵石/alchemy炼丹师）
  getRank: (type, limit = 20) => request(`/rank?type=${type}&limit=${limit}`),
  // 认证
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  // 商品
  // 商品（分页，默认每页20；serverId 空=全部，需开启跨服才显示；type=pill/herb/core/bag）
  getItems: (serverId, type, page = 1, pageSize = 20) => request(`/items?serverId=${encodeURIComponent(serverId || '')}&type=${encodeURIComponent(type || '')}&page=${page}&pageSize=${pageSize}`),
  getItem: (id) => request(`/items/${id}`),
  getServers: () => request('/settings/servers'),
  offItem: (id) => request(`/items/${id}/off`, { method: 'POST' }),
  deleteItem: (id) => request(`/items/${id}/delete`, { method: 'POST' }),
  // 卖家自己的全部商品（含下架状态）
  getSellerItems: (username) => request(`/items/seller/${encodeURIComponent(username)}`),
  // 购买/卖出记录（分页，默认每页20）
  getMyBought: (page = 1) => request(`/orders/my-bought?page=${page}`),
  getMySold: (page = 1) => request(`/orders/my-sold?page=${page}`),
  // 卖家修仙信息
  getProfile: (username) => request(`/profiles/${encodeURIComponent(username)}`),
  // 自己修仙信息（含灵石）
  getMyProfile: () => request('/profiles/me'),
  // 购物车
  getCart: () => request('/cart'),
  addCart: (itemId, quantity) => request('/cart', { method: 'POST', body: JSON.stringify({ itemId, quantity }) }),
  removeCart: (cartId) => request(`/cart/${cartId}`, { method: 'DELETE' }),
}
