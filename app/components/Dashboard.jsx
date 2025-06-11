"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useFirebaseFunctions } from "../hooks/useFirebaseFunctions";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("documents");
  const [documentFilter, setDocumentFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const {
    getUserSubmissions,
    getLectorSubmissions,
    loading: functionsLoading,
    error: functionsError,
  } = useFirebaseFunctions();

  useEffect(() => {
    // Check if user was redirected from successful upload
    if (searchParams.get("upload") === "success") {
      setShowSuccessMessage(true);
      // Hide message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
      // Clean up URL
      router.replace("/dashboard", undefined, { shallow: true });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    setError("");

    try {
      // Fetch both user submissions and lector assignments in parallel
      const [userSubmissionsResult, lectorSubmissionsResult] =
        await Promise.allSettled([
          getUserSubmissions(),
          getLectorSubmissions(),
        ]);

      // Handle user's documents 
      if (userSubmissionsResult.status === "fulfilled") {
        const formattedDocuments = userSubmissionsResult.value.map(
          (submission) => ({
            id: submission.id,
            fileName: submission.fileName,
            fileType: getFileTypeFromName(submission.fileName),
            uploadDate: formatDate(submission.createdAt),
            status: submission.status === "pending" ? "Pending" : "Done",
            lectorId: submission.lectorId,
            fileSize: formatFileSize(submission.size),
            notes: submission.notes || "",
            filePath: submission.filePath,
            reviewedAt: submission.reviewedAt,
          })
        );
        setDocuments(formattedDocuments);
      } else {
        console.error(
          "Error fetching user submissions:",
          userSubmissionsResult.reason
        );
        setDocuments([]);
      }

      // Handle lector assignments (documents assigned to user for review)
      if (lectorSubmissionsResult.status === "fulfilled") {
        const formattedAssignments = lectorSubmissionsResult.value.map(
          (submission) => ({
            id: submission.id,
            fileName: submission.fileName,
            fileType: getFileTypeFromName(submission.fileName),
            assignedDate: formatDate(submission.createdAt),
            status: submission.status === "pending" ? "Pending" : "Done",
            userId: submission.userId,
            fileSize: formatFileSize(submission.size),
            description: `Document review for ${submission.fileName}`,
            filePath: submission.filePath,
            notes: submission.notes || "",
            reviewedAt: submission.reviewedAt,
          })
        );
        setAssignments(formattedAssignments);
      } else {
        console.log(
          "User has no lector assignments or error occurred:",
          lectorSubmissionsResult.reason
        );
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFileTypeFromName = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return "PDF";
      case "doc":
      case "docx":
        return "Word";
      case "txt":
        return "Text";
      case "rtf":
        return "RTF";
      case "odt":
        return "ODT";
      default:
        return "Document";
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return "📄";
      case "word":
        return "📝";
      case "text":
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

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";

    // Handle Firestore timestamp
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const filteredDocuments = documents.filter((doc) => {
    if (documentFilter === "all") return true;
    if (documentFilter === "pending") return doc.status === "Pending";
    if (documentFilter === "done") return doc.status === "Done";
    return true;
  });

  const filteredAssignments = assignments.filter((assignment) => {
    if (assignmentFilter === "all") return true;
    if (assignmentFilter === "pending") return assignment.status === "Pending";
    if (assignmentFilter === "done") return assignment.status === "Done";
    return true;
  });

  const currentFilter =
    activeTab === "documents" ? documentFilter : assignmentFilter;
  const setCurrentFilter =
    activeTab === "documents" ? setDocumentFilter : setAssignmentFilter;
  const currentData = activeTab === "documents" ? documents : assignments;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Main Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              {
                key: "documents",
                label: "Your Documents",
                count: documents.length,
              },
              {
                key: "assignments",
                label: "Your Assignments",
                count: assignments.length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Sub-filter Tabs */}
        <div className="mt-4 border-b border-gray-100">
          <nav className="-mb-px flex space-x-6">
            {[
              {
                key: "all",
                label: "All",
                count: currentData.length,
              },
              {
                key: "pending",
                label: "Pending",
                count: currentData.filter((item) => item.status === "Pending")
                  .length,
              },
              {
                key: "done",
                label: "Done",
                count: currentData.filter((item) => item.status === "Done")
                  .length,
              },
            ].map((subTab) => (
              <button
                key={subTab.key}
                onClick={() => setCurrentFilter(subTab.key)}
                className={`${
                  currentFilter === subTab.key
                    ? "border-blue-400 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                } whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm rounded-t-md`}
              >
                {subTab.label} ({subTab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Documents Section */}
        {activeTab === "documents" && (
          <div className="mb-8">
            {filteredDocuments.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="flex align-center justify-between px-4 py-5 sm:px-6">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Your Documents ({filteredDocuments.length})
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Track the status of your uploaded documents and their
                      reviews.
                    </p>
                  </div>

                  {/* Upload Button - Only show on documents tab */}
                  {activeTab === "documents" && (
                    <div className="mb-6 flex justify-end">
                      <Link
                        href="/upload"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <span className="mr-2">+</span>
                        Upload New Document
                      </Link>
                    </div>
                  )}
                </div>
                <ul className="divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <li
                      key={`doc-${doc.id}`}
                      className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="text-2xl mr-4">
                            {getFileIcon(doc.fileType)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {doc.fileName}
                              </p>
                              <span
                                className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  doc.status
                                )}`}
                              >
                                {doc.status}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <span>Uploaded: {doc.uploadDate}</span>
                              <span className="mx-2">•</span>
                              <span>{doc.fileSize}</span>
                              {doc.lectorName !== "-" && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Lector: {doc.lectorName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.status === "Pending" && (
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              View Details
                            </button>
                          )}
                          {doc.status === "Done" && (
                            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                              View Report
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {documentFilter === "all"
                    ? "No documents found"
                    : `No ${documentFilter} documents found`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {documentFilter === "all"
                    ? "You have no documents at the moment."
                    : `No ${documentFilter} documents.`}
                </p>
                {documentFilter === "all" && (
                  <Link
                    href="/upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Upload Your First Document
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Assignments Section */}
        {activeTab === "assignments" && (
          <div className="mb-8">
            {filteredAssignments.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Your Assignments ({filteredAssignments.length})
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Documents assigned to you for review and feedback.
                  </p>
                </div>
                <ul className="divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => (
                    <li
                      key={`assignment-${assignment.id}`}
                      className="px-4 py-6 sm:px-6 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-4 min-w-0 flex-1">
                          <div className="text-2xl">
                            {getFileIcon(assignment.fileType)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {assignment.fileName}
                              </p>
                              <div className="ml-2 flex items-center space-x-2">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    assignment.status
                                  )}`}
                                >
                                  {assignment.status}
                                </span>
                              </div>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                              {assignment.description}
                            </p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <span>Client: {assignment.clientName}</span>
                              <span className="mx-2">•</span>
                              <span>{assignment.fileSize}</span>
                              <span className="mx-2">•</span>
                              <span>Assigned: {assignment.assignedDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {assignment.status === "Pending" && (
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Review
                            </button>
                          )}
                          {assignment.status === "Done" && (
                            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                              View Report
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {assignmentFilter === "all"
                    ? "No assignments found"
                    : `No ${assignmentFilter} assignments found`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {assignmentFilter === "all"
                    ? "You have no assignments at the moment."
                    : `No ${assignmentFilter} assignments.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
