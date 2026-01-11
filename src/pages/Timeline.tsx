import React, { useState, useEffect } from 'react';
import './timeline.css';
import { useUser } from '../context/UserContext';
import QuillEditor from '../utils/quillEditor';

interface Post {
  id: number;
  html: string;
  delta: string;
  publishedAt: Date;
  author: string;
  pinned: number;
}

const Timeline: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { userType, userId } = useUser();
  const [editModes, setEditModes] = useState<Record<string,boolean>>({});

  const fetchPosts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found. Please log in.');
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


  const toggleEditMode = (postId: string) => {
    setEditModes(prev => ({
      ...prev,
      [postId]: !prev[postId] // Toggle for this ID
    }));
  };



  return (
    <div className='timeline-main'>
      {posts.map((post) => ( 
        <div key={post.id} className="timeline-post-container"> 
            {!editModes[post.id] && (
            <div className={new Date(post.publishedAt) > new Date() ? 'unpublished' : ''}>
              <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
              <p className='post-info'>{post.author} {new Date(post.publishedAt).toLocaleString()}</p>
              {(userType === 'Admin' || userType === 'Teacher') && (
                <div className='admin-buttons'>
                  <button className='edit-button' onClick={() => toggleEditMode(post.id.toString())}>Redigera</button>
                  <button className='delete-button' onClick={() => deletePost(post.id)}>Radera</button>
                </div>
              )}
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
        </div>))}

    </div>
    
  );
};

export default Timeline;