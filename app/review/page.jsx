"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useFirebaseFunctions } from "../hooks/useFirebaseFunctions";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ReviewPage() {
  const [submission, setSubmission] = useState(null);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userRole, setUserRole] = useState(null); // "reviewer", "uploader", "none"

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { updateSubmission } = useFirebaseFunctions();

  const submissionId = searchParams.get("id");

  useEffect(() => {
    if (!submissionId) {
      setError("No submission ID provided");
      setIsLoading(false);
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    fetchSubmission();
  }, [submissionId, user]);

  const fetchSubmission = async () => {
    try {
      setIsLoading(true);
      setError("");

      const submissionDoc = await getDoc(doc(db, "submissions", submissionId));

      if (!submissionDoc.exists()) {
        setError("Submission not found");
        return;
      }

      const submissionData = {
        id: submissionDoc.id,
        ...submissionDoc.data(),
      };

      setSubmission(submissionData);
      setNotes(submissionData.notes || "");

      // Determine user role
      if (submissionData.lectorId === user.uid) {
        setUserRole("reviewer");
      } else if (submissionData.userId === user.uid) {
        setUserRole("uploader");
      } else {
        setUserRole("none");
        setError("You don't have permission to view this submission");
      }
    } catch (err) {
      console.error("Error fetching submission:", err);
      setError("Failed to load submission");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReview = async () => {
    if (!notes.trim()) {
      setError("Please add some review notes before submitting");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      await updateSubmission(submissionId, "done", notes.trim());

      setSuccess("Review submitted successfully!");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";

    let date;

    // Handle different timestamp formats
    if (typeof timestamp === "string") {
      // ISO string from Cloud Functions (e.g., "2025-06-11T16:37:37.000Z")
      date = new Date(timestamp);
    } else if (timestamp.toDate && typeof timestamp.toDate === "function") {
      // Firestore Timestamp object with toDate method
      date = timestamp.toDate();
    } else if (timestamp._seconds !== undefined) {
      // Firestore Timestamp object with _seconds and _nanoseconds (your case)
      date = new Date(
        timestamp._seconds * 1000 + Math.floor(timestamp._nanoseconds / 1000000)
      );
    } else if (timestamp.seconds !== undefined) {
      // Firestore Timestamp-like object with seconds (without underscore)
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      // Already a Date object
      date = timestamp;
    } else if (typeof timestamp === "number") {
      // Unix timestamp (milliseconds)
      date = new Date(timestamp);
    } else {
      // Fallback: try to parse as string
      date = new Date(timestamp);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", timestamp);
      return "Invalid Date";
    }

    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "txt":
        return "📃";
      default:
        return "📁";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "Unknown size";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isReviewer = userRole === "reviewer";
  const isUploader = userRole === "uploader";
  const isCompleted = submission?.status === "done";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            {isReviewer ? "Review Document" : "View Review"}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {isReviewer
              ? "Provide feedback and review notes for this document"
              : "View the review feedback for your document"}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10 10.586l1.293-1.293a1 1 0 111.414 1.414L11.414 12l1.293 1.293a1 1 0 01-1.414 1.414L10 13.414l-1.293 1.293a1 1 0 01-1.414-1.414L9.586 12 8.293 10.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Document Info */}
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Document Information
            </h3>

            <div className="flex items-start space-x-4">
              <div className="text-3xl">
                {getFileIcon(submission?.fileName)}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    {submission?.fileName}
                  </h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isCompleted
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {isCompleted ? "Done" : "Pending"}
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Size: {formatFileSize(submission?.size)}</p>
                  <p>Uploaded: {formatDate(submission?.createdAt)}</p>
                  {isCompleted && submission?.reviewedAt && (
                    <p>Reviewed: {formatDate(submission?.reviewedAt)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isReviewer ? "Review Notes" : "Review Feedback"}
              </h3>

              {isUploader && isCompleted && (
                <div className="text-sm text-green-600 font-medium">
                  Review Complete
                </div>
              )}
            </div>

            {/* Notes Textarea */}
            <div className="mb-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {isReviewer ? "Add your review notes:" : "Review notes:"}
              </label>

              <textarea
                id="notes"
                rows={8}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!isReviewer || isCompleted}
                placeholder={
                  isReviewer
                    ? "Provide detailed feedback about the document..."
                    : isCompleted
                    ? "No review notes provided"
                    : "Review is still pending..."
                }
                className={`text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  !isReviewer || isCompleted ? "bg-gray-50" : ""
                }`}
              />

              {isReviewer && !isCompleted && (
                <p className="mt-2 text-sm text-gray-500">
                  Provide constructive feedback to help improve the document.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {isReviewer && !isCompleted && (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveReview}
                  disabled={isSaving || !notes.trim()}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            )}

            {/* Info for uploader */}
            {isUploader && !isCompleted && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Your document is currently being reviewed. You'll receive
                      a notification when the review is complete.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
