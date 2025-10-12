import React, { useState, useRef, useEffect } from 'react';
import './Exercises.css';

const exercises = [
  {
    title: "Uppgift 1: Skriv ut 'Hej världen'",
    description: "Visa en knapp som, när du klickar, skriver ut 'Hej världen' nedanför knappen.",
    html: `<button onclick="skrivUt()">Klicka här</button>
<div id="hejOutput"></div>`,
    css: `button { padding: 0.5em 1em; font-size: 1em; }
#hejOutput { margin-top: 1em; font-weight: bold; font-size: 1.2em; }`,
    js: `function skrivUt() {
  document.getElementById('hejOutput').textContent = 'Hej världen';
}`,
  },
  {
    title: "Uppgift 2: Summera två tal",
    description: "Gör ett formulär där användaren kan mata in två tal och visa summan när de klickar på en knapp.",
    html: `<input id="tal1" type="number" placeholder="Tal 1">
<input id="tal2" type="number" placeholder="Tal 2">
<button onclick="visaSumma()">Summera</button>
<div id="resultat"></div>`,
    css: `input { margin-right: 0.5em; width: 60px; }
button { padding: 0.4em 1em; }
#resultat { margin-top: 1em; font-weight: bold; }`,
    js: `function visaSumma() {
  const a = parseFloat(document.getElementById('tal1').value);
  const b = parseFloat(document.getElementById('tal2').value);
  document.getElementById('resultat').textContent = isNaN(a) || isNaN(b) ? 'Mata in två tal!' : (a + b);
}`,
  },
  {
    title: "Uppgift 3: Är talet jämnt?",
    description: "Visa ett fält där användaren skriver ett tal och får veta om det är jämnt eller udda.",
    html: `<input id="evenOdd" type="number" placeholder="Tal">
<button onclick="checkEven()">Kolla</button>
<div id="evenOddResult"></div>`,
    css: `input { margin-right: 0.5em; width: 80px; }
button { padding: 0.4em 1em; }
#evenOddResult { margin-top: 1em; font-weight: bold; }`,
    js: `function checkEven() {
  const val = parseInt(document.getElementById('evenOdd').value, 10);
  if (isNaN(val)) {
    document.getElementById('evenOddResult').textContent = 'Mata in ett tal!';
    return;
  }
  document.getElementById('evenOddResult').textContent = val % 2 === 0 ? 'Jämnt' : 'Udda';
}`,
  },
  {
    title: "Uppgift 4: Skriv ut alla element i en array",
    description: "Visa arrayen nedan. När du klickar på knappen ska alla element skrivas ut i en lista.",
    html: `<div>Array: <span id="array4"></span></div>
<button onclick="skrivUtAlla()">Skriv ut elementen</button>
<ul id="elementLista"></ul>`,
    css: `button { margin-top: 0.7em; padding: 0.4em 1em; }
ul { padding: 0 1em; }
li { margin-bottom: 0.2em; }`,
    js: `const array = ["äpple", "banan", "citron"];
document.getElementById('array4').textContent = JSON.stringify(array);
function skrivUtAlla() {
  const lista = document.getElementById('elementLista');
  lista.innerHTML = '';
  array.forEach(fruit => {
    const li = document.createElement('li');
    li.textContent = fruit;
    lista.appendChild(li);
  });
}`,
  },
  {
    title: "Uppgift 5: Räkna antalet tecken i en sträng",
    description: "Låt användaren skriva en sträng och visa hur många tecken den har.",
    html: `<input id="strInput" type="text" placeholder="Skriv något">
<button onclick="raknaTecken()">Räkna</button>
<div id="strResult"></div>`,
    css: `input { width: 160px; margin-right: 0.5em; }
button { padding: 0.3em 0.8em; }
#strResult { margin-top: 1em; font-weight: bold; }`,
    js: `function raknaTecken() {
  const s = document.getElementById('strInput').value;
  document.getElementById('strResult').textContent = \`Antal tecken: \${s.length}\`;
}`,
  },
  {
    title: "Uppgift 6: Största talet i en array",
    description: "Visa arrayen nedan. När du klickar på knappen ska det största talet visas.",
    html: `<div>Array: <span id="array6"></span></div>
<button onclick="visaStorst()">Visa största talet</button>
<div id="maxArrayResult"></div>`,
    css: `button { margin-top: 0.7em; padding: 0.4em 1em; }
#maxArrayResult { font-weight: bold; }`,
    js: `const arr6 = [1, 7, 3, 9, 5];
document.getElementById('array6').textContent = JSON.stringify(arr6);
function visaStorst() {
  document.getElementById('maxArrayResult').textContent = 'Största talet: ' + Math.max(...arr6);
}`,
  },
  {
    title: "Uppgift 7: Vänd en sträng",
    description: "Låt användaren mata in en sträng och visa den baklänges.",
    html: `<input id="reverseInput" type="text" placeholder="Skriv något">
<button onclick="vandaStrang()">Vänd</button>
<div id="reverseResult"></div>`,
    css: `input { margin-right: 0.5em; width: 120px; }
button { padding: 0.3em 0.8em; }
#reverseResult { margin-top: 1em; font-weight: bold; }`,
    js: `function vandaStrang() {
  const s = document.getElementById('reverseInput').value;
  document.getElementById('reverseResult').textContent = s.split('').reverse().join('');
}`,
  },
  {
    title: "Uppgift 8: Filtrera udda tal",
    description: "Visa arrayen nedan. När du klickar på knappen ska bara de udda talen visas.",
    html: `<div>Array: <span id="array8"></span></div>
<button onclick="filtreraUdda()">Visa udda tal</button>
<div id="oddArrayResult"></div>`,
    css: `button { margin-top: 0.7em; padding: 0.4em 1em; }
#oddArrayResult { font-weight: bold; }`,
    js: `const arr8 = [2, 3, 5, 8, 11, 14];
document.getElementById('array8').textContent = JSON.stringify(arr8);
function filtreraUdda() {
  document.getElementById('oddArrayResult').textContent =
    'Udda tal: ' + arr8.filter(x => x % 2 !== 0).join(', ');
}`,
  },
  {
    title: "Uppgift 9: Multiplicera alla tal i en array",
    description: "Visa arrayen nedan. När du klickar på knappen ska produkten av alla tal visas.",
    html: `<div>Array: <span id="array9"></span></div>
<button onclick="multipliceraAlla()">Multiplicera</button>
<div id="productResult"></div>`,
    css: `button { margin-top: 0.7em; padding: 0.4em 1em; }
#productResult { font-weight: bold; }`,
    js: `const arr9 = [1, 2, 3, 4];
document.getElementById('array9').textContent = JSON.stringify(arr9);
function multipliceraAlla() {
  document.getElementById('productResult').textContent =
    'Produkten är: ' + arr9.reduce((a, b) => a * b, 1);
}`,
  },
  {
    title: "Uppgift 10: Returnera ett objekt med namn och ålder",
    description: "Låt användaren skriva namn och ålder, och visa ett objekt med dessa värden.",
    html: `<input id="namnInput" type="text" placeholder="Namn">
<input id="alderInput" type="number" placeholder="Ålder">
<button onclick="skapaPerson()">Skapa</button>
<div id="personResult"></div>`,
    css: `input { margin-right: 0.5em; width: 80px; }
button { padding: 0.3em 0.8em; }
#personResult { margin-top: 1em; font-weight: bold; }`,
    js: `function skapaPerson() {
  const namn = document.getElementById('namnInput').value;
  const alder = document.getElementById('alderInput').value;
  document.getElementById('personResult').textContent =
    '{ namn: \"' + namn + '\", ålder: ' + alder + ' }';
}`,
  },
];

const Exercises: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [showingSolution, setShowingSolution] = useState(false);
  const [codeLayout, setCodeLayout] = useState<'columns' | 'rows'>('columns');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (selectedExercise !== null && iframeRef.current) {
      const ex = exercises[selectedExercise];
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
          <head>
          <style>${ex.css}</style>
          </head>
          <body>
          ${ex.html}
          <script>${ex.js}<\/script>
          </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [selectedExercise]);

  const handleExerciseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(event.target.value, 10);
    setSelectedExercise(isNaN(idx) ? null : idx);
    setShowingSolution(false);
  };

  const toggleView = () => {
    if (selectedExercise === null) return;
    setShowingSolution(!showingSolution);
  };

  const escapeHTML = (str: string) => {
    return str.replace(/[&<>]/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    }[c] || c));
  };

  const renderContent = () => {
    if (selectedExercise === null) {
      return <p>Välj en övning i rullgardinsmenyn ovan för att börja.</p>;
    }

    const ex = exercises[selectedExercise];

    if (!showingSolution) {
      return (
        <div>
          <h2>{ex.title}</h2>
          <p>{ex.description}</p>
          <iframe ref={iframeRef} className="previewer-frame" title="Live Preview"></iframe>
        </div>
      );
    } else {
      return (
        <div className={`solution-expanded ${codeLayout === 'columns' ? 'code-layout-columns' : 'code-layout-rows'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
            <h2 style={{ marginBottom: 0 }}>{ex.title}</h2>
            <div className="code-toggle">
              <span>Visa:</span>
              <button
                id="layoutColumns"
                className={codeLayout === 'columns' ? 'active' : ''}
                title="Visa kod i kolumner"
                onClick={() => setCodeLayout('columns')}
              >
                Kolumner
              </button>
              <button
                id="layoutRows"
                className={codeLayout === 'rows' ? 'active' : ''}
                title="Visa kod i rader"
                onClick={() => setCodeLayout('rows')}
              >
                Rader
              </button>
            </div>
          </div>
          <p>{ex.description}</p>
          <div className="code-columns">
            <div className="code-block">
              <strong>HTML</strong>
              <pre>{escapeHTML(ex.html)}</pre>
            </div>
            <div className="code-block">
              <strong>CSS</strong>
              <pre>{escapeHTML(ex.css)}</pre>
            </div>
            <div className="code-block">
              <strong>JavaScript</strong>
              <pre>{escapeHTML(ex.js)}</pre>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="exercises-container">
      <header className="spa-header">
        <h1 id="spa-title">JavaScript Övningar</h1>
        <div className="spa-header-controls">
          <label htmlFor="exerciseSelector" className="visually-hidden">Välj övning:</label>
          <select id="exerciseSelector" value={selectedExercise ?? ''} onChange={handleExerciseChange}>
            <option value="">Välj övning</option>
            {exercises.map((ex, i) => (
              <option key={i} value={i}>{ex.title}</option>
            ))}
          </select>
          <button id="toggleView" type="button" disabled={selectedExercise === null} onClick={toggleView}>
            {showingSolution ? 'Visa Färdig UI' : 'Visa Kodlösning'}
          </button>
        </div>
      </header>
      <main id="exerciseArea" className="spa-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default Exercises;