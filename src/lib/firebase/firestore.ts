import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore'
import { db } from './config'

// User document interface
export interface UserDocument {
  uid: string
  email: string
  role: RoleType
  category?: string
  profile: {
    firstName: string
    lastName: string
    gender: 'Male' | 'Female' | 'Other'
    dateOfBirth: string
    mobile: string
    avatar?: string
  }
  metadata: {
    createdAt: Timestamp
    lastLoginAt: Timestamp
    isActive: boolean
    emailVerified: boolean
  }
  permissions?: string[]
  assignedBy?: string
}

export type RoleType = 'SuperAdmin' | 'Admin' | 'Staff' | 'Partner' | 'Agent' | 'User'

export type SubRoleType = {
  Staff: 'Accounts' | 'Support' | 'Key Manager' | 'Research' | 'Media' | 'Sales'
  Partner: 'Supplier' | 'Service Provider'
  Agent: 'Distributor' | 'Franchise' | 'B2B'
}

// User operations
export const createUser = async (userData: Partial<UserDocument>) => {
  if (!userData.uid) throw new Error('User ID is required')
  
  const userRef = doc(db, 'users', userData.uid)
  await setDoc(userRef, {
    ...userData,
    metadata: {
      ...userData.metadata,
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      isActive: true,
      emailVerified: false,
    }
  })
  
  return userRef
}

export const getUser = async (uid: string): Promise<UserDocument | null> => {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  
  if (userSnap.exists()) {
    return userSnap.data() as UserDocument
  }
  
  return null
}

export const updateUser = async (uid: string, updates: Partial<UserDocument>) => {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, updates)
  return userRef
}

export const updateUserRole = async (uid: string, role: RoleType, assignedBy: string) => {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    role,
    assignedBy,
    'metadata.lastLoginAt': Timestamp.now()
  })
  return userRef
}

export const getUsersByRole = async (role: RoleType) => {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('role', '==', role))
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => doc.data() as UserDocument)
}

export const getAllUsers = async (limitCount = 50) => {
  const usersRef = collection(db, 'users')
  try {
    const q = query(usersRef, orderBy('metadata.createdAt', 'desc'), limit(limitCount))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as UserDocument)
  } catch (err) {
    // Fallback if orderBy on nested field is not indexed or missing in some docs
    const fallbackSnapshot = await getDocs(query(usersRef, limit(limitCount)))
    return fallbackSnapshot.docs.map(doc => doc.data() as UserDocument)
  }
}

// Special admin emails
export const SUPER_ADMIN_EMAILS = [
  'babuas25@gmail.com',
  'md.ashifbabu@gmail.com'
]

export const isSuperAdminEmail = (email: string): boolean => {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase())
}
