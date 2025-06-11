// Updated useFirebaseFunctions.js - Remove debugging and fix app verification
"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, auth } from "../firebase";

export function useFirebaseFunctions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user's submissions (documents they uploaded)
  const getUserSubmissions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error("No authenticated user found");
      }

      // Get fresh token
      await auth.currentUser.getIdToken(true);

      const getUserSubmissionsFunc = httpsCallable(
        functions,
        "getUserSubmissions"
      );
      const result = await getUserSubmissionsFunc({});

      setLoading(false);
      return result.data || [];
    } catch (err) {
      console.error("Error in getUserSubmissions:", err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Get lector's assignments (documents assigned to them for review)
  const getLectorSubmissions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error("No authenticated user found");
      }

      // Get fresh token
      await auth.currentUser.getIdToken(true);

      const getLectorSubmissionsFunc = httpsCallable(
        functions,
        "getLectorSubmissions"
      );
      const result = await getLectorSubmissionsFunc({});

      setLoading(false);
      return result.data || [];
    } catch (err) {
      console.error("Error in getLectorSubmissions:", err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Update submission status (for lectors)
  const updateSubmission = async (submissionId, status, notes = "") => {
    setLoading(true);
    setError(null);

    try {
      if (!auth.currentUser) {
        throw new Error("No authenticated user found");
      }

      // Get fresh token
      await auth.currentUser.getIdToken(true);

      const updateSubmissionFunc = httpsCallable(functions, "updateSubmission");
      const result = await updateSubmissionFunc({
        submissionId,
        status,
        notes,
      });

      setLoading(false);
      return result.data;
    } catch (err) {
      console.error("Error in updateSubmission:", err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    error,
    getUserSubmissions,
    getLectorSubmissions,
    updateSubmission,
  };
}
