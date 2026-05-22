import { useAuthContext } from '../contexts/AuthContext'
import { loginStaff, logoutStaff } from '../firebase/auth'
import { updateUser } from '../firebase/firestore'

export function useAuth() {
  const { user, setUser, loading } = useAuthContext()

  async function signIn(email, password) {
    const profile = await loginStaff(email, password)
    setUser(profile); return profile
  }

  async function signOut() {
    await logoutStaff(); setUser(null)
  }

  async function updateProfile(data) {
    await updateUser(user.uid, data)
    setUser((p) => ({ ...p, ...data }))
  }

  return { user, loading, signIn, signOut, updateProfile }
}
