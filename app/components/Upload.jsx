"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLector, setSelectedLector] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const router = useRouter();

  // Mock lectors data
  const lectors = [
    {
      id: 1,
      name: "Jože Toporišič",
      specialization: "Language & Linguistics",
      rating: 4.9,
      reviews: 156,
    },
  ];

  const acceptedFileTypes = ".pdf,.doc,.docx,.txt,.rtf,.odt";
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/rtf",
      "application/vnd.oasis.opendocument.text",
    ];

    if (!allowedTypes.includes(file.type)) {
      return "Please select a valid file type (PDF, DOC, DOCX, TXT, RTF, ODT)";
    }

    if (file.size > maxFileSize) {
      return "File size must be less than 10MB";
    }

    return null;
  };

  const handleFileSelect = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
      case "rtf":
        return "📋";
      case "odt":
        return "📄";
      default:
        return "📁";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    if (!selectedLector) {
      setError("Please select a lector");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here you would implement the actual file upload logic
      console.log("Uploading:", {
        file: selectedFile,
        lector: selectedLector,
        description,
      });

      // Redirect to dashboard after successful upload
      router.push("/dashboard");
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Upload Section */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Document
              </h3>

              {/* Drag & Drop Area */}
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                  dragActive
                    ? "border-blue-400 bg-blue-50"
                    : selectedFile
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-2">
                        {getFileIcon(selectedFile.name)}
                      </div>
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{selectedFile.name}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept={acceptedFileTypes}
                            onChange={handleFileChange}
                            ref={fileInputRef}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, TXT, RTF, ODT up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lector Selection */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Lector
              </h3>
              <select
                value={selectedLector}
                onChange={(e) => setSelectedLector(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Choose a lector...</option>
                {lectors.map((lector) => (
                  <option key={lector.id} value={lector.id}>
                    {lector.name} - {lector.specialization} (★{lector.rating} •{" "}
                    {lector.reviews} reviews)
                  </option>
                ))}
              </select>

              {selectedLector && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  {(() => {
                    const lector = lectors.find(
                      (l) => l.id === parseInt(selectedLector)
                    );
                    return lector ? (
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">
                          {lector.name}
                        </p>
                        <p className="text-blue-700">
                          Specialization: {lector.specialization}
                        </p>
                        <p className="text-blue-600">
                          Rating: ★{lector.rating} ({lector.reviews} reviews)
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile || !selectedLector}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
