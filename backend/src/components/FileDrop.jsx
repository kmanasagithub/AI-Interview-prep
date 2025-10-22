import React, { useRef } from 'react';

export default function FileDrop({ onFile, accept = '.pdf' }){
  const ref = useRef();
  function handleDrop(e){
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if(f) onFile(f);
  }
  return (
    <div ref={ref}
      onDrop={handleDrop}
      onDragOver={(e)=>e.preventDefault()}
      className="border-dashed border-2 border-gray-300 p-6 rounded text-center bg-white">
      <p className="mb-2">Drag & drop PDF or click to select</p>
      <input type="file" accept={accept} onChange={(e)=>onFile(e.target.files[0])} className="w-full"/>
    </div>
  );
}
