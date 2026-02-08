import React, { useState, useEffect } from 'react';
// import { useRef } from 'react';
// import type ExerciseType from '../Types/ExerciseType';
// import { useExercises } from '../hooks/useExercises';
import type { AssertExerciseResponse } from '../Types/AssertExerciseType.ts';
import type AssertExerciseType from '../Types/AssertExerciseType.ts';
import { assertService } from '../api/AssertService';
import { expect } from 'vitest';
import './Exercises.css';
import '../styles/spinner.css';

interface TestResult {
    comment: string;
    passed: boolean;
    error?: string;
}


const Exercises: React.FC = () => {

//   const iframeRef = useRef<HTMLIFrameElement>(null);
//   const [showAllExercises, setShowAllExercises] = useState<boolean>(true);

//   const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const [course, setCourse] = useState<string>('');
  const [AIExercise, setAIExercise] = useState<AssertExerciseResponse | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [inputCode, setInputCode] = useState<string>('');
  const [hasCode, setHasCode] = useState<boolean>(false);
  const [difficultyFilter, setDifficultyFilter] = useState<boolean[]>([true, false, false, false, false]);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const [AIModel, setAIModel] = useState<string>('anthropic');
//   const [cluesExposed, setCluesExposed] = useState<number>(0);
//   const { data: exercises = [] as ExerciseType[], isLoading, isError, error, refetch, isRefetching } = useExercises();
//   const [iframeKey, setIframeKey] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [showSolutionButton, setShowSolutionButton] = useState<boolean>(false);
  const [isLoadingExercise, setIsLoadingExercise] = useState<boolean>(false);
  const [exerciseError, setExerciseError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(90);

    useEffect(() => {
    if (AIExercise?.functionSignature) {
        setInputCode(AIExercise.functionSignature);
        setHasCode(AIExercise.functionSignature.length > 0);
    }
    }, [AIExercise]);

    // Countdown timer for loading state
    useEffect(() => {
      let intervalId: number;

      if (isLoadingExercise) {
        setCountdown(90); // Reset to 90 seconds
        intervalId = window.setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(intervalId);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, [isLoadingExercise]);

    // useEffect(() => {
    //     if (selectedExercise !== null && iframeRef. current) {
    //         const iframe = iframeRef.current;

            
    //     iframe.onload = () => {
    //     const iframeWindow = iframe. contentWindow as any;
    //     if (iframeWindow) {
    //         let logs = '';
            
    //         iframeWindow.console.log = (...args: any[]) => {
    //          const formattedArgs: string[] = args.map(arg => 
    //             typeof arg === 'object' && arg !== null ? JSON.stringify(arg) : String(arg)
    //         );
    //         logs += formattedArgs.join(' ') + '\n';
    //         // Update the pre inside iframe
    //         const pre = iframeWindow.document.getElementById('console-output');
    //         if (pre) pre.textContent = logs;
    //         };
    //         iframeWindow.console.debug = (... args: any[]) => {
    //         logs += args.join(' ') + '\n';
    //         const pre = iframeWindow.document.getElementById('console-output');
    //         if (pre) pre.textContent = logs;
    //         };
    //         iframeWindow.console. error = (...args: any[]) => {
    //         logs += '❌ ' + args.join(' ') + '\n';
    //         const pre = iframeWindow.document.getElementById('console-output');
    //         if (pre) pre.textContent = logs;
    //         };
    //         iframeWindow.console.warn = (...args: any[]) => {
    //         logs += '⚠️ ' + args.join(' ') + '\n';
    //         const pre = iframeWindow.document.getElementById('console-output');
    //         if (pre) pre.textContent = logs;
    //         };

    //         iframeWindow.onerror = (message:  string, lineno?: number) => {
    //         logs += `❌ Error: ${message} at line ${lineno}\n`;
    //         const pre = iframeWindow.document.getElementById('console-output');
    //         if (pre) pre.textContent = logs;
    //         return true;
    //         };
            
    //         try {
    //         const script = iframeWindow.document.createElement('script');
    //         script.textContent = inputCode;
    //         iframeWindow. document.body.appendChild(script);
    //         } catch (e) {
    //         logs += `❌ Script Error: ${e}\n`;
    //         const pre = iframeWindow.document.getElementById('console-output');
    //         if (pre) pre.textContent = logs;
    //         }
    //     }
    //     };

    //     // Include the pre in srcdoc
    //     iframe. srcdoc = `
    //     <html>
    //     <head>
    //         <style>
    //             #console-output {
    //                 background: #1e1e1e;
    //                 color: #0f0;
    //                 padding: 10px;
    //                 font-family: monospace;
    //                 white-space: pre-wrap;
    //                 overflow-y: auto;  /* Allow scrolling if content exceeds height */
    //             }
    //         </style>
    //     </head>
    //     <body>
    //         <pre id="console-output"></pre>
    //     </body>
    //     </html>
    //     `;
    //             }
    // }, [iframeKey]);

    // const reset = () => {
    //     setInputCode('');
    //     setCluesExposed(0);
    //     setTestResults([]);
    // }

    const getAssert = async ()=> {
        if (!course) {
            alert('Vänligen välj en övningstyp innan du skapar en övning.');
            return;
        }

        // Disable button while loading
        setIsButtonDisabled(true);

        // Hide solution button and show it after 5 minutes
        setShowSolutionButton(false);
        setTimeout(() => {
            setShowSolutionButton(true);
        }, 300000); // 5 minutes = 300000ms

        // Start loading
        setIsLoadingExercise(true);
        setExerciseError(null);

        try {
            const newexercise = {topic: course, difficulty: difficultyLevel, language: 'javascript'} as AssertExerciseType;
            const result: AssertExerciseResponse | null = await assertService.fetchExerciseAssert(newexercise, AIModel);
            setAIExercise(result);
        } catch (error: any) {
            console.error('Error fetching exercise:', error);
            setExerciseError(error?.message || 'Ett fel uppstod när övningen skulle hämtas');
        } finally {
            setIsLoadingExercise(false);
            setIsButtonDisabled(false);
        }
    }

    const testAsserts = () => {
        if (!AIExercise?.asserts) return;
        
        const results: TestResult[] = [];
    
        AIExercise.asserts.forEach((assert) => {
            try {
                // Create function with student code + test in same scope
                const testFn = new Function('expect', `
                    ${inputCode}
                    
                    // Now run the specific test
                    ${assert.code}
                `);
                
                // Execute with expect
                testFn(expect);
                
                results.push({
                    comment: assert.comment,
                    passed: true
                });
                
            } catch (error: any) {
                results.push({
                    comment: assert.comment,
                    passed: false,
                    error: error.message
                });
            }
        });
        
        setTestResults(results);
    };

//   if (isLoading) return (
//     <div className="loading-container">
//       <div className="spinner"></div>
//       <p>Laddar användare...</p>
//     </div>
//   );

//   if (isError) return (
//     <div className="error-container">
//       <p>{error.message}</p>
//       <button className="retry-button" onClick={() => {refetch()}} disabled={isRefetching}>{isRefetching ? 'Laddar...' : 'Försök igen'}</button>
//     </div>
//   );

  return (<>
    {/* {showAllExercises &&
      (<div className="page-main" >
          <header className="page-header-row-direction">
            <button className={isButtonDisabled ? 'greyed-btn' : 'standard-btn'} onClick={() => getAssert()} disabled={isButtonDisabled}>Skapa övning</button>
            <h2>Välj övningstyp och svårighetsgrad</h2>
            <select className='standard-select' id="exerciseSelect" value={course} onChange={(e) => { setCourse(e.target.value); setIframeKey(prev => prev + 1);}}>
                <option value="">Välj övningstyp</option>
                <option value="variables">Datatyper</option>
                <option value="strings">Strängar</option>
                <option value="numbers">Tal</option>
                <option value="conditionals">Villkorsatser</option>
                <option value="functions">Funktioner</option>
                <option value="loops">Loopar</option>
                <option value="arrays">Arrayer</option>
                <option value="objects">Objekt</option>
                <option value="dom">DOM</option>
                <option value="events">Events</option>
            </select>
            <div className='flex-horizontal'>
                {difficultyFilter.map((lightbulb, i) => (
                    <span key={i} className={`difficulty ${lightbulb ? "high" : "low"}`} onClick={() => {
                        const newfilter = Array(5).fill(false).map((_, idx) => idx <= i);
                        setDifficultyFilter(newfilter);
                        setDifficultyLevel(i + 1);
                    }}>💡</span>
                ))}
            </div>
          </header>
          <div className="page-content">
              {exercises.filter(x => course ? x.exerciseType === course && x.difficulty >= difficultyLevel : x.difficulty >= difficultyLevel).map((ex) =>  (
                  <div key={ex.id} className="exercise-card" onClick={() => { setSelectedExercise(ex); reset(); setShowAllExercises(false); }}>
                      <h2>{ex.title}</h2>
                      <p>{ex.description}</p>
                      <div className="flex-horizontal-center">
                          {Array.from({ length: ex.lightbulbs.reduce((a, b) => b ? a + 1 : a, 0) }).map((_, i) => (
                              <span key={i} className={'difficulty high'}>💡</span>
                          ))}
                      </div> 
                  </div>
              ))}
          </div>

      </div>)
    } */}
     
        <header className="page-header-row-direction">
            <select className='standard-select' value={AIModel} onChange={(e) => setAIModel(e.target.value)}>
                <option value="anthropic">Anthropic</option>
                <option value="deepseek">Deepseek</option>
            </select>
            <button className={isButtonDisabled ? 'greyed-btn' : 'standard-btn'} onClick={() => getAssert()} disabled={isButtonDisabled}>Generera</button>
            <h2>AI-genererade övningar</h2>
            <select className='standard-select' id="exerciseSelect" value={course} onChange={(e) => { setCourse(e.target.value);/* setIframeKey(prev => prev + 1);*/}}>
                <option value="">Välj övningstyp</option>
                <option value="variables">Datatyper</option>
                <option value="strings">Strängar</option>
                <option value="numbers">Tal</option>
                <option value="conditionals">Villkorsatser</option>
                <option value="functions">Funktioner</option>
                <option value="loops">Loopar</option>
                <option value="arrays">Arrayer</option>
                <option value="objects">Objekt</option>
                <option value="dom">DOM</option>
                <option value="events">Events</option>
            </select>
            <div className='flex-horizontal'>
                {difficultyFilter.map((lightbulb, i) => (
                    <span key={i} className={`difficulty ${lightbulb ? "high" : "low"}`} onClick={() => {
                        const newfilter = Array(5).fill(false).map((_, idx) => idx <= i);
                        setDifficultyFilter(newfilter);
                        setDifficultyLevel(i + 1);
                    }}>💡</span>
                ))}
            </div>
          </header>

          {isLoadingExercise && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Genererar övning... ({countdown}s kvar)</p>
            </div>
          )}

          {exerciseError && !isLoadingExercise && (
            <div className="error-container">
              <p>{exerciseError}</p>
              <button className="retry-button" onClick={() => getAssert()}>Försök igen</button>
            </div>
          )}

          {!isLoadingExercise && !exerciseError && AIExercise !== null && (<div className='exercise-solution-container'>
            <h2>{AIExercise?.title}</h2>

        <p>{AIExercise?.description}</p>
        <div className='flex-horizontal-flex-start'>
            <div className='flex-column'>
                <p className='no-margin-onY'><strong>Expected output: </strong></p>
                <div className='flex-column'>
                    <ul>
                        {AIExercise.example?.split('\n').map((line, index) => (
                            <li key={index}>{line}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className='flex-column'>
                <p className='no-margin-onY'><strong>Assumptions: </strong></p>
                <div className='flex-column'>
                    <ul>
                        {AIExercise.assumptions?.split('\n').map((line, index) => {
                            const firstLetterIndex = line.search(/[a-zA-Z]/);
                            return <li key={index}>{firstLetterIndex !== -1 ? line.slice(firstLetterIndex) : line}</li>;
                        })}
                    </ul>
                </div>
            </div>
        </div>
        
        <div className='flex-column'>
            <textarea rows={10} className='standard-textarea'  value={inputCode} placeholder='JavaScript-kod här' onChange={(e) => { setInputCode(e.target.value); setHasCode(inputCode.length > 0 || false); }}>{AIExercise.functionSignature}</textarea>                 
            <div className='flex-horizontal'>
                <button className={`width-150px ${hasCode ? 'standard-btn' : 'greyed-btn'}`} type="button" disabled={!hasCode} onClick={() => testAsserts()}>Kör kod</button>
                {showSolutionButton && <button className={`width-150px standard-btn`} onClick={() => setInputCode(AIExercise?.solution || "")}>Visa lösning</button>}
            </div>

            {testResults.map((result, index) => (
                <div key={index} className={`flex-horizontal test-result ${result.passed ? 'passed' : 'failed'}`}>
                    <span>{result.passed ? '✅' : '❌'} {result.comment}</span>
                    {result.error && <pre className='error-message'>{result.error}</pre>}
                </div>
            ))
        }</div>
      </div>)} 
    {/* {!showAllExercises && (<div className='exercise-solution-container'>
          <div className="exercise-nav-controls">
            <button id="toggleView" type="button" className='standard-btn' disabled={selectedExercise === null} onClick={() => { setShowAllExercises(true); setCluesExposed(0);}}>Gå tillbaka</button>
          </div>
          <div className='exercise-title-button'>
              <h2>{selectedExercise?.title}</h2>
              <button className={`${hasCode ? 'standard-btn' : 'greyed-btn'}`} type="button" disabled={!hasCode} onClick={() => setIframeKey(prev => prev + 1)}>Kör kod</button>
              <button id="toggleView" className={cluesExposed < (selectedExercise?.clues?.length ?? 0) ? "" : "no-more-clues"} type="button" disabled={selectedExercise === null} onClick={() => setCluesExposed(prev => prev+1)}>{cluesExposed < (selectedExercise?.clues?.length ?? 0) ? 'Visa ledtråd' : 'Slut på ledtrådar'}</button>
          </div>
          <p>{selectedExercise?.description}</p>
          <p>Förväntat resultat: <strong>{selectedExercise?.expectedResult}</strong></p>
        <main id="exerciseArea" className="spa-main">
          <div className="javascript-section exercise-javascript-section">
              <textarea rows={20}  value={inputCode} placeholder='JavaScript-kod här' onChange={(e) => { setInputCode(e.target.value); setHasCode(e.target.value.trim().length > 0); }}></textarea>                 
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
                              className="standard-textarea clue-textarea"
                          />

                      </div>
                  ))}
              </div>
          )}
        </main>
      </div>)} */}
    
  </>);
};

export default Exercises;