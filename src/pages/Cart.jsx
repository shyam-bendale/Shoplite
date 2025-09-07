import React, { useEffect, useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { useApi } from '../api'


export default function Cart(){
const { items, update, remove, clear } = useCart()
const api = useApi()
const [products, setProducts] = useState([])
const [orderMsg, setOrderMsg] = useState('')


useEffect(()=>{ (async()=>{ const list = await api.items(); setProducts(list) })() }, [])
const get = id => products.find(p=>p.id===id) || {}
const total = items.reduce((s,i)=> s + (get(i.itemId).price||0) * i.qty, 0)


return (
<div className="grid lg:grid-cols-3 gap-6">
<div className="lg:col-span-2 bg-white p-4 rounded-2xl">
{items.length===0 ? <div>Your cart is empty</div> : <ul>{items.map(i=> (
<li key={i.itemId} className="flex items-center gap-4">
<img src={get(i.itemId).image} alt="" className="w-20 h-16 object-cover rounded" />
<div className="flex-1">
<div>{get(i.itemId).title}</div>
<div>₹{get(i.itemId).price}</div>
</div>
<div className="flex items-center gap-2">
<button onClick={()=>update(i.itemId, Math.max(1, i.qty-1))}>-</button>
<input value={i.qty} onChange={e=>update(i.itemId, Math.max(1, Number(e.target.value)||1))} className="w-12 text-center" />
<button onClick={()=>update(i.itemId, i.qty+1)}>+</button>
</div>
<div>₹{(get(i.itemId).price||0)*i.qty}</div>
<button onClick={()=>remove(i.itemId)}>Remove</button>
</li>
))}</ul>}
</div>
<aside className="bg-white p-4 rounded-2xl">
<h3>Summary</h3>
<div>Subtotal: ₹{total}</div>
{orderMsg && <div className="mt-2">{orderMsg}</div>}
<button disabled={!items.length} onClick={async()=>{
  try{
    const res = await api.checkout()
    setOrderMsg(`Order ${res.orderId} placed! Total ₹${res.total}`)
    clear()
  }catch(e){ setOrderMsg('Checkout failed') }
}}>Checkout (demo)</button>
<button onClick={clear}>Clear</button>
</aside>
</div>
)
}