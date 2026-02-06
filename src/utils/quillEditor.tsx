import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './quillEditor.css';

interface QuillEditorProps {
  placeholder?: string;
  height?: string;
  publishOrUpdate: boolean
  delta?: any ; // Callback to load a post into the editor
  onPublish?: (html: string, delta: any, date: string | null) => void;
  onUpdate?: (html: string, delta: any, date: string | null) => void; // Callback for publishing, receives HTML and delta
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  placeholder = 'Write your post here...',
  height = '400px',
  publishOrUpdate,
  delta,
  onPublish,
  onUpdate,
}) => {
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
            placeholder,
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
          if (delta) {
            const parsedDelta = JSON.parse(delta);  // Convert string to object
            quillInstanceRef.current?.setContents(parsedDelta);
          }
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
  }, [placeholder, delta]); // Re-init if placeholder changes


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

  const publish = async () => {
    if (onPublish && quillInstanceRef.current) {
      const delta = quillInstanceRef.current.getContents();
      const html = quillInstanceRef.current.root.innerHTML;
      let date: string | null = (document.getElementById('post-date') as HTMLInputElement).value;
      if (!date) date = null;
      await onPublish(html, delta, date);
    }
  };

  const update = async () => {
    if (onUpdate && quillInstanceRef.current) {
      const delta = quillInstanceRef.current.getContents();
      const html = quillInstanceRef.current.root.innerHTML;
      let date: string | null = (document.getElementById('post-date') as HTMLInputElement).value;
      if (!date) date = null;
      await onUpdate(html, delta, date);
    }
  };

  const clear = () => {
    if (quillInstanceRef.current) {
      quillInstanceRef.current.setContents([]);
    }
  };

  const resetDate = () => {
    const dateInput = document.getElementById('post-date') as HTMLInputElement;
    if (dateInput) {
      dateInput.value = '';
    }
  }


  return (
    <div>
      <div ref={editorRef} style={{ height }} />
      <div className="draft-btns">
        {<button className="standard-btn" onClick={saveDraft}>Spara utkast</button>}
        {<button className="standard-btn" onClick={loadDraft}>Ladda utkast</button>}
        <button className="standard-btn" onClick={publishOrUpdate ? publish : update}>{publishOrUpdate ? 'Publicera' : 'Uppdatera'}</button>
        <input type="date" id="post-date" name="post-date" />
        <button className="delete-btn" onClick={() => resetDate()}>✕</button>

        <button className="standard-btn" onClick={clear}>Rensa</button>
      </div>
    </div>
  );
};

export default QuillEditor;