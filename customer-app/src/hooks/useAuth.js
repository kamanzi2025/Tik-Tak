import { useAuthContext } from '../contexts/AuthContext'
import { signInCustomer, signUpCustomer, logoutCustomer } from '../firebase/auth'
import { updateUser } from '../firebase/firestore'

export function useAuth() {
  const { user, setUser, loading, isGuest, enterGuestMode, exitGuestMode } = useAuthContext()

  async function signIn(email, password) {
    const profile = await signInCustomer(email, password)
    setUser(profile)
    return profile
  }

  async function signUp(name, email, password) {
    const profile = await signUpCustomer(name, email, password)
    setUser(profile)
    exitGuestMode()
    return profile
  }

  async function signOut() {
    await logoutCustomer()
    exitGuestMode()
    setUser(null)
  }

  async function updateProfile(data) {
    await updateUser(user.uid, data)
    setUser((prev) => ({ ...prev, ...data }))
  }

  return { user, loading, isGuest, signIn, signUp, signOut, enterGuestMode, exitGuestMode, updateProfile }
}
