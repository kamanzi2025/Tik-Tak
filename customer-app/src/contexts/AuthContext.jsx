import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase/config'
import { getUser } from '../firebase/firestore'
import { localGetCurrentCustomer } from '../firebase/localStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)          // { uid, name, email, role }
  const [loading, setLoading] = useState(true)

  // Guest mode is stored in sessionStorage so it survives page refreshes
  // but resets when the browser session ends
  const [isGuest, setIsGuestState] = useState(
    () => sessionStorage.getItem('gg_guest') === 'true'
  )

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setUser(localGetCurrentCustomer())
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUser(firebaseUser.uid)
        if (profile && profile.role === 'customer') {
          setUser({ ...profile, uid: firebaseUser.uid, email: firebaseUser.email })
          // Clear guest mode when a real user is signed in
          sessionStorage.removeItem('gg_guest')
          setIsGuestState(false)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  function enterGuestMode() {
    sessionStorage.setItem('gg_guest', 'true')
    setIsGuestState(true)
  }

  function exitGuestMode() {
    sessionStorage.removeItem('gg_guest')
    sessionStorage.removeItem('gg_pending_order')
    setIsGuestState(false)
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, isGuest, enterGuestMode, exitGuestMode }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
