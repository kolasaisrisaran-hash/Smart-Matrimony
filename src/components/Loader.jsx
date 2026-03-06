import React from "react";

const Loader = ({ text = "Please wait..." }) => {
  return (
    <div className="flex items-center justify-center gap-3 text-gray-700">
      <div className="spinner" />
      <span className="font-semibold">{text}</span>
    </div>
  );
};

export default Loader;