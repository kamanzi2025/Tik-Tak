import { useAuthContext } from '../contexts/AuthContext'
import { login, logout, changePassword } from '../firebase/auth'
import { updateUser } from '../firebase/firestore'

export function useAuth() {
  const { user, setUser, loading } = useAuthContext()

  async function signIn(email, password) {
    const profile = await login(email, password)
    setUser({ ...profile, email })
    return profile
  }

  async function signOut() {
    await logout()
    setUser(null)
  }

  async function updateProfile(data) {
    await updateUser(user.uid, data)
    setUser((prev) => ({ ...prev, ...data }))
  }

  return { user, loading, signIn, signOut, updateProfile, changePassword }
}
