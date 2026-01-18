import React, { useState, useEffect } from 'react';
import './Events.css';

interface Post {
  id: number;
  html: string;
  delta: string;
  publishedAt: Date;
  author: string;
  pinned: number;
}

const Events: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/fetch-posts');
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





  return (
    <>
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Laddar inlägg...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button className="retry-button" onClick={fetchPosts}>Försök igen</button>
        </div>
      )}

      {!loading && !error && posts.map((post) => (
        <div key={post.id} className="event-post">
          <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
        </div>
      ))}
    </>
  );
};

export default Events;