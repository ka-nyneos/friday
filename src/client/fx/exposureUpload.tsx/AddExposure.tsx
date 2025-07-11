"use client";

import React from "react";

import { Upload, Check, AlertCircle, FileText, Eye, X } from "lucide-react";

import Button from "../../ui/Button.tsx";
// import PreviewTable from "./PreviewTable.tsx";
import PreviewTable from "./PreviewTable";
// import { useNotification } from "../../Notification/Notification";
const formatFileSize = (size: number) => {
  return size < 1024
    ? `${size} B`
    : size < 1024 * 1024
    ? `${(size / 1024).toFixed(2)} KB`
    : `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const AddExposure: React.FC = () => {
  const [dragActive, setDragActive] = React.useState(false);
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [previewData, setPreviewData] = React.useState<string[][]>([]);
  const [previewHeaders, setPreviewHeaders] = React.useState<string[]>([]);
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewFileName, setPreviewFileName] = React.useState<string>("");
  const [selectedType, setSelectedType] = React.useState("");
  // const { notify } = useNotification();

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
    console.log("files", event.target.files);
  };

  const validateFileContent = (file: File): Promise<Partial<UploadedFile>> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        const validationErrors: string[] = [];
        let hasHeaders = false;
        let hasMissingValues = false;
        let rowCount = 0;
        let columnCount = 0;

        const expectedHeaders = [
          "ref_no",
          "type",
          "bu",
          "vendor_beneficiary",
          "amount",
          "quantity",
          "maturity_expiry",
          "details",
          "currency",
          "status",
          "uploaded_by",
        ];

        try {
          if (file.name.toLowerCase().endsWith(".csv")) {
            const lines = content.split("\n").filter((line) => line.trim());
            rowCount = lines.length;

            if (rowCount === 0) {
              validationErrors.push("File is empty");
            } else {
              const headers = lines[0]
                .split(",")
                .map((h) => h.trim().replace(/"/g, ""));
              columnCount = headers.length;
              hasHeaders = true;

              // Validate headers
              const missingHeaders = expectedHeaders.filter(
                (h) => !headers.includes(h)
              );
              if (missingHeaders.length > 0) {
                validationErrors.push(
                  `Missing required headers: ${missingHeaders.join(", ")}`
                );
              }

              const dataRows = lines.slice(1);
              dataRows.forEach((line, index) => {
                const cells = line
                  .split(",")
                  .map((cell) => cell.trim().replace(/"/g, ""));
                if (cells.length !== headers.length) {
                  validationErrors.push(
                    `Row ${index + 2} has incorrect number of columns`
                  );
                  return;
                }

                const rowObj: Record<string, string> = {};
                headers.forEach((header, i) => {
                  rowObj[header] = cells[i];
                });

                // Required field checks
                ["ref_no", "type", "bu"].forEach((field) => {
                  if (!rowObj[field]) {
                    hasMissingValues = true;
                    validationErrors.push(
                      `Row ${index + 2}: '${field}' is required`
                    );
                  }
                });

                // Type validation
                if (
                  rowObj["type"] &&
                  !["payable", "receivable"].includes(rowObj["type"])
                ) {
                  validationErrors.push(
                    `Row ${index + 2}: 'type' must be 'payable' or 'receivable'`
                  );
                }

                if (rowObj["amount"] && isNaN(Number(rowObj["amount"]))) {
                  validationErrors.push(
                    `Row ${index + 2}: 'amount' must be a number`
                  );
                }

                if (rowObj["quantity"] && isNaN(Number(rowObj["quantity"]))) {
                  validationErrors.push(
                    `Row ${index + 2}: 'quantity' must be a number`
                  );
                }

                if (rowObj["maturity_expiry"]) {
                  const date = new Date(rowObj["maturity_expiry"]);
                  if (isNaN(date.getTime())) {
                    validationErrors.push(
                      `Row ${index + 2}: 'maturity_expiry' must be a valid date`
                    );
                  }
                }

                if (
                  Object.values(rowObj).some(
                    (val) => val === "" || val === '""'
                  )
                ) {
                  hasMissingValues = true;
                  validationErrors.push(
                    `Row ${index + 2}: contains empty fields`
                  );
                }
              });
            }
          } else {
            validationErrors.push(
              "Unsupported file format. Only .csv files are allowed"
            );
          }
        } 
        catch (error) {
          validationErrors.push("Failed to parse file content");
          console.log(error);
        }

        const status = validationErrors.length > 0 ? "error" : "success";

        resolve({
          status,
          validationErrors,
          hasHeaders,
          hasMissingValues,
          rowCount,
          columnCount,
          error: status === "error" ? validationErrors.join(", ") : undefined,
        });
      };

      reader.onerror = () => {
        resolve({
          status: "error",
          validationErrors: ["Failed to read file"],
          error: "Failed to read file",
        });
      };

      reader.readAsText(file);
    });
  };

  const handleFiles = async (fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      status: "processing",
      uploadDate: new Date(),
      file: file,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    for (let i = 0; i < newFiles.length; i++) {
      const file = fileList[i];
      const fileData = newFiles[i];

      try {
        const validation = await validateFileContent(file);

        setFiles((prev) =>
          prev.map((f) => (f.id === fileData.id ? { ...f, ...validation } : f))
        );
      } catch (error) {
        console.log(error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileData.id
              ? {
                  ...f,
                  status: "error",
                  error: "Validation failed",
                  validationErrors: ["Validation failed"],
                }
              : f
          )
        );
      }
    }
  };

  const getFileStatusColor = (file: UploadedFile) => {
    if (
      file.status === "error" ||
      (file.validationErrors && file.validationErrors.length > 0)
    ) {
      return "bg-red-50 border-red-200";
    }
    if (file.status === "success") {
      return "bg-green-50 border-green-200";
    }
    return "bg-gray-50 border-gray-200";
  };

  const getFileTextColor = (file: UploadedFile) => {
    if (
      file.status === "error" ||
      (file.validationErrors && file.validationErrors.length > 0)
    ) {
      return "text-red-900";
    }
    if (file.status === "success") {
      return "text-green-900";
    }
    return "text-gray-900";
  };

  const handlePreviewFile = (uploadedFile: UploadedFile) => {
    if (!uploadedFile.file) {
      console.error("No file found for preview");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) return;
        const lines = text.split("\n").filter((line) => line.trim());
        if (lines.length === 0) return;
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              result.push(current.trim().replace(/^"|"$/g, ""));
              current = "";
            } else {
              current += char;
            }
          }
          result.push(current.trim().replace(/^"|"$/g, ""));
          return result;
        };
        const rows = lines.map(parseCSVLine);
        const [headerRow, ...dataRows] = rows;
        setPreviewHeaders(headerRow || []);
        setPreviewData(dataRows.slice(0, 50));
        setPreviewFileName(uploadedFile.name);
        setShowPreview(true);
      } catch (error) {
        console.error("Error parsing file for preview:", error);
      }
    };
    reader.onerror = () => {
      console.error("Error reading file for preview");
    };
    reader.readAsText(uploadedFile.file);
  };

  const handleRemoveRow = (index: number) => {
    setPreviewData((prevData) => {
      const newData = prevData.filter((_, i) => i !== index);

      // Find the file being previewed
      const previewedFile = files.find((f) => f.name === previewFileName);
      if (!previewedFile) return newData;

      // Check if validation issues are resolved
      const validationErrors = validatePreviewData(newData);
      const hasIssues = validationErrors.length > 0;
      if (!hasIssues) {
        // Update the file status if all issues are resolved
        handleIssuesResolved(previewedFile.id);
      }
      return newData;
    });
  };

  const handleIssuesResolved = (fileId: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === fileId
          ? {
              ...file,
              status: "success",
              validationErrors: [],
              error: undefined,
              hasMissingValues: false,
            }
          : file
      )
    );
    // notify("All validation issues resolved!", "success");
  };

  const validatePreviewData = (data: string[][]) => {
    const validationErrors: string[] = [];

    // Check for header validation
    const hasMissingHeaders = previewHeaders.some((h) => !h.trim());
    if (hasMissingHeaders) {
      validationErrors.push("Some headers are missing");
    }

    // Check data validation
    data.forEach((row, rowIndex) => {
      previewHeaders.forEach((header, colIndex) => {
        const value = row[colIndex] || "";

        // Basic required field checks
        if (!value.trim() && ["ref_no", "type", "bu"].includes(header)) {
          validationErrors.push(`Row ${rowIndex + 1}: ${header} is required`);
        }

        // Type validation
        if (header === "type" && !["payable", "receivable"].includes(value)) {
          validationErrors.push(
            `Row ${rowIndex + 1}: type must be payable or receivable`
          );
        }

        // Number validation
        if (header === "amount" && value && isNaN(Number(value))) {
          validationErrors.push(`Row ${rowIndex + 1}: amount must be a number`);
        }

        // Date validation
        if (header === "maturity_expiry" && value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            validationErrors.push(
              `Row ${rowIndex + 1}: maturity_expiry must be valid date`
            );
          }
        }
      });
    });

    return validationErrors;
  };

  // const handlePreviewFile = (uploadedFile: UploadedFile) => {
  //   if (!uploadedFile.file) {
  //     console.error("No file found for preview");
  //     return;
  //   }

  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     try {
  //       const text = e.target?.result as string;
  //       if (!text) return;

  //       const lines = text.split("\n").filter((line) => line.trim());
  //       if (lines.length === 0) return;

  //       const parseCSVLine = (line: string): string[] => {
  //         const result: string[] = [];
  //         let current = "";
  //         let inQuotes = false;

  //         for (let i = 0; i < line.length; i++) {
  //           const char = line[i];
  //           if (char === '"') {
  //             inQuotes = !inQuotes;
  //           } else if (char === "," && !inQuotes) {
  //             result.push(current.trim().replace(/^"|"$/g, ""));
  //             current = "";
  //           } else {
  //             current += char;
  //           }
  //         }
  //         result.push(current.trim().replace(/^"|"$/g, ""));
  //         return result;
  //       };

  //       const rows = lines.map(parseCSVLine);
  //       const [headerRow, ...dataRows] = rows;

  //       setPreviewHeaders(headerRow || []);
  //       setPreviewData(dataRows.slice(0, 50));
  //       setPreviewFileName(uploadedFile.name);
  //       setShowPreview(true);
  //     } catch (error) {
  //       console.error("Error parsing file for preview:", error);
  //     }
  //   };

  //   reader.onerror = () => {
  //     console.error("Error reading file for preview");
  //   };

  //   reader.readAsText(uploadedFile.file);
  // };

  const handleSetManually = async () => {
    const file = files.find((f) => f.file && f.status === "success")?.file;
    if (!file) {
      // notify("No Valid file available to send.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3001/upload-csv", {
        method: "POST",
        body: formData,
      });

      // const data = await res.json();

      if (res.ok) {
        // notify("Data has been successfully sent to the server", "success");
      } else {
        // notify("Upload failed ❌: " + data.error, "error");
      }
    } catch (err) {
      console.error(err);
      // notify("Error uploading CSV to server", "error");
    }
  };

  const clearAllFiles = () => setFiles([]);
  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((file) => file.id !== id));

  return (
    <div className="space-y-6">
     
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type of Exposure
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Exposure</option>
            <option value="payable">Payable</option>
            <option value="receivable">Receivable</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Updated By:
          </label>
          <input
            type="text"
            placeholder="Current User"
            disabled
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Updated Date/Time:
          </label>
          <input
            type="text"
            value={new Date().toLocaleString()}
            disabled
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        <div className="flex items-center space-x-4 gap-2">
          <Button disabled>
            <span className="text-white">Import Data</span>
          </Button>

          <Button onClick={handleSetManually}>
            <span className="text-white">Submit</span>
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-2 mb-4">
          <Upload className="w-4 h-4 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">
            Upload File (CSV/XLSX):
          </label>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600">
              <span className="font-medium text-green-600">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500">CSV, XLSX files up to 10MB</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Upload Summary
              {files.some(
                (f) =>
                  f.status === "error" ||
                  (f.validationErrors && f.validationErrors.length > 0)
              ) && (
                <span className="ml-2 text-red-600 text-sm">
                  Issues Detected
                </span>
              )}
            </h3>
            <button
              onClick={clearAllFiles}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {files.map((file) => (
              <div
                key={file.id}
                className={`p-4 hover:opacity-90 transition-colors ${getFileStatusColor(
                  file
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {file.status === "success" &&
                        !(
                          file.validationErrors &&
                          file.validationErrors.length > 0
                        ) && <Check className="w-5 h-5 text-green-500" />}
                      {(file.status === "error" ||
                        (file.validationErrors &&
                          file.validationErrors.length > 0)) && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      {file.status === "processing" && (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {file.status === "pending" && (
                        <FileText className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${getFileTextColor(
                          file
                        )}`}
                      >
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} •{" "}
                        {file.uploadDate.toLocaleString()}
                        {file.rowCount && file.columnCount && (
                          <span>
                            {" "}
                            • {file.rowCount} rows, {file.columnCount} columns
                          </span>
                        )}
                      </p>

                      {file.status === "success" &&
                        !(
                          file.validationErrors &&
                          file.validationErrors.length > 0
                        ) && (
                          <div className="text-xs text-green-600 mt-1 flex items-center space-x-2">
                            <Check className="w-3 h-3" />
                            <span>Headers: ✓ | Values: Complete</span>
                          </div>
                        )}

                      {file.validationErrors &&
                        file.validationErrors.length > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            <div className="flex items-center space-x-1 mb-1">
                              <AlertCircle className="w-3 h-3" />
                              <span className="font-medium">
                                Validation Issues:
                              </span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                              {file.validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {file.error &&
                        !(
                          file.validationErrors &&
                          file.validationErrors.length > 0
                        ) && (
                          <p className="text-xs text-red-600 mt-1">
                            {file.error}
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === "success" && file.file && (
                      <button
                        onClick={() => handlePreviewFile(file)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Preview Data"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {file.status === "error" && file.file && (
                      <button
                        onClick={() => handlePreviewFile(file)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Preview Data"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        removeFile(file.id);
                        setShowPreview(false);
                      }}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Remove File"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* {showPreview && previewData.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 border rounded-lg shadow-lg w-[90%] w-full max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Preview Data - {previewFileName}
              </h4>
              <button
                onClick={() => setShowPreview(false)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Close Preview
              </button>
            </div>

            <PreviewTable
              headers={previewHeaders}
              rows={previewData}
              onRemoveRow={(index) =>
                setPreviewData((prev) => prev.filter((_, i) => i !== index))
              }
            />
          </div>
        </div>
      )} */}
      {showPreview && previewData.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 border rounded-lg shadow-lg w-[90%] w-full max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Preview Data - {previewFileName}
              </h4>
              <button
                onClick={() => setShowPreview(false)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Close Preview
              </button>
            </div>

            <PreviewTable
              headers={previewHeaders}
              rows={previewData}
              onRemoveRow={handleRemoveRow}
              // onResolveIssues={() => {
              //   const previewedFile = files.find(
              //     (f) => f.name === previewFileName
              //   );
              //   if (previewedFile) {
              //     handleIssuesResolved(previewedFile.id);
              //   }
              // }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddExposure;