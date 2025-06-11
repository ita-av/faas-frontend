"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("documents"); // "documents" or "assignments"
  const [documentFilter, setDocumentFilter] = useState("all"); // "all", "pending", "done"
  const [assignmentFilter, setAssignmentFilter] = useState("all"); // "all", "pending", "done"
  const router = useRouter();


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock documents data (user's uploaded documents)
      setDocuments([
        {
          id: 1,
          fileName: "Business_Plan_2024.pdf",
          fileType: "PDF",
          uploadDate: "2024-03-15",
          status: "Pending",
          lectorName: "Dr. Smith",
          fileSize: "2.4 MB",
        },
        {
          id: 2,
          fileName: "Marketing_Strategy.docx",
          fileType: "Word",
          uploadDate: "2024-03-10",
          status: "Done",
          lectorName: "Prof. Johnson",
          fileSize: "1.8 MB",
        },
        {
          id: 3,
          fileName: "Project_Proposal.txt",
          fileType: "Text",
          uploadDate: "2024-03-08",
          status: "Pending",
          lectorName: "-",
          fileSize: "45 KB",
        },
      ]);

      // Mock assignments data (lector's assigned reviews)
      setAssignments([
        {
          id: 1,
          fileName: "Business_Plan_2024.pdf",
          fileType: "PDF",
          assignedDate: "2024-03-15",
          dueDate: "2026-03-22",
          status: "Pending",
          clientName: "John Doe",
          fileSize: "2.4 MB",
          description: "Comprehensive business plan review for startup funding",
        },
        {
          id: 2,
          fileName: "Research_Paper_Draft.docx",
          fileType: "Word",
          assignedDate: "2024-03-14",
          dueDate: "2024-03-20",
          status: "Pending",
          clientName: "Sarah Wilson",
          fileSize: "3.1 MB",
          description: "Academic paper review for publication",
        },
        {
          id: 3,
          fileName: "Contract_Analysis.pdf",
          fileType: "PDF",
          assignedDate: "2024-03-10",
          dueDate: "2024-03-18",
          status: "Done",
          clientName: "Mike Johnson",
          fileSize: "1.8 MB",
          description: "Legal contract review and analysis",
        },
        {
          id: 4,
          fileName: "Technical_Specification.txt",
          fileType: "Text",
          assignedDate: "2024-03-12",
          dueDate: "2024-03-19",
          status: "Pending",
          clientName: "Emily Davis",
          fileSize: "156 KB",
          description: "Software technical specification review",
        },
      ]);

      setIsLoading(false);
    };

    fetchData();
  }, []);

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
