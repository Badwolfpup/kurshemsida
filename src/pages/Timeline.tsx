import React, { useState, useEffect } from 'react';
import './timelines.css';

interface Post {
  Html: string;
  PublishedAt: Date;
  Author: string;
  Pinned: number;
}

const Timeline: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found. Please log in.');
      return;
    }
    try {
      const response = await fetch('https://localhost:5001/api/get-posts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },        
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const posts: Post[] = await response.json();
      console.log('Fetched posts:', posts);
      setPosts(posts);
    }
    catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      {posts.map((post, i) => ( 
        <div key={i} className="post-container"> 
          <div dangerouslySetInnerHTML={{ __html: post.Html }}></div>
          <p className='post-info'>{post.Author} {post.PublishedAt.toString()}</p>
        </div>))}   
    </div>
  );
};

export default Timeline;