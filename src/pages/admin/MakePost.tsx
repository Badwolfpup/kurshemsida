import React, { useState } from 'react';
import 'quill/dist/quill.snow.css';
import { processDeltaForImages } from '../../utils/imageUtils';
import QuillEditor from '../../utils/quillEditor';
import Toast from '../../utils/toastMessage';
import type { AddPostDto, UpdatePostDto } from '../../Types/Dto/PostDto';
import type PostType  from '../../Types/PostType';
import { usePosts, useAddPost, useUpdatePost, useDeletePost } from '../../hooks/usePosts';
import { useUser } from '../../context/UserContext';
  


const MakePost: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [showNewPostForm, setShowNewPostForm] = useState<boolean>(false);
  const { userId } = useUser();
  const [editModes, setEditModes] = useState<Record<string,boolean>>({});
  const { data : posts = [] as PostType[], isLoading, isError, error, isFetching, refetch } = usePosts();
  const addPost = useAddPost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

 
  
  const handleUpdatePost = async (id: number,html: string, delta: any, date: string | null) => {
      const processedDelta = await processDeltaForImages(delta);
      const postobject: UpdatePostDto = {
        id: id,
        html: html,
        delta: JSON.stringify({ ops: processedDelta }),
        publishDate: date || new Date().toISOString(),
      };
      updatePost.mutate(postobject, {
        onSuccess: () => {
          toggleEditMode(id.toString());
          setToastMessage('Inlägget har uppdaterats!');
        }
      });
  };


  const handleAddPost = async (html: string, delta: any, date: string | null) => {
      const processedDelta = await processDeltaForImages(delta);
      const postobject: AddPostDto = {
        html: html,
        delta: JSON.stringify({ ops: processedDelta }),
        publishDate: date || new Date().toISOString(),
        userId: userId as number,
      };
      addPost.mutate(postobject, {
        onSuccess: () => {
          setShowNewPostForm(false);
          setToastMessage('Inlägget har publicerats!');
        }
      });
  };

    const toggleEditMode = (postId: string) => {
    setEditModes(prev => ({
      ...prev,
      [postId]: !prev[postId] // Toggle for this ID
    }));
  };

  return (
    <div>
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Laddar användare...</p>
        </div>
      ) : isError ? (
        <div className="error-container">
          <p>{error?.message}</p>
          <button className="retry-button" onClick={() => {refetch()}} disabled={isFetching}>{isFetching ? 'Laddar...' : 'Försök igen'}</button>
        </div>
      ) : (
      <div  className='page-main'>
        <div className='page-header'>
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
              <h1>Skapa inlägg</h1>
              <button className='standard-btn' onClick={() => setShowNewPostForm(!showNewPostForm)}>{showNewPostForm ? 'Dölj formulär' : 'Nytt inlägg'}</button>
            <div className={`new-post-form ${showNewPostForm ? '' : 'hidden'}`}>
              <QuillEditor
                placeholder="Write your post here..."
                height="400px"
                publishOrUpdate={true}
                onPublish={handleAddPost}
              />
            </div>
        </div>
        <div className='page-content'>
          {posts.map((post) => (
            <div key={post.id} className="post-container">
                {!editModes[post.id] && (
                <div className={new Date(post.publishedAt) > new Date() ? 'unpublished' : ''}>
                  <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
                  <p className='post-info'>{post.author} {new Date(post.publishedAt).toLocaleString()}</p>
                  <div className='flex-horizontal-right-aligned'>
                    <button className='edit-btn' onClick={() => toggleEditMode(post.id.toString())}>Redigera</button>
                    <button className='delete-btn' onClick={() => deletePost.mutate(post.id)}>Radera</button>
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
                      onUpdate={(html, delta, date) => handleUpdatePost(post.id, html, delta, date)}
                    />
                    <button className='standard-btn cancel-edit' onClick={() => toggleEditMode(post.id.toString())}>Ångra</button>
                  </div>
                  )}
            </div>))
          }
        </div>
      </div>)}
    </div>
);
};




export default MakePost;