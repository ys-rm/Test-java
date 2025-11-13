import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
console.log("[v0] Firebase config loaded with project:", firebaseConfig.projectId)

let db: any = null
let firebaseError: string | null = null

try {
  let app
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
    console.log("[v0] Firebase app initialized successfully")
  } else {
    app = getApps()[0]
    console.log("[v0] Using existing Firebase app")
  }

  try {
    db = getFirestore(app)

    // Test Firestore availability by checking the app reference
    if (db && db.app) {
      console.log("[v0] Firestore initialized successfully")
      console.log("[v0] Firestore app name:", db.app.name)
      console.log("[v0] Firestore project:", db._delegate?._databaseId?.projectId || firebaseConfig.projectId)
    } else {
      throw new Error("Firestore service not properly initialized")
    }
  } catch (firestoreError: any) {
    console.error("[v0] Firestore initialization failed:", firestoreError.message)

    if (
      firestoreError.message?.includes("Service firestore is not available") ||
      firestoreError.message?.includes("not properly initialized")
    ) {
      firebaseError = `Firestore Database not created. Create it here: https://console.firebase.google.com/project/board-app-47504/firestore`
    } else if (firestoreError.message?.includes("permission")) {
      firebaseError = `Firestore permission denied. Check your Firebase security rules.`
    } else if (firestoreError.message?.includes("network")) {
      firebaseError = `Network error connecting to Firestore. Check your internet connection.`
    } else {
      firebaseError = `Firestore error: ${firestoreError.message}`
    }

    db = null
  }
} catch (error: any) {
  console.error("[v0] Firebase initialization failed:", error)
  firebaseError = `Firebase initialization failed: ${error.message}`
  db = null
}

export const retryFirebaseConnection = async () => {
  if (db) return { success: true, db }

  try {
    const app = getApps()[0] || initializeApp(firebaseConfig)
    const newDb = getFirestore(app)

    if (newDb && newDb.app) {
      db = newDb
      firebaseError = null
      console.log("[v0] Firebase connection retry successful")
      return { success: true, db }
    }
  } catch (error: any) {
    console.error("[v0] Firebase retry failed:", error)
    return { success: false, error: error.message }
  }

  return { success: false, error: "Firestore service still not available" }
}

export { db, firebaseError, firebaseConfig }
export const hasFirebaseConfig = true
