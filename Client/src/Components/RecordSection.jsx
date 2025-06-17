import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFilePdf } from "react-icons/fa";
import "../App.css";

const RecordSection = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [data, setData] = useState([]);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;
  
  const openWidget = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        resourceType: 'raw', // PDF support
        multiple: false,
        clientAllowedFormats: ['pdf'],
      },
      async (error, result) => {
        if (!error && result && result.event === "success") {
          setUploadedUrl(result.info.secure_url);
          // console.log(result.info.secure_url);

          try {
            const res = await axios.post(
              `${BACKEND_URL}/api/record/uploadHealthRecord`,
              {
                cloudinaryUrl: result.info.secure_url,
                fileName: result.info.original_filename,
              },
              { withCredentials: true }
            );

            // Update list dynamically
            if (res.data && res.data.newRecord) {
              setData((prev) => [res.data.newRecord, ...prev]);
            }
          } catch (err) {
            // console.error("Upload failed:", err);
          }
        }
      }
    );
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/record/getRecords`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setData(res.data.myData);
        }
      } catch (e) {
        // console.log("Error fetching records", e);
      }
    };
    fetchRecords();
  }, [data]);

  return (
    <div className="min-h-screen flex flex-col items-center hide-scrollbar gap-12 p-4">
      {/* Upload Box */}
      <div className="bg-white/50 backdrop-blur-md border border-gray-300 shadow-md p-6 rounded-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Upload Health Record (PDF)
        </h2>

        <button
          onClick={openWidget}
          className="mb-4 w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg font-medium"
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>

        {uploadedUrl && (
          <div className="mt-4 text-center">
            <p className="text-green-600 font-medium">Uploaded successfully!</p>
            <button
              onClick={() =>
                window.open(
                  `${uploadedUrl}`,
                  "_blank",
                  "noopener,noreferrer"
                )}
              className="text-blue-600 underline break-words"
            >
              View PDF
            </button>
          </div>
        )}
      </div>

      {/* Records List */}
      <div className="w-full max-w-4xl space-y-4 overflow-y-auto h-full pr-2 custom-scroll">
        {data.length === 0 ? (
          <p className="text-gray-500 text-center">No records found.</p>
        ) : (
          data.map((item, index) => (
            <div
              key={index}
              className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-xl hover:bg-slate-100 p-4 flex flex-wrap items-center justify-between shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 w-[70%] sm:w-auto">
                <FaFilePdf className="text-red-600 text-2xl shrink-0" />
                <p className="text-gray-800 font-medium break-words max-w-full truncate">
                  {item.title}
                </p>
              </div>

              <button
              onClick={() =>
                window.open(
                  `${item.fileLink}`,
                  "_blank",
                  "noopener,noreferrer"
                )}
              className="text-blue-600 underline break-words"
            >
                View
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecordSection;
