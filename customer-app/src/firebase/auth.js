import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, getDocs,
  collection, query, where, limit,
  updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from './config'

export async function signInCustomer(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const snap = await getDoc(doc(db, 'users', cred.user.uid))
  if (!snap.exists()) throw new Error('User profile not found.')
  const profile = snap.data()
  if (profile.role !== 'customer') throw new Error('Not a customer account.')
  return { uid: cred.user.uid, email: cred.user.email, ...profile }
}

export async function signUpCustomer(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  const uid = cred.user.uid

  await setDoc(doc(db, 'users', uid), {
    name,
    email,
    role: 'customer',
    createdAt: serverTimestamp(),
  })

  // Link any pending guest order to this new account
  const pendingCode = sessionStorage.getItem('gg_pending_order')
  if (pendingCode) {
    const q = query(
      collection(db, 'orders'),
      where('orderCode', '==', pendingCode),
      limit(1)
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      await updateDoc(snap.docs[0].ref, { customerId: uid, customerName: name })
    }
    sessionStorage.removeItem('gg_pending_order')
  }

  return { uid, email, name, role: 'customer' }
}

export async function logoutCustomer() {
  await signOut(auth)
}
