import React, { useState, useEffect } from 'react';
import 'quill/dist/quill.snow.css';
import './MakePost.css';
import '../../styles/button.css';
import { useUser } from '../../context/UserContext';
import { processDeltaForImages } from '../../utils/imageUtils';
import QuillEditor from '../../utils/quillEditor';
import Toast from '../../utils/toastMessage';
  
interface Post {
  id: number;
  html: string;
  delta: string;
  publishedAt: Date;
  author: string;
  pinned: number;
}

const MakePost: React.FC = () => {
  const { userId } = useUser();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showNewPostForm, setShowNewPostForm] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editModes, setEditModes] = useState<Record<string,boolean>>({});
  
  

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Ingen autentiseringstoken hittades. Vänligen logga in.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/fetch-posts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const posts: Post[] = await response.json();
      posts.sort((a, b) => {
        // Pinned posts first
        if (a.pinned !== b.pinned) {
          return b.pinned - a.pinned;
        }
        // Then by published date descending
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
      setPosts(posts);
    }
    catch (error) {
      console.error('Failed to fetch posts:', error);
      setError('Kunde inte ladda inlägg. Försök igen senare.');
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const getPosts = async () => await fetchPosts();
    getPosts();
  }, []);

  const deletePost = async (postId: number) => {
    const prompt = window.confirm(`Är du säker på att du vill ta bort inlägget? Detta kan inte ångras.`);
    if (!prompt) return;
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found. Please log in.');
      return;
    }
    try {
      const response = await fetch(`/api/delete-post/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Optionally, refresh the posts list after deletion
      await fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  }

  const handleUpdate = async (html: string, delta: any, date: string | null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found. Please log in.');
      return;
    }
    try {
      const response = await fetch('/api/update-post', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ html: html, delta: JSON.stringify({ ops: delta }), userId: userId, publishDate: date })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Optionally, refresh the posts list after deletion
      await fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };


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
      setToastMessage('Inlägg publicerat framgångsrikt!');
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

    const toggleEditMode = (postId: string) => {
    setEditModes(prev => ({
      ...prev,
      [postId]: !prev[postId] // Toggle for this ID
    }));
  };

  return (
    <div>
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Laddar användare...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button className="retry-button" onClick={fetchPosts}>Försök igen</button>
        </div>
      ) : (
      <div  className='timeline-main'>
        <div className='post-container'>
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
            <div className='post-content'>
              <h1>Skapa inlägg</h1>
              <button className='user-button' onClick={() => setShowNewPostForm(!showNewPostForm)}>{showNewPostForm ? 'Dölj formulär' : 'Nytt inlägg'}</button>
            </div>
            <div className={`new-post-form ${showNewPostForm ? '' : 'hidden'}`}>
              <QuillEditor
                placeholder="Write your post here..."
                height="400px"
                publishOrUpdate={true}
                onPublish={handlePublish}
              />
            </div>
        </div>
        {posts.map((post) => (
          <div key={post.id} className="timeline-post-container">
              {!editModes[post.id] && (
              <div className={new Date(post.publishedAt) > new Date() ? 'unpublished' : ''}>
                <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
                <p className='post-info'>{post.author} {new Date(post.publishedAt).toLocaleString()}</p>
                <div className='admin-buttons'>
                  <button className='edit-button' onClick={() => toggleEditMode(post.id.toString())}>Redigera</button>
                  <button className='delete-button' onClick={() => deletePost(post.id)}>Radera</button>
                </div>
              </div>
              )}
              {editModes[post.id] && (
                <div className="edit-form">
                  <QuillEditor
                    placeholder={"Uppdatera ditt inlägg här..."}
                    height="400px"
                    publishOrUpdate={false}
                    delta={post.delta}
                    onPublish={handleUpdate}
                  />
                  <button className='user-button cancel-edit' onClick={() => toggleEditMode(post.id.toString())}>Ångra</button>
                </div>
                )}
          </div>))
        }
      </div>)}
    </div>
);
};




export default MakePost;