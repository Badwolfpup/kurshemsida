import React from 'react';
import './CourseStyles.css';

const JsIntroduktion: React.FC = () => {
  return (
    <div className="course-page">
      <h1>Introduktion till JavaScript — Grunder</h1>
      <p>En lättöverskådlig guide med exempel och förklaringar.</p>

      <article className="article">
        <section id="vad">
          <h2>Vad är JavaScript?</h2>
          <div className="card">
            <p>JavaScript står ofta för all interaktiv funktionalitet på webbplatser. Det låter sidor reagera på vad användaren gör — klick, formulär, animationer och spel direkt i webbläsaren.</p>
            <p>Med JavaScript kan du visa meddelanden, flytta element, hantera data och bygga både front‑ och backend‑applikationer.</p>
          </div>
        </section>

        <section id="var">
          <h2>Var används JavaScript?</h2>
          <div className="card">
            <ul>
              <li><strong>Webbsidor</strong> — gör sidor interaktiva.</li>
              <li><strong>Mobilappar</strong> — till exempel med React Native.</li>
              <li><strong>Servrar</strong> — med miljöer som Node.js kan JavaScript köra serverkod.</li>
              <li><strong>Smarta enheter</strong> — smart‑TV, klockor, IoT‑enheter med mera.</li>
              <li><strong>Spel</strong> — många webbaserade spel är byggda med JavaScript.</li>
            </ul>
          </div>
        </section>

        <section id="koppla">
          <h2>Hur länkar du en JavaScript‑fil till din HTML?</h2>
          <div className="card">
            <p>Lägg en script‑tagg i din HTML, vanligtvis i slutet av <code>&lt;body&gt;</code>:</p>
            <pre className="code-block"><code>&lt;script src="app.js"&gt;&lt;/script&gt;</code></pre>
            <p>Eller skriv inline (inte rekommenderat för större projekt):</p>
            <pre className="code-block"><code>&lt;script&gt;console.log('Hej från sidan')&lt;/script&gt;</code></pre>
          </div>
        </section>
      </article>

      <aside className="aside">
        <h3>Snabbreferens</h3>
        <div className="card">
          <p><strong>Vanliga nyckelord:</strong></p>
          <ul>
            <li><code>let</code> — deklarera variabel som kan ändras</li>
            <li><code>const</code> — deklarera konstant</li>
            <li><code>if / else</code> — villkor</li>
            <li><code>for / while</code> — loopar</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default JsIntroduktion;