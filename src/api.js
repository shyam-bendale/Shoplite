// API hook backed by backend with graceful mock fallback
import { useMemo } from 'react'
import axios from 'axios'

const MOCK_PRODUCTS = [
  { id: 1, title: 'Red T-Shirt', category: 'Apparel', price: 499, image: '/uploads/Red T-Shirt.jpg' },
  { id: 2, title: 'Blue Jeans', category: 'Apparel', price: 1499, image: '/uploads/Blue Jeans.webp' },
  { id: 3, title: 'Sneakers', category: 'Footwear', price: 2499, image: '/uploads/Sneakers.jpg' },
  { id: 4, title: 'Running Shoes', category: 'Footwear', price: 3299, image: '/uploads/Running Shoes.jpg' },
  { id: 5, title: 'Smart Watch', category: 'Gadgets', price: 4999, image: '/uploads/Smart Watch.jpg' },
  { id: 6, title: 'Wireless Earbuds', category: 'Gadgets', price: 1999, image: '/uploads/Wireless Earbuds.jpg' },
  { id: 7, title: 'Leather Jacket', category: 'Apparel', price: 3999, image: '/uploads/Leather Jacket.jpg' },
  { id: 8, title: 'Hoodie', category: 'Apparel', price: 1299, image: '/uploads/Hoodie.jpg' },
  { id: 9, title: 'Formal Shoes', category: 'Footwear', price: 2799, image: '/uploads/Formal Shoes.jpg' },
  { id: 10, title: 'Sandals', category: 'Footwear', price: 899, image: '/uploads/Sandals.jpg' },
  { id: 11, title: 'Bluetooth Speaker', category: 'Gadgets', price: 2499, image: '/uploads/Bluetooth Speaker.jpg' },
  { id: 12, title: 'Power Bank', category: 'Gadgets', price: 1299, image: '/uploads/Power Bank.jpg' },
  { id: 13, title: 'Backpack', category: 'Accessories', price: 1599, image: '/uploads/Backpack.jpg' },
  { id: 14, title: 'Sunglasses', category: 'Accessories', price: 899, image: '/uploads/Sunglasses.jpg' },
  { id: 15, title: 'Desk Lamp', category: 'Home', price: 1199, image: '/uploads/Desk Lamp.jpg' },
  { id: 16, title: 'Water Bottle', category: 'Home', price: 499, image: '/uploads/Water Bottle.jpg' },
]

const client = axios.create({ baseURL: 'http://localhost:5000/api' })
client.interceptors.request.use(cfg=>{
  const raw = localStorage.getItem('jwt') || localStorage.getItem('token')
  if(raw){
    let token = null
    try{
      const parsed = JSON.parse(raw)
      // parsed can be a string ("tokenstring") or an object { token: "..." }
      token = typeof parsed === 'string' ? parsed : parsed?.token
    }catch{
      token = raw
    }
    if(token) cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
})

export function useApi(){
  return useMemo(()=>({
    // Auth
    async login({ email, password }){
      const { data } = await client.post('/auth/login', { email, password })
      return data
    },
    async signup({ name, email, password }){
      const { data } = await client.post('/auth/signup', { name, email, password })
      return data
    },

    // Products
    async items(params){
      try{
        const { data } = await client.get('/items', { params })
        return data
      }catch{
        return MOCK_PRODUCTS
      }
    },
    async itemCreate(payload){ const { data } = await client.post('/items', payload); return data },
    async itemUpdate(id, payload){ const { data } = await client.put(`/items/${id}`, payload); return data },
    async itemDelete(id){ const { data } = await client.delete(`/items/${id}`); return data },

    // Cart
    async cartGet(){ try{ const { data } = await client.get('/cart'); return data }catch{ return null } },
    async cartAdd(payload){ try{ const { data } = await client.post('/cart/add', payload); return data }catch{ return true } },
    async cartUpdate(payload){ try{ const { data } = await client.post('/cart/update', payload); return data }catch{ return true } },
    async cartRemove(payload){ try{ const { data } = await client.post('/cart/remove', payload); return data }catch{ return true } },
    async checkout(){ const { data } = await client.post('/checkout'); return data },

    set token(v){ if(!v) localStorage.removeItem('jwt'); else localStorage.setItem('jwt', JSON.stringify(v)) },
  }), [])
}

export default null
