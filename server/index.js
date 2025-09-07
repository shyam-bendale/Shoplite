const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { v4: uuid } = require('uuid')
const path = require('path')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'
const PORT = process.env.PORT || 5000

// In-memory stores
const users = [] // { id, name, email, password } - demo only
const items = [
  { id: 1, title: 'Red T-Shirt', category: 'Apparel', price: 499, image: '/uploads/Red T-Shirt.jpg' },
  { id: 2, title: 'Blue Jeans', category: 'Apparel', price: 1499, image: '/uploads/Blue Jeans.webp' },
  { id: 3, title: 'Sneakers', category: 'Footwear', price: 2499, image: '/uploads/Sneakers.webp' },
  { id: 4, title: 'Running Shoes', category: 'Footwear', price: 3299, image: '/uploads/Running Shoes.jpg' },
  { id: 5, title: 'Smart Watch', category: 'Gadgets', price: 4999, image: '/uploads/Smart Watch.webp' },
  { id: 6, title: 'Wireless Earbuds', category: 'Gadgets', price: 1999, image: '/uploads/Wireless Earbuds.jpg' },
  { id: 7, title: 'Leather Jacket', category: 'Apparel', price: 3999, image: '/uploads/Leather Jacket.jpg' },
  { id: 8, title: 'Hoodie', category: 'Apparel', price: 1299, image: '/uploads/Hoodie.webp' },
  { id: 9, title: 'Formal Shoes', category: 'Footwear', price: 2799, image: '/uploads/Formal Shoes.webp' },
  { id: 10, title: 'Sandals', category: 'Footwear', price: 899, image: '/uploads/Sandals.webp' },
  { id: 11, title: 'Bluetooth Speaker', category: 'Gadgets', price: 2499, image: '/uploads/Bluetooth Speaker.webp' },
  { id: 12, title: 'Power Bank', category: 'Gadgets', price: 1299, image: '/uploads/Power Bank.jpg' },
  { id: 13, title: 'Backpack', category: 'Accessories', price: 1599, image: '/uploads/Backpack.webp' },
  { id: 14, title: 'Sunglasses', category: 'Accessories', price: 899, image: '/uploads/Sunglasses.webp' },
  { id: 15, title: 'Desk Lamp', category: 'Home', price: 1199, image: '/uploads/Desk Lamp.avif' },
  { id: 16, title: 'Water Bottle', category: 'Home', price: 499, image: '/uploads/Water Bottle.webp' },
]
const carts = new Map() // userId -> [{ itemId, qty }]

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Root route for quick sanity check
app.get('/', (req, res) => {
  res.send('ShopLite API is running. Try /api/items or /api/auth/login')
})

function signToken(user){
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
}
function auth(req,res,next){
  const hdr = req.headers.authorization || ''
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null
  if(!token) return res.status(401).json({ error: 'Missing token' })
  try{
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = { id: payload.sub, email: payload.email, name: payload.name }
    next()
  }catch(e){
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Auth
app.post('/api/auth/signup', (req,res)=>{
  const { name, email, password } = req.body || {}
  if(!email || !password) return res.status(400).json({ error: 'email and password required' })
  if(users.find(u=>u.email===email)) return res.status(400).json({ error: 'email already exists' })
  const user = { id: uuid(), name: name || email.split('@')[0], email, password }
  users.push(user)
  const token = signToken(user)
  res.json({ user: { id: user.id, name: user.name, email: user.email }, token })
})
app.post('/api/auth/login', (req,res)=>{
  const { email, password } = req.body || {}
  const user = users.find(u=>u.email===email && u.password===password)
  if(!user) return res.status(401).json({ error: 'invalid credentials' })
  const token = signToken(user)
  res.json({ user: { id: user.id, name: user.name, email: user.email }, token })
})

// Items CRUD
app.get('/api/items', (req,res)=>{
  const { q, category, maxPrice } = req.query
  let list = [...items]
  if(q) list = list.filter(p=> p.title.toLowerCase().includes(String(q).toLowerCase()))
  if(category) list = list.filter(p=> p.category === category)
  if(maxPrice) list = list.filter(p=> p.price <= Number(maxPrice))
  res.json(list)
})
app.get('/api/items/:id', (req,res)=>{
  const id = Number(req.params.id)
  const item = items.find(p=> p.id===id)
  if(!item) return res.status(404).json({ error: 'not found' })
  res.json(item)
})
app.post('/api/items', auth, (req,res)=>{
  const { title, category, price, image } = req.body || {}
  if(!title || !category || price==null) return res.status(400).json({ error: 'title, category, price required' })
  const id = items.length ? Math.max(...items.map(x=>x.id)) + 1 : 1
  const created = { id, title, category, price: Number(price), image: image || `https://picsum.photos/seed/${id}/320/180` }
  items.push(created)
  res.status(201).json(created)
})
app.put('/api/items/:id', auth, (req,res)=>{
  const id = Number(req.params.id)
  const idx = items.findIndex(p=> p.id===id)
  if(idx<0) return res.status(404).json({ error: 'not found' })
  items[idx] = { ...items[idx], ...req.body, id }
  res.json(items[idx])
})
app.delete('/api/items/:id', auth, (req,res)=>{
  const id = Number(req.params.id)
  const idx = items.findIndex(p=> p.id===id)
  if(idx<0) return res.status(404).json({ error: 'not found' })
  const [removed] = items.splice(idx,1)
  res.json(removed)
})

// Cart
app.get('/api/cart', auth, (req,res)=>{
  const list = carts.get(req.user.id) || []
  res.json(list)
})
app.post('/api/cart/add', auth, (req,res)=>{
  const { itemId, qty=1 } = req.body || {}
  if(!itemId) return res.status(400).json({ error: 'itemId required' })
  const list = carts.get(req.user.id) || []
  const found = list.find(x=> x.itemId===itemId)
  if(found) found.qty += qty
  else list.push({ itemId, qty })
  carts.set(req.user.id, list)
  res.json(list)
})
app.post('/api/cart/update', auth, (req,res)=>{
  const { itemId, qty } = req.body || {}
  if(!itemId || qty==null) return res.status(400).json({ error: 'itemId and qty required' })
  let list = carts.get(req.user.id) || []
  list = list.map(x=> x.itemId===itemId ? { ...x, qty: Number(qty) } : x).filter(x=> x.qty>0)
  carts.set(req.user.id, list)
  res.json(list)
})
app.post('/api/cart/remove', auth, (req,res)=>{
  const { itemId } = req.body || {}
  if(!itemId) return res.status(400).json({ error: 'itemId required' })
  const list = (carts.get(req.user.id) || []).filter(x=> x.itemId!==itemId)
  carts.set(req.user.id, list)
  res.json(list)
})

// Demo checkout: creates a simple order summary and clears cart
app.post('/api/checkout', auth, (req,res)=>{
  const list = carts.get(req.user.id) || []
  const find = id => items.find(p=> p.id === id) || {}
  const total = list.reduce((s,i)=> s + (find(i.itemId).price||0)*i.qty, 0)
  const orderId = uuid()
  carts.set(req.user.id, [])
  res.json({ orderId, total, items: list })
})

app.listen(PORT, ()=>{
  console.log(`API listening on http://localhost:${PORT}`)
})


