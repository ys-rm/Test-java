"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, firebaseError, hasFirebaseConfig } from "../lib/firebase";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface FirebaseStatusProps {
  currentMode: "firebase";
}

export function FirebaseStatus({ currentMode }: FirebaseStatusProps) {
  const [status, setStatus] = useState<"checking" | "connected" | "error">(
    "checking"
  );
  const [error, setError] = useState<string>("");

  const checkFirebaseConnection = async () => {
    if (!hasFirebaseConfig || firebaseError || !db) {
      setStatus("error");
      setError(firebaseError || "Firebase not configured");
      return;
    }

    setStatus("checking");
    setError("");

    try {
      console.log("[v0] Testing Firestore connection...");

      // Try to read from a test document - this will fail if Firestore isn't enabled
      const testDoc = doc(db, "test", "connection");
      await getDoc(testDoc);

      setStatus("connected");
      console.log("[v0] Firebase connection test successful");
    } catch (err: any) {
      console.error("[v0] Firebase connection test failed:", err);
      setStatus("error");

      if (
        err.code === "failed-precondition" ||
        err.message.includes("firestore is not available")
      ) {
        setError(
          "Firestore database is not enabled in your Firebase project. Please enable Firestore Database in the Firebase Console."
        );
      } else if (err.code === "permission-denied") {
        setError(
          "Firestore security rules are blocking access. Please update your Firestore rules to allow read/write access."
        );
      } else {
        setError(err.message || "Unknown Firebase error");
      }
    }
  };

  useEffect(() => {
    if (currentMode === "firebase") {
      checkFirebaseConnection();
    }
  }, [currentMode]);

  if (status === "checking") {
    return (
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-sm">Checking Firebase connection...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="p-4 mb-6 bg-red-50 border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full" />
            <span className="text-sm text-red-700">
              Firebase connection issue
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkFirebaseConnection}
            >
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6 bg-green-50 border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full" />
          <span className="text-sm text-green-700">
            Firebase connected successfully
          </span>
        </div>
      </div>
    </Card>
  );
}
