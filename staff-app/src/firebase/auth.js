import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  updatePassword, deleteUser,
  EmailAuthProvider, reauthenticateWithCredential,
} from 'firebase/auth'
import {
  doc, getDoc, getDocs, deleteDoc, setDoc,
  collection, query, where, writeBatch, serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from './config'

export async function registerStaff(restaurantName, email, password) {
  const restaurantId = restaurantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, 'users', cred.user.uid), {
    name: `${restaurantName} Staff`,
    role: 'staff',
    restaurantId,
    email,
    createdAt: serverTimestamp(),
  })
  await setDoc(doc(db, 'restaurants', restaurantId), {
    name: restaurantName,
    tagline: '',
    description: '',
    category: '',
    location: '',
    openingHours: '',
    phone: '',
    imageUrl: '',
    logoUrl: '',
    isOpen: false,
    published: false,
    createdAt: serverTimestamp(),
  })
  return { uid: cred.user.uid, email, name: `${restaurantName} Staff`, role: 'staff', restaurantId }
}

export async function loginStaff(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const snap = await getDoc(doc(db, 'users', cred.user.uid))
  if (!snap.exists()) throw new Error('User profile not found.')
  const profile = snap.data()
  if (profile.role !== 'staff') throw new Error('Not a staff account.')
  return { uid: cred.user.uid, email: cred.user.email, ...profile }
}

export async function logoutStaff() {
  await signOut(auth)
}

export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser
  const cred = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, cred)
  await updatePassword(user, newPassword)
}

export async function deleteAccount(password) {
  const user = auth.currentUser

  // Re-authenticate — required by Firebase before destructive account operations
  const cred = EmailAuthProvider.credential(user.email, password)
  await reauthenticateWithCredential(user, cred)

  // Read the restaurantId from the user's Firestore profile
  const userSnap = await getDoc(doc(db, 'users', user.uid))
  if (!userSnap.exists()) throw new Error('User profile not found.')
  const { restaurantId } = userSnap.data()

  // Delete all menu items for this restaurant
  const menuSnap = await getDocs(
    query(collection(db, 'menuItems'), where('restaurantId', '==', restaurantId))
  )
  const batch = writeBatch(db)
  menuSnap.docs.forEach((d) => batch.delete(d.ref))

  // Delete the restaurant document and the user document in the same batch
  batch.delete(doc(db, 'restaurants', restaurantId))
  batch.delete(doc(db, 'users', user.uid))
  await batch.commit()

  // Delete the Firebase Auth account last (we need auth for the Firestore writes above)
  await deleteUser(user)
}
