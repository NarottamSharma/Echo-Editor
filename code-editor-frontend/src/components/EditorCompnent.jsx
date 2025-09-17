import React from 'react'
import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';

// Connect to the backend server
const socket = io.connect("http://localhost:3001");

const EditorCompnent = () => {
  const [code,setCode] = useState("print('Hi ')")
  const editorRef = useRef(null);
  useEffect(() => {
    // Function to handle receiving code from the server
    const handleCodeReceive = (newCode) => {
      // Update the code content if it's different
      if (editorRef.current !== newCode) {
         setCode(newCode);
      }
    };
    socket.on('code-receive', handleCodeReceive);
    return () => {
      socket.off('code-receive', handleCodeReceive);
    };
  }, []);
  const handleEditorChange = (value) => {
    editorRef.current = value;
    setCode(value);
    // Emit the 'code-change' event to the server
    socket.emit('code-change', value);
  };

  return (
    <Editor
      height="90vh"
      language="javascript"
      theme="vs-dark"
      value={code}
      onChange={handleEditorChange}
      options={{
        fontSize: 16,
      }}
    />
  );
}

export default EditorCompnent