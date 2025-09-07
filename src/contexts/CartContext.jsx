import React, { createContext, useContext, useState, useEffect } from 'react'
import { useApi } from '../api'


const CartCtx = createContext(null)
export const useCart = ()=> useContext(CartCtx)


export function CartProvider({ children }){
const api = useApi()
const key = 'cart_items'
const [items, setItems] = useState(()=> JSON.parse(localStorage.getItem(key)||'[]'))


useEffect(()=>{ localStorage.setItem(key, JSON.stringify(items)) }, [key, items])


useEffect(()=>{ (async()=>{ try{ const remote = await api.cartGet(); if(Array.isArray(remote)) setItems(remote) }catch{} })() }, [api])


const add = async (itemId, qty=1)=>{ try{ await api.cartAdd({ itemId, qty }) }catch{}; setItems(prev=>{ const f=prev.find(p=>p.itemId===itemId); if(f) return prev.map(p=>p.itemId===itemId?{...p,qty:p.qty+qty}:p); return [...prev,{itemId, qty}] }) }
const update = async (itemId, qty)=>{ try{ await api.cartUpdate({ itemId, qty }) }catch{}; setItems(prev=> prev.map(p=> p.itemId===itemId?{...p, qty}:p).filter(p=>p.qty>0)) }
const remove = async (itemId)=>{ try{ await api.cartRemove({ itemId }) }catch{}; setItems(prev=> prev.filter(p=>p.itemId!==itemId)) }
const clear = ()=> setItems([])


return <CartCtx.Provider value={{ items, add, update, remove, clear }}>{children}</CartCtx.Provider>
}