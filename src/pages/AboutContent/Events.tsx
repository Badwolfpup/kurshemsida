import React from 'react';
import type PostType from '../../Types/PostType';
import { usePosts } from '../../hooks/usePosts';




const Events: React.FC = () => {
  const { data : posts = [] as PostType[], isLoading, isError, error, isFetching, refetch } = usePosts();

  if (isLoading) return (
    <div className="events-content">
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Laddar händelser...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="events-content">
      <div className="error-container">
        <p>{error?.message}</p>
        <button className="retry-button" onClick={() => {refetch();}} disabled={isFetching}>
          {isFetching ? 'Laddar...' : 'Försök igen'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="events-content">
      <h2>På Gång</h2>

      <div className="events-intro">
        <p>
          Håll dig uppdaterad om kommande evenemang, aktiviteter och viktiga datum!
          Här hittar du information om allt från gästföreläsningar och företagsbesök
          till specialarrangemang och deadlines. Kolla in regelbundet för att inte
          missa något spännande.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="events-list">
          {posts.map((post) => (
            <div key={post.id} className="event-card">
              <div className="event-content" dangerouslySetInnerHTML={{ __html: post.html }}></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-events">
          <div className="no-events-icon">📅</div>
          <h3>Inga kommande händelser</h3>
          <p>Det finns inga planerade evenemang just nu. Kom tillbaka snart för uppdateringar!</p>
        </div>
      )}
    </div>
  );
};

export default Events;