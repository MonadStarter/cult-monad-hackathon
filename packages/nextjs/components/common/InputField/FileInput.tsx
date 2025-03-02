"use client";

import React, { ChangeEvent, useState } from "react";
import { Panda } from "~~/icons/symbols";

function FileInput({ name }: { name: string }) {
  const [selectedFile, setSelectedFile] = useState<string>("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null; // Handle null case

    if (!file) return;
    setSelectedFile(URL.createObjectURL(file as Blob));
  };

  return (
    <div
      className={`relative flex flex-col items-between justify-center rounded-xl border border-gray-800 bg-white-7 ${!selectedFile && "p-2"} overflow-hidden w-full max-w-md mx-auto flex-1`}
    >
      <label
        htmlFor="image-upload"
        className="flex flex-col items-center justify-between cursor-pointer w-full gap-1 flex-1"
      >
        {selectedFile ? (
          <div className="w-full h-full">
            <img src={selectedFile} className="w-full max-h-[120] h-full" />
          </div>
        ) : (
          <div>
            <p className="text-gray-500 text-sm">JPG, GIF or PNG.</p>
            <p className="text-gray-500 text-sm mb-4">Max size of 800K</p>
          </div>
        )}
        <div
          className={`border border-white rounded-lg px-6 py-2 text-white font-medium hover:bg-gray-700 transition duration-200 text-center ${selectedFile ? "absolute top-1/2" : "w-full"}`}
        >
          Upload file
        </div>

        <input
          id="image-upload"
          type="file"
          accept="image/png, image/jpeg, image/gif"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          name={name}
        />
      </label>
    </div>
  );
}

function FileInputVariant({ name }: { name: string }) {
  const [selectedFile, setSelectedFile] = useState<string>("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null; // Handle null case

    if (!file) return;
    setSelectedFile(URL.createObjectURL(file as Blob));
  };

  const handleFileDelete = () => {
    setSelectedFile("");
    if (document) {
      (document.getElementById("image-upload") as HTMLInputElement)!.value = "";
    }
  };

  return (
    <div className="flex gap-4 w-full items-center">
      {selectedFile ? (
        <img src={selectedFile} className="w-[80] h-[80] object-cover rounded-full" />
      ) : (
        <div className="bg-white-12 w-[80] h-[80] rounded-full overflow-hidden">
          <Panda />
        </div>
      )}
      <button className="relative bg-gray-800 text-sm h-max !py-2">
        Change Image
        <input
          id="image-upload"
          type="file"
          accept="image/png, image/jpeg, image/gif"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          name={name}
        />
      </button>

      {selectedFile && (
        <button className="border border-gray-600 text-sm h-max !py-2" onClick={handleFileDelete}>
          Delete Image
        </button>
      )}
    </div>
  );
}

export default FileInput;
export { FileInputVariant };
