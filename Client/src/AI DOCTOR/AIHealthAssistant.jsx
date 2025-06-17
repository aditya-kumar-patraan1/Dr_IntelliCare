import axios from "axios";
import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";

const AIHealthAssistant = () => {
  const [ImageURL, setImageURL] = useState(null);
  const [isShowing, setIsShowing] = useState(false);
  const [ImageFile, setImageFile] = useState(null);
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState(null);
  const [processing, setProcessing] = useState(false);
  const GROQLINK = import.meta.env.VITE_GROQ_LINK;

  const setFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setImageFile(file);
      setImageURL(imgURL);
    }
  };

  const closeDown = () => {
    setIsShowing(false);
    setImageURL(null);
    setImageFile(null);
  };

  const handleSubmit = async () => {
    if (!ImageFile || !query) return;

    toast.success("Wait for the Response...");
    setProcessing(true); // Start processing immediately

    try {
      const reader = new FileReader();
      reader.readAsDataURL(ImageFile);
      reader.onloadend = async () => {
        const base64Image = reader.result;

        const payload = {
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: query },
                { type: "image_url", image_url: { url: base64Image } },
              ],
            },
          ],
          temperature: 1,
          max_completion_tokens: 1024,
          top_p: 1,
          stream: false,
        };

        const response = await axios.post(
          GROQLINK,
          payload,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const answer = response.data.choices[0]?.message?.content;
        // Simulate 4-second delay before ending processing
        setTimeout(() => {
          setProcessing(false);
        }, 3000);

        setOutput(answer || "No response received.");
        // setOutput((answer || "").replace(/```[\s\S]*?```/g, "").replace(/`([^`]+)`/g, "$1").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/[_~>#+=-]/g, "").trim());
      };
    } catch (err) {
      // console.error("❌ Error in submitting form data: ", err);
      setOutput("Model failed: " + err.message);
      setProcessing(false); // End processing on error
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 via-blue-900 to-sky-700 flex flex-col items-center justify-start p-6 min-h-screen">
      <Toaster />
      {/* Heading */}
      <h1 className="text-5xl font-bold text-center text-white mb-10">
        IntelliAid
      </h1>

      {/* Top Section */}
      <div className="flex flex-col md:flex-row w-full gap-6 mb-10">
        {/* Image Upload */}
        <div className="bg-blue-800 w-full md:w-1/2 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
          {isShowing && (
            <img
              src={ImageURL}
              alt="Preview"
              className="rounded-xl max-h-64 mb-4"
            />
          )}

          <div className="flex justify-center items-center w-full mb-4">
            <label className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={setFile}
                className={`hidden`}
              />
              <span
                className={`${
                  ImageURL ? "hidden" : "block"
                } py-2 px-4 rounded text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 cursor-pointer`}
              >
                Choose File
              </span>
              {ImageURL && (
                <span className="text-sm text-white">{ImageURL.name}</span>
              )}
            </label>
            {/* </div> */}

            {!isShowing && ImageURL && (
              <button
                onClick={() => setIsShowing(true)}
                disabled={!ImageURL}
                className={` px-6 py-2 rounded-lg ${
                  ImageFile ? "cursor-pointer" : ""
                } text-white transition-all duration-300 ${
                  ImageURL
                    ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                    : "bg-gray-500 cursor-not-allowed"
                }`}
              >
                Upload Image
              </button>
            )}
          </div>

          {isShowing && (
            <button
              onClick={closeDown}
              className="mt-2 px-6 cursor-pointer py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
            >
              Cancel Image
            </button>
          )}
        </div>

        {/* Query Input */}
        <div className="bg-blue-800 w-full md:w-1/2 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your health query here..."
            className="w-full h-56 p-4 rounded-lg text-white bg-blue-700 resize-none focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            className="mt-4 px-6 py-3 cursor-pointer bg-green-400 hover:bg-green-500 text-blue-900 font-semibold rounded-xl transition-all duration-300"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="w-full bg-white/10 text-white backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-10 min-h-[200px]">
        <h2 className="text-2xl font-semibold mb-4">Remedial & Suggestions</h2>
        <p className="whitespace-pre-wrap">{output}</p>
      </div>
    </div>
  );
};

export default AIHealthAssistant;
