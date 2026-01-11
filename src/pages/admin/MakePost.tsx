import React from 'react';
import 'quill/dist/quill.snow.css';
import './MakePost.css';
import '../../styles/button.css';
import { useUser } from '../../context/UserContext';
import { processDeltaForImages } from '../../utils/imageUtils';
import QuillEditor from '../../utils/quillEditor';
  


// Also register imageResize if not already
// Quill.register('modules/imageResize', QuillResizeImage);

const MakePost: React.FC = () => {
  const { userId } = useUser();
  

  const handlePublish = async (html: string, delta: any, date: string | null) => {
    try {
      // Process images using the utility
      const processedDelta = await processDeltaForImages(delta);

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found. Please log in.');
        return;
      }
      if (!userId) {
        console.error('User ID not found. Please log in.');
        return;
      }

      const response = await fetch('/api/add-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: userId, html: html, delta: JSON.stringify({ ops: processedDelta }), pinned: false, publishDate: date }),
      });

      if (!response.ok) {
        console.error('Failed to publish post:', response.statusText);
        return;
      }
      console.log('Post published successfully!');
      sessionStorage.removeItem('draftPost');
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

  return (
    <div className='post-container'>
      <div className='post-content'>
        <h1>Skapa inlägg</h1>
        <QuillEditor
          placeholder="Write your post here..."
          height="400px"
          publishOrUpdate={true}
          onPublish={handlePublish}
        />
      </div>
    </div>
);
};




export default MakePost;