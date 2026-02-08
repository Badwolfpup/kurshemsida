import React, { useState, useRef, useEffect } from 'react';
// import type ProjectType from '../Types/ProjectType';
// import { useProjects } from '../hooks/useProjects';
import type AssertProjectType from '../Types/AssertProjectType';
import type { AssertProjectResponse } from '../Types/AssertProjectType';
import './Projects.css';
import '../styles/spinner.css';
import dummyPic from '../assets/images/dummypic.png';
import { assertService } from '../api/AssertService';


const Projects: React.FC = () => {
  const [showingSolution, setShowingSolution] = useState(false);
  // const [codeLayout, setCodeLayout] = useState<boolean>(true);
  // const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  // const [showAllprojects, setShowAllprojects] = useState<boolean>(false);
  const [showHTML, setShowHTML] = useState<boolean>(true);
  const [showCSS, setShowCSS] = useState<boolean>(false);
  const [showJS, setShowJS] = useState<boolean>(false);
  const [AIProject, setAIProject] = useState<AssertProjectResponse | null>(null);
  const [AIModel, setAIModel] = useState<string>('anthropic');
  // const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  // const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [course, setCourse] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<boolean[]>([true, false, false, false, false]);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [isLoadingProject, setIsLoadingProject] = useState<boolean>(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(90);

  // const { data: projects = [] as ProjectType[], isLoading, isError, error, refetch, isRefetching } = useProjects();

  // useEffect(() => {
  //   if (selectedProject !== null && iframeRef.current) {
  //     const doc = iframeRef.current.contentDocument;
  //     if (doc) {
  //       doc.open();
  //       doc.write(`
  //         <html>
  //         <head>
  //         <style>${selectedProject.css}</style>
  //         </head>
  //         <body style="background-color: #faf3e8;">
  //         ${selectedProject.html}
  //         <script>${selectedProject.javascript}<\/script>
  //         </body>
  //         </html>
  //       `);
  //       doc.close();
  //     }
  //   }
  // }, [selectedProject, showingSolution === false]);

  // New useEffect for AI Project preview
  useEffect(() => {
    if (AIProject && previewIframeRef.current) {
      const doc = previewIframeRef.current.contentDocument;
      if (doc) {
        // Replace {dummyPic} placeholder with actual image path
        const htmlWithImages = (AIProject.solutionHtml || '').replace(/{dummyPic}/g, dummyPic);

        doc.open();
        doc.write(`
          <html>
          <head>
          <style>${AIProject.solutionCss || ''}</style>
          </head>
          <body style="background-color: #faf3e8;">
          ${htmlWithImages}
          <script>${AIProject.solutionJs || ''}<\/script>
          </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [AIProject]);

  // Countdown timer for loading state
  useEffect(() => {
    let intervalId: number;

    if (isLoadingProject) {
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
  }, [isLoadingProject]);

  const renderContent = () => {
    if (!AIProject) {
      return <p>Välj en övning i rullgardinsmenyn ovan för att börja.</p>;
    }


    if (!showingSolution) {
      return (
        <div className="flex-column">
          <div className='flex-horizontal'>
              <button id="toggleView" className='standard-btn' type="button"  onClick={() => setShowingSolution(prev => !prev)}>{showingSolution ? 'Visa Uppgift' : 'Visa Kodlösning'}</button>
          </div>
          <div className="flex-column">
            <p><strong>Title:</strong> {AIProject.title}</p>
            <p className='no-margin-bottom'><strong>Description:</strong></p>
            <p className='text-wrap no-margin-onY'>{AIProject.description}</p>
        
            <p><strong>Difficulty:</strong> {AIProject.difficulty}/5</p>
            <p><strong>Tech Stack:</strong> {AIProject.techStack}</p>

            <p className='no-margin-bottom'><strong>Learning Goals:</strong></p>
            <ul className='no-margin-onY'>
              {AIProject.learningGoals && AIProject.learningGoals.split('\n').map((goal, index) => {
                const firstLetterIndex = goal.search(/[a-zA-Z]/);
                return <li key={index}>{firstLetterIndex !== -1 ? goal.slice(firstLetterIndex) : goal}</li>;
              })}
            </ul>

            <p className='no-margin-bottom'><strong>User Stories:</strong></p>
            <ul className='no-margin-onY'>
              {AIProject.userStories && AIProject.userStories.split('\n').map((goal, index) => {
                const firstLetterIndex = goal.search(/[a-zA-Z]/);
                return <li key={index}>{firstLetterIndex !== -1 ? goal.slice(firstLetterIndex) : goal}</li>;
              })}
            </ul>

            <p className='no-margin-bottom'><strong>Design Specs:</strong></p>
            <ul className='no-margin-onY'>
              {AIProject.designSpecs && AIProject.designSpecs.split('\n').map((goal, index) => {
                const firstLetterIndex = goal.search(/[a-zA-Z]/);
                return <li key={index}>{firstLetterIndex !== -1 ? goal.slice(firstLetterIndex) : goal}</li>;
              })}
            </ul>

            <p className='no-margin-bottom'><strong>Assets Needed:</strong></p>
            <ul className='no-margin-onY'>
              {AIProject.assetsNeeded && AIProject.assetsNeeded.split('\n').map((goal, index) => {
                const firstLetterIndex = goal.search(/[a-zA-Z]/);
                return <li key={index}>{firstLetterIndex !== -1 ? goal.slice(firstLetterIndex) : goal}</li>;
              })}
            </ul>

            <p><strong>Starter HTML:</strong></p>
            <pre><code>{AIProject.starterHtml}</code></pre>

            <p><strong>Bonus Challenges:</strong></p>
            <ul>
              {AIProject.bonusChallenges && AIProject.bonusChallenges.split('\n').map((goal, index) => {
                const firstLetterIndex = goal.search(/[a-zA-Z]/);
                return <li key={index}>{firstLetterIndex !== -1 ? goal.slice(firstLetterIndex) : goal}</li>;
              })}
            </ul>
          </div>
        </div>
      );
    } else {
      return (
        <div className={`solution-expanded code-layout-columns`}>
          <div className='solution-container' >
            <div className='title-button'>
              <h2 style={{ marginBottom: 0 }}>{AIProject.title}</h2>
              <button id="toggleView" className='standard-btn' type="button" onClick={() => setShowingSolution(prev => !prev)}>{showingSolution ? 'Visa Uppgift' : 'Visa Kodlösning'}</button>
            </div>
            <p>{AIProject.description}</p>
            <div className="flex-horizontal">
              <span>Visa:</span>
              {/* <button
                id="layoutColumns"
                className={`standard-btn${codeLayout ? ' selected-btn' : ''}`}
                title="Visa kod på rad"
                onClick={() => setCodeLayout(prev => !prev)}
              >Rader</button>
              <button
                id="layoutRows"
                className={`standard-btn${!codeLayout ? ' selected-btn' : ''}`}
                title="Visa kod i en kolumn"
                onClick={() => setCodeLayout(prev => !prev)}
              >Kolumner</button> */}
              {AIProject.solutionHtml && <button
                id="layoutNoHTML"
              className={`standard-btn${showHTML ? ' selected-btn' : ''}`}
                title="Dölj/visa HTML-kod"
                onClick={() => {setShowHTML(prev => !prev);}}
              >HTML</button>}
              {AIProject.solutionCss && <button
                id="layoutNoCSS"
                className={`standard-btn${showCSS ? ' selected-btn' : ''}`}
                title="Dölj/visa CSS-kod"
                onClick={() => {setShowCSS(prev => !prev);}}
              >CSS</button>}
              {AIProject.solutionJs && <button
                id="layoutNoJS"
                className={`standard-btn${showJS ? ' selected-btn' : ''}`}
                title="Dölj/visa JavaScript-kod"
                onClick={() => {setShowJS(prev => !prev);}}
              >JavaScript</button>}
            </div>
          </div>
          
          <div className="flex-column">
            {showHTML && (
              <div id="htmlCodeBlock" className="code-block">
                <strong>HTML</strong>
                <pre >{AIProject.solutionHtml}</pre>
              </div>
            )}
            {showCSS && (
              <div id="cssCodeBlock" className="code-block">
                <strong>CSS</strong>
              <pre>{AIProject.solutionCss}</pre>
            </div>
            )}
            {showJS && (
              <div id="jsCodeBlock" className="code-block">
                <strong>JavaScript</strong>
              <pre>{AIProject.solutionJs}</pre>
            </div>
            )}
          </div>
        </div>
      );
    }
  };

  // const resetSolutionsView = () => {
  //   setShowingSolution(false);
  //   setCodeLayout(true);
  //   setShowAllprojects(true);
  //   setDifficultyLevel(difficultyLevel + 1);
  //   setShowHTML(true);
  //   setShowCSS(false);
  //   setShowJS(false);
  // };

      const getAssert = async ()=> {
          if (!course) {
              alert('Vänligen välj en projekttyp innan du skapar en projekt.');
              return;
          }

          // Disable button while loading
          setIsButtonDisabled(true);

          // Start loading
          setIsLoadingProject(true);
          setProjectError(null);

          try {
              const newexercise = {techStack: course, difficulty: difficultyLevel} as AssertProjectType;
              const result: AssertProjectResponse | null = await assertService.fetchProjectAssert(newexercise, AIModel);
              setAIProject(result);
          } catch (error: any) {
              console.error('Error fetching project:', error);
              setProjectError(error?.message || 'Ett fel uppstod när projektet skulle hämtas');
          } finally {
              setIsLoadingProject(false);
              setIsButtonDisabled(false);
          }
      }

  // if (isLoading) return (
  //   <div className="loading-container">
  //     <div className="spinner"></div>
  //     <p>Laddar användare...</p>
  //   </div>
  // );

  // if (isError) return (
  //   <div className="error-container">
  //     <p>{error.message}</p>
  //     <button className="retry-button" onClick={() => {refetch()}} disabled={isRefetching}>{isRefetching ? 'Laddar...' : 'Försök igen'}</button>
  //   </div>
  // );

  return (<>
    {/* {showAllprojects &&
      (<div className="page-main" >
          <div className="page-header-row-direction">  
              <h2>Välj projekt</h2>
                  <label>  
                      <input name='course-selector' type='radio' value='html' readOnly checked={course === 'html'} onChange={() => {   setCourse('html');}} /> HTML
                  </label>
                  <label>
                      <input name='course-selector' type='radio' value='css' readOnly checked={course === 'css'} onChange={() => {   setCourse('css');}} /> CSS
                  </label>
                  <label>
                      <input name='course-selector' type='radio' value='javascript' readOnly checked={course === 'javascript'} onChange={() => {   setCourse('javascript');}} /> JavaScript
                  </label>
                  <div className='flex-horizontal-center'>
                      {difficultyFilter.map((lightbulb, i) => (
                          <span key={i} className={`difficulty ${lightbulb ? "high" : "low"}`} onClick={() => {
                              const newfilter = Array(5).fill(false).map((_, idx) => idx <= i);
                              setDifficultyFilter(newfilter);
                              setDifficultyLevel(i + 1);
                          }}>💡</span>
                      ))}
                  </div>
          </div>
          <div className="page-content">
              {projects.filter(x => course ? x.projectType === course && x.difficulty >= difficultyLevel : x.difficulty >= difficultyLevel).map((proj) =>  (
                  <div key={proj.id} className="exercise-card" onClick={() => { setSelectedProject(proj); setShowAllprojects(false); setSelectedProjectId(projects.findIndex(p => p.id === proj.id)); }}>
                      <h2>{proj.title}</h2>
                      <p>{proj.description}</p>
                      <div>
                          {Array.from({ length: proj.lightbulbs.reduce((a, b) => b ? a + 1 : a, 0) }).map((_, i) => (
                              <span key={i} className={'difficulty high'}>💡</span>
                          ))}
                      </div> 
                  </div>
              ))}
          </div>

      </div>)
    } */}
      
    {/* {!showAllprojects && (<div className='page-main'>

        <div className="page-header-row-direction">  
              <h2>Välj projekt</h2>
                  <label>  
                      <input name='course-selector' type='radio' value='html' readOnly checked={course === 'html'} onChange={() => {   setCourse('html');}} /> HTML
                  </label>
                  <label>
                      <input name='course-selector' type='radio' value='css' readOnly checked={course === 'css'} onChange={() => {   setCourse('css');}} /> CSS
                  </label>
                  <label>
                      <input name='course-selector' type='radio' value='javascript' readOnly checked={course === 'javascript'} onChange={() => {   setCourse('javascript');}} /> JavaScript
                  </label>
                  <div className='flex-horizontal-center'>
                      {difficultyFilter.map((lightbulb, i) => (
                          <span key={i} className={`difficulty ${lightbulb ? "high" : "low"}`} onClick={() => {
                              const newfilter = Array(5).fill(false).map((_, idx) => idx <= i);
                              setDifficultyFilter(newfilter);
                              setDifficultyLevel(i + 1);
                          }}>💡</span>
                      ))}
                  </div>
          </div>    
            
        <main id="exerciseArea" className="page-content">
          <button id="toggleView" type="button" className='standard-btn right-aligned' disabled={selectedProject === null} onClick={() => resetSolutionsView()}>Gå tillbaka</button>
          {renderContent()}
        </main>
      </div>)}
    
  </>); */}
  <div className="page-main" >
          <div className="page-header-row-direction">
            <select className='standard-select' value={AIModel} onChange={(e) => setAIModel(e.target.value)}>
                <option value="anthropic">Anthropic</option>
                <option value="deepseek">Deepseek</option>
            </select>
              <button className={isButtonDisabled ? 'greyed-btn' : 'standard-btn'} onClick={getAssert} disabled={isButtonDisabled}>Generera</button>
              <h2>AI-genererade projekt</h2>
                  <select className='standard-select' value={course} onChange={(e) => setCourse(e.target.value)}>
                      <option value="">Välj typ av projekt</option>
                      <option value="html">HTML</option>
                      <option value="html+css">HTML + CSS</option>
                      <option value="html+css+js">HTML + CSS + JS</option>
                  </select>
                  {/* <label>  
                      <input name='course-selector' type='radio' value='html' readOnly checked={course === 'html'} onChange={() => {   setCourse('html');}} /> HTML
                  </label>
                  <label>
                      <input name='course-selector' type='radio' value='css' readOnly checked={course === 'css'} onChange={() => {   setCourse('css');}} /> CSS
                  </label>
                  <label>
                      <input name='course-selector' type='radio' value='javascript' readOnly checked={course === 'javascript'} onChange={() => {   setCourse('javascript');}} /> JavaScript
                  </label> */}
                  <div className='flex-horizontal-center'>
                      {difficultyFilter.map((lightbulb, i) => (
                          <span key={i} className={`difficulty ${lightbulb ? "high" : "low"}`} onClick={() => {
                              const newfilter = Array(5).fill(false).map((_, idx) => idx <= i);
                              setDifficultyFilter(newfilter);
                              setDifficultyLevel(i + 1);
                          }}>💡</span>
                      ))}
                  </div>
          </div>

          {isLoadingProject && (
            <div className="page-content">
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Genererar projekt... ({countdown}s kvar)</p>
              </div>
            </div>
          )}

          {projectError && !isLoadingProject && (
            <div className="page-content">
              <div className="error-container">
                <p>{projectError}</p>
                <button className="retry-button" onClick={() => getAssert()}>Försök igen</button>
              </div>
            </div>
          )}

          {!isLoadingProject && !projectError && (
            <div className='page-content  split-layout'>
              <div className='content-left'>
                {renderContent()}
              </div>
              <div className='content-right'>
                <iframe ref={previewIframeRef} className="previewer-frame" title="Live Preview"></iframe>
              </div>
            </div>
          )}
      </div>
          </> 
)};

export default Projects;