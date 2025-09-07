import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'


export default function AppShell({ children }){
const { user, logout } = useAuth()
const { items } = useCart()
const count = items.reduce((s, x) => s + x.qty, 0)
return (
<div className="min-h-screen bg-gray-50 text-gray-900">
<header className="sticky top-0 bg-white border-b">
<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
<Link to="/" className="flex items-center gap-2"><strong>ShopLite</strong></Link>
<nav className="flex items-center gap-3">
<Link to="/">Products</Link>
<Link to="/cart">Cart ({count})</Link>
{user ? <><span>Hi, {user.name}</span><button onClick={logout}>Logout</button></> : <><Link to="/login">Login</Link><Link to="/signup">Signup</Link></>}
</nav>
</div>
</header>
<main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
<footer className="text-center py-6">© {new Date().getFullYear()} ShopLite</footer>
</div>
)
}