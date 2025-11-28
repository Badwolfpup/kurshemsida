import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import QuillResizeImage from 'quill-resize-image';
import 'quill/dist/quill.snow.css';
import './MakePost.css';
import '../../styles/button.css';
import { jwtDecode } from 'jwt-decode';
  


// Also register imageResize if not already
Quill.register('modules/imageResize', QuillResizeImage);

const MakePost: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<Quill | null>(null);
  const initializedRef = useRef(false);


  useEffect(() => {
    if (typeof window === 'undefined' || !editorRef.current || initializedRef.current) return;

    const loadQuill = async () => {
      try {
        const { default: Quill } = await import('quill');
        const { default: QuillResizeImage } = await import('quill-resize-image');
        Quill.register('modules/imageResize', QuillResizeImage);

        if (!quillInstanceRef.current && editorRef.current) {
          initializedRef.current = true;
          editorRef.current.innerHTML = '';
          quillInstanceRef.current = new Quill(editorRef.current, {
            theme: 'snow',
            placeholder: 'Write your post here...',
            modules: {
            toolbar: [
              [{ header: [1, 2, 3, 4, 5, false] }],
              [{ font: [] }, { size: [] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ color: [] }, { background: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ align: [] }],
              ['link', 'image', 'video', 'blockquote', 'code-block'],
              ['clean'],
            ],
              imageResize: {
                parchment: Quill.import('parchment'),
                modules: ['Resize', 'DisplaySize', 'Toolbar'],
              },
            },
          });
        }
      } catch (error) {
        console.error('Failed to load Quill:', error);
      }
    };

    loadQuill();

    return () => {
      if (quillInstanceRef.current) {
        quillInstanceRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []);

    const saveDraft = () => { 
    const draft = JSON.stringify(quillInstanceRef.current?.getContents());
    sessionStorage.setItem('draftPost', draft);
  };

  const loadDraft = () => {
    try {
        const draft = sessionStorage.getItem('draftPost');
        if (draft && quillInstanceRef.current) {
            const content = JSON.parse(draft);
            quillInstanceRef.current.setContents(content);
        }
    } catch (error) {
        console.error('Failed to load draft:', error);
    }

  }

    // Helper: Upload base64 image and return server URL
  const uploadImage = async (base64Data: string): Promise<string> => {
    try {
            
        const response = await fetch('https://localhost:5001/api/upload-image', { // Replace with your endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data }),
        });
        const result = await response.json();
        // console.log('Image uploaded:', result.url);
        return result.url; // e.g., "https://yourserver.com/images/123.png"
    } catch (error) {
        console.error('Image upload failed:', error);
        return base64Data; 
    }
  };

  // Helper: Process delta to replace base64 images with URLs
  const processDeltaForImages = async (delta: any) => {
    const newOps = await Promise.all(delta.ops.map(async (op: any) => {
      if (op.insert && op.insert.image && typeof op.insert.image === 'string' && op.insert.image.startsWith('data:image/')) {
        // Base64 image detected
        try {
            const imageUrl = await uploadImage(op.insert.image);
            return { ...op, insert: { image: imageUrl } }; // Replace with server URL
        } catch (error) {
          console.error('Error uploading image:', error);
          return op; // Return original op on error
        }
      }
      return op; // No change for other ops
    }));
    return newOps;
  };

const Publish = async () => {
    try {
      const delta = quillInstanceRef.current?.getContents();
      if (!delta) return;

      // Process images: upload base64 and replace with URLs
      const processedDelta = await processDeltaForImages(delta);

      quillInstanceRef.current?.setContents(processedDelta);
      // Now save the processed delta (or HTML) to your server
      const html = quillInstanceRef.current?.root.innerHTML; // Or use processedDelta for JSON

    const token = localStorage.getItem('token'); // Get the stored token
    if (!token) {
      console.error('No auth token found. Please log in.');
      return;
    }

    const decoded: any = jwtDecode(token);
    const email = decoded.sub;

    const response = await fetch('https://localhost:5001/api/add-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add this
      },
      body: JSON.stringify({ email: email,  html: html, delta: processedDelta }),
    });

    if (!response.ok) {
      console.error('Failed to publish post:', response.statusText);
      return;
    }
    console.log('Post published successfully!');
    // Optional: Clear draft after publishing
    sessionStorage.removeItem('draftPost');
    quillInstanceRef.current?.setContents([]);
  } catch (error) {
    console.error('Failed to publish:', error);
    }
  };


  return (
    <div>
      <h1>Skapa inlägg</h1>
      <div ref={editorRef} style={{ height: '400px' }} />
      <div className="draft-btns">
        <button className="user-button" onClick={saveDraft}>Spara utkast</button>
        <button className="user-button" onClick={loadDraft}>Ladda utkast</button>
        <button className="user-button" onClick={Publish}>Publicera</button>
        <button className="user-button" onClick={() => quillInstanceRef.current?.setContents([])}>Rensa</button>
      </div>
    </div>
  );
};

export default MakePost;