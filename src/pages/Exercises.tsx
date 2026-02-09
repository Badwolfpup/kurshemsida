import React, { useState, useEffect } from 'react';
import type { AssertExerciseResponse } from '../Types/AssertExerciseType.ts';
import type AssertExerciseType from '../Types/AssertExerciseType.ts';
import { assertService } from '../api/AssertService';
import { expect } from 'vitest';


interface TestResult {
    comment: string;
    passed: boolean;
    error?: string;
}


const Exercises: React.FC = () => {

  const [course, setCourse] = useState<string>('');
  const [AIExercise, setAIExercise] = useState<AssertExerciseResponse | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [inputCode, setInputCode] = useState<string>('');
  const [hasCode, setHasCode] = useState<boolean>(false);
  const [difficultyFilter, setDifficultyFilter] = useState<boolean[]>([true, false, false, false, false]);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const [AIModel, setAIModel] = useState<string>('anthropic');
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



  return (<>
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
    
  </>);
};

export default Exercises;