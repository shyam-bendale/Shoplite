import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'


export default function Signup(){
const { signup } = useAuth()
const n = useNavigate()
const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [err, setErr] = useState('')
const onSubmit = async e=>{ e.preventDefault(); try{ await signup(name, email, password); n('/login') }catch(e){ setErr(e.message||String(e)) } }
return (
<div className="max-w-md mx-auto">
<h2 className="text-center mt-2">Create account</h2>
<form onSubmit={onSubmit} className="bg-white p-4 rounded-2xl mt-2">
{err && <div className="text-red-600 mt-2">{err}</div>}
<label className="mt-2">Full name</label>
<input className="mt-1" value={name} onChange={e=>setName(e.target.value)} placeholder="Jane Doe" required />
<label className="mt-2">Email</label>
<input className="mt-1" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" required />
<label className="mt-2">Password</label>
<input className="mt-1" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password" required />
<button type="submit" className="mt-4 w-16">Create account</button>
</form>
</div>
)
}