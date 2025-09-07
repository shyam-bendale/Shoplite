import React, { useEffect, useMemo, useState } from 'react'
import { useApi } from '../api'
import { useCart } from '../contexts/CartContext'

function Products(){
const api = useApi()
const { add } = useCart()
const [products, setProducts] = useState([])
const [q, setQ] = useState('')
const [category, setCategory] = useState('All')
const [maxPrice, setMaxPrice] = useState('')

useEffect(()=>{ (async()=>{ const list = await api.items(); setProducts(list) })() }, [])

const categories = useMemo(()=> ['All', ...Array.from(new Set(products.map(p=>p.category)))], [products])
const filtered = useMemo(()=> products.filter(p=>{
  const okQ = !q || p.title.toLowerCase().includes(q.toLowerCase())
  const okCat = category==='All' || p.category===category
  const okPrice = !maxPrice || p.price <= Number(maxPrice)
  return okQ && okCat && okPrice
}), [products, q, category, maxPrice])

return (
<div className="grid lg:grid-cols-4 gap-6">
  <aside className="bg-white p-4 rounded-2xl">
    <h3>Filters</h3>
    <div>
      <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} />
    </div>
    <div>
      <label>Category</label>
      <select value={category} onChange={e=>setCategory(e.target.value)}>
        {categories.map(c=> <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
    <div>
      <label>Max Price</label>
      <input type="number" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="e.g. 2000" />
    </div>
  </aside>
  <section className="lg:col-span-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {filtered.map(p=> (
      <div key={p.id} className="bg-white p-3 rounded-2xl">
        {(() => {
          if(p.image && p.image.startsWith('/uploads/')){
            const name = p.image.slice('/uploads/'.length)
            const url = `http://localhost:5000/uploads/${encodeURIComponent(name)}`
            return <img src={url} alt={p.title} className="w-full h-40 object-contain rounded" />
          }
          return <img src={p.image} alt={p.title} className="w-full h-40 object-contain rounded" />
        })()}
        <div className="mt-2 font-semibold">{p.title}</div>
        <div className="text-sm text-gray-500">{p.category}</div>
        <div className="mt-1">₹{p.price}</div>
        <button className="mt-2" onClick={()=>add(p.id, 1)}>Add to cart</button>
      </div>
    ))}
  </section>
</div>
)
}

export default Products
