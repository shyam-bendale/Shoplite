import React, { createContext, useState, useContext, useEffect } from 'react'
import { useApi } from '../api'


const AuthCtx = createContext(null)
export const useAuth = ()=> useContext(AuthCtx)


export function AuthProvider({ children }){
const api = useApi()
const [user, setUser] = useState(()=> JSON.parse(localStorage.getItem('user')||'null'))
const [token, setToken] = useState(()=> JSON.parse(localStorage.getItem('jwt')||'null'))


useEffect(()=>{ if(user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user') }, [user])
useEffect(()=>{ if(token) localStorage.setItem('jwt', JSON.stringify(token)); else localStorage.removeItem('jwt'); api.token = token }, [token])


const login = async (email, password) => { const res = await api.login({ email, password }); setToken(res.token); setUser(res.user); return res.user }
const signup = async (name, email, password) => { const res = await api.signup({ name, email, password }); return res.user }
const logout = ()=>{ setUser(null); setToken(null) }


return <AuthCtx.Provider value={{ user, token, login, signup, logout }}>{children}</AuthCtx.Provider>
}