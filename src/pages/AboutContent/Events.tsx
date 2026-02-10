import React from 'react';
import type PostType from '../../Types/PostType';
import { usePosts } from '../../hooks/usePosts';
import './Events.css';




const Events: React.FC = () => {
  const { data : posts = [] as PostType[], isLoading, isError, error, isFetching, refetch } = usePosts();

  if (isLoading) return (
    <div className="about-content">
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Laddar händelser...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="about-content">
      <div className="error-container">
        <p>{error?.message}</p>
        <button className="retry-button" onClick={() => {refetch();}} disabled={isFetching}>
          {isFetching ? 'Laddar...' : 'Försök igen'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="about-content">
      <h2>På Gång</h2>

      <div className="about-intro">
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
      <div className="about-section special-section">
        <h3>Tidigare Företagsbesök & Gästföreläsningar</h3>
        <div className="special-activities">
          <p className="special-intro">
            Vi bjuder regelbundet in mjukvaruföretag för att ge dig insikt i hur det är
            att arbeta som professionell programmerare. Våra gäster delar med sig av sina
            erfarenheter, pratar om sina projekt och svarar på frågor om karriärvägar
            inom IT-branschen.
          </p>

          <div className="companies-visited">
            <h4>Tidigare företagsbesök:</h4>
            <div className="companies-grid">
              <div className="company-card">
                <div className="company-icon">🏢</div>
                <div className="company-name">AppTech</div>
              </div>
              <div className="company-card">
                <div className="company-icon">🏢</div>
                <div className="company-name">Hiab</div>
              </div>
              <div className="company-card">
                <div className="company-icon">🏢</div>
                <div className="company-name">Xlent</div>
              </div>
            </div>
          </div>

          <div className="special-benefits">
            <h4>Vad ger företagsbesöken?</h4>
            <ul>
              <li>Insikt i verkliga arbetsuppgifter för programmerare</li>
              <li>Förståelse för företagskultur och arbetsmetoder</li>
              <li>Möjlighet att ställa frågor direkt till yrkesverksamma</li>
              <li>Nätverkande och möjliga framtida jobbkontakter</li>
              <li>Inspiration för din egen karriärväg</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;