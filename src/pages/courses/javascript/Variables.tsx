import React from 'react';
import './CourseStyles.css';

const JsVariables: React.FC = () => {
  return (
    <div className="course-page">
      <h1>Variabler och Datatyper i JavaScript</h1>
      <p>Förstå grunderna i variabler och datatyper.</p>

      <article className="article">
        <section id="datatyper">
          <h2>Datatyper i JavaScript</h2>
          <div className="card">
            <p>JavaScript använder flera grundläggande datatyper:</p>
            <ul>
              <li><strong>String</strong> — text: "Hej".</li>
              <li><strong>Number</strong> — siffror: 5, 3.14, -100.</li>
              <li><strong>Boolean</strong> — sant eller falskt: <code>true</code> / <code>false</code>.</li>
              <li><strong>Array</strong> — lista med värden: <code>[1, 2, 3]</code> eller <code>["äpple","banan"]</code>.</li>
              <li><strong>Object</strong> — strukturerade värden med nyckel–värde‑par: <code>{`{namn: "Anna", ålder: 22}`}</code>.</li>
              <li><strong>Undefined</strong> — variabeln har inget tilldelat värde än.</li>
              <li><strong>Null</strong> — ett medvetet tomt värde.</li>
            </ul>
          </div>
        </section>

        <section id="variabler">
          <h2>Variabler</h2>
          <div className="card">
            <p>En variabel är ett namn som sparar ett värde i minnet — tänk etiketten på en låda.</p>
            <p>I JavaScript deklarerar du variabler med <code>let</code> (ändringsbar) eller <code>const</code> (konstant):</p>
            <pre className="code-block">{`// let kan ändras
let age = 22
age = 23

// const kan inte ändras
const birthYear = 1998

// objekt
let person = { firstName: "Vicki", lastName: "Windahl", age: 27 }`}</pre>
            <p>Variabelnamn bör vara beskrivande och följa vanliga regler (inga mellanslag, börja inte med siffra).</p>
          </div>
        </section>
      </article>
    </div>
  );
};

export default JsVariables;