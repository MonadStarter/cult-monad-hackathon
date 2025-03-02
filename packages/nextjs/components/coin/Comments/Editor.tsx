"use client";

import React, { useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const RichTextEditor = () => {
  const [text, setText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const maxChars = 256;

  useEffect(() => {
    const quill = new Quill("#editor", {
      modules: {
        toolbar: false,
      },
      theme: "snow",
      placeholder: "Share your thoughts",
    });

    quill.on("text-change", () => {
      const content = quill.getText();
      setText(content.trim());
      setCharCount(content.trim().length);
    });
  }, []);

  const handlePost = () => {
    if (charCount <= maxChars) {
      // console.log('Posted:', text);
    } else {
      alert("Exceeded character limit!");
    }
  };

  return (
    <div className="border rounded-xl border-gray-800 bg-white-7">
      <div id="editor" className="text-white !border-none !text-xs"></div>
      <div className="flex justify-between items-end py-2 pr-2 pl-4 text-sm">
        <span className="text-gray-600 text-sm">
          {charCount}/{maxChars}
        </span>
        <button
          onClick={handlePost}
          className=" bg-gray-800 px-4 py-2 text-xs"
          disabled={charCount === 0 || charCount > maxChars}
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default RichTextEditor;
