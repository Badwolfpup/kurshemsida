import React, { useState, useRef, useEffect } from 'react';
import type ExerciseType from '../Types/ExerciseType';
import { useExercises } from '../hooks/useExercises';
import './Exercises.css';
import '../styles/spinner.css';



const Exercises: React.FC = () => {

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showAllExercises, setShowAllExercises] = useState<boolean>(true);

  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const [course, setCourse] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<boolean[]>([true, false, false, false, false]);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const [cluesExposed, setCluesExposed] = useState<number>(0);
  const { data: exercises = [] as ExerciseType[], isLoading, isError, error, refetch, isRefetching } = useExercises();
  const [iframeKey, setIframeKey] = useState(0);
  

    useEffect(() => {
        if (selectedExercise !== null && iframeRef. current) {
            const iframe = iframeRef.current;

            
        iframe.onload = () => {
        const iframeWindow = iframe. contentWindow as any;
        if (iframeWindow) {
            let logs = '';
            
            iframeWindow.console.log = (...args: any[]) => {
             const formattedArgs: string[] = args.map(arg => 
                typeof arg === 'object' && arg !== null ? JSON.stringify(arg) : String(arg)
            );
            logs += formattedArgs.join(' ') + '\n';
            // Update the pre inside iframe
            const pre = iframeWindow.document.getElementById('console-output');
            if (pre) pre.textContent = logs;
            };
            iframeWindow.console.debug = (... args: any[]) => {
            logs += args.join(' ') + '\n';
            const pre = iframeWindow.document.getElementById('console-output');
            if (pre) pre.textContent = logs;
            };
            iframeWindow.console. error = (...args: any[]) => {
            logs += '❌ ' + args.join(' ') + '\n';
            const pre = iframeWindow.document.getElementById('console-output');
            if (pre) pre.textContent = logs;
            };
            iframeWindow.console.warn = (...args: any[]) => {
            logs += '⚠️ ' + args.join(' ') + '\n';
            const pre = iframeWindow.document.getElementById('console-output');
            if (pre) pre.textContent = logs;
            };

            iframeWindow.onerror = (message:  string, lineno?: number) => {
            logs += `❌ Error: ${message} at line ${lineno}\n`;
            const pre = iframeWindow.document.getElementById('console-output');
            if (pre) pre.textContent = logs;
            return true;
            };
            
            try {
            const script = iframeWindow.document.createElement('script');
            script.textContent = inputCode;
            iframeWindow. document.body.appendChild(script);
            } catch (e) {
            logs += `❌ Script Error: ${e}\n`;
            const pre = iframeWindow.document.getElementById('console-output');
            if (pre) pre.textContent = logs;
            }
        }
        };

        // Include the pre in srcdoc
        iframe. srcdoc = `
        <html>
        <head>
            <style>
                #console-output {
                    background: #1e1e1e;
                    color: #0f0;
                    padding: 10px;
                    font-family: monospace;
                    white-space: pre-wrap;
                    overflow-y: auto;  /* Allow scrolling if content exceeds height */
                }
            </style>
        </head>
        <body>
            <pre id="console-output"></pre>
        </body>
        </html>
        `;
                }
    }, [iframeKey]);

    const reset = () => {
        setInputCode('');
        setCluesExposed(0);

    }

  if (isLoading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Laddar användare...</p>
    </div>
  );

  if (isError) return (
    <div className="error-container">
      <p>{error.message}</p>
      <button className="retry-button" onClick={() => {refetch()}} disabled={isRefetching}>{isRefetching ? 'Laddar...' : 'Försök igen'}</button>
    </div>
  );

  return (<>
    {showAllExercises &&
      (<div className="all-exercises-container" >
          <header className="exercises-header">
              <div className="exercises-header-controls">
                  <select id="exerciseSelect" value={course} onChange={(e) => { setCourse(e.target.value); setIframeKey(prev => prev + 1);}}>
                        <option value="">Alla Övningar</option>
                        <option value="strings">Strängar</option>
                        <option value="numbers">Tal</option>
                        <option value="conditionals">Villkorsatser</option>
                        <option value="functions">Funktioner</option>
                        <option value="loops">Loopar</option>
                        <option value="arrays">Arrayer</option>
                        <option value="objects">Objekt</option>
                        <option value="dom">DOM</option>
                        <option value="events">Events</option>
                        <option value="api">Använda API</option>
                  </select>
                  <div className='exercises-lightbulbs'>
                      {difficultyFilter.map((lightbulb, i) => (
                          <span key={i} className={`difficulty ${lightbulb ? "high" : "low"}`} onClick={() => {
                              const newfilter = Array(5).fill(false).map((_, idx) => idx <= i);
                              setDifficultyFilter(newfilter);
                              setDifficultyLevel(i + 1);
                          }}>💡</span>
                      ))}
                  </div>
              </div>
          </header>
          <div className="exercises-list">
              {exercises.filter(x => course ? x.exerciseType === course && x.difficulty >= difficultyLevel : x.difficulty >= difficultyLevel).map((ex) =>  (
                  <div key={ex.id} className="exercise-card" onClick={() => { setSelectedExercise(ex); reset(); setShowAllExercises(false); }}>
                      <h2>{ex.title}</h2>
                      <p>{ex.description}</p>
                      <div className="exercise-lightbulb-container">
                          {Array.from({ length: ex.lightbulbs.reduce((a, b) => b ? a + 1 : a, 0) }).map((_, i) => (
                              <span key={i} className={'difficulty high'}>💡</span>
                          ))}
                      </div> 
                  </div>
              ))}
          </div>

      </div>)
    }
      
    {!showAllExercises && (<div className='exercise-solution-container'>
          <div className="exercise-nav-controls">
            <button id="toggleView" type="button" className='user-button' disabled={selectedExercise === null} onClick={() => { setShowAllExercises(true); setCluesExposed(0);}}>Gå tillbaka</button>
          </div>
          <div className='exercise-title-button'>
              <h2>{selectedExercise?.title}</h2>
              <button className='user-button' type="button" onClick={() => setIframeKey(prev => prev + 1)}>Kör kod</button>
              <button id="toggleView" className={cluesExposed < (selectedExercise?.clues?.length ?? 0) ? "" : "no-more-clues"} type="button" disabled={selectedExercise === null} onClick={() => setCluesExposed(prev => prev+1)}>{cluesExposed < (selectedExercise?.clues?.length ?? 0) ? 'Visa ledtråd' : 'Slut på ledtrådar'}</button>
          </div>
          <p>{selectedExercise?.description}</p>
          <p>Förväntat resultat: <strong>{selectedExercise?.expectedResult}</strong></p>
        <main id="exerciseArea" className="spa-main">
          <div className="javascript-section exercise-javascript-section">
              <textarea rows={20}  value={inputCode} placeholder='JavaScript-kod här' onChange={(e) => setInputCode(e.target.value)}></textarea>                 
          </div>
          <iframe ref={iframeRef} className="exercise-previewer-frame" title="Live Preview"></iframe>
          {selectedExercise?.clues && selectedExercise.clues.length > 0 && (
              <div className="clues-display">
                  {selectedExercise.clues.slice(0, cluesExposed).map((clue, i) => (
                      <div key={i} className="clue-item">
                          <textarea
                              rows={2}
                              value={clue}
                              readOnly
                              className="clue-display-text"
                          />

                      </div>
                  ))}
              </div>
          )}
        </main>
      </div>)}
    
  </>);
};

export default Exercises;