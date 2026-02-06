import React, { useState, useRef, useEffect } from 'react';
import type ProjectType from '../Types/ProjectType';
import { useProjects } from '../hooks/useProjects';
import './Projects.css';
import '../styles/spinner.css';


const Projects: React.FC = () => {
  const [showingSolution, setShowingSolution] = useState(false);
  const [codeLayout, setCodeLayout] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showAllprojects, setShowAllprojects] = useState<boolean>(true);
  const [showHTML, setShowHTML] = useState<boolean>(true);
  const [showCSS, setShowCSS] = useState<boolean>(false);
  const [showJS, setShowJS] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [course, setCourse] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<boolean[]>([true, false, false, false, false]);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const { data: projects = [] as ProjectType[], isLoading, isError, error, refetch, isRefetching } = useProjects();
  

  useEffect(() => {
    if (selectedProject !== null && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
          <head>
          <style>${selectedProject.css}</style>
          </head>
          <body style="background-color: #faf3e8;">
          ${selectedProject.html}
          <script>${selectedProject.javascript}<\/script>
          </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [selectedProject, showingSolution === false]);


  const toggleView = () => {
    if (selectedProject === null) return;
    setShowingSolution(!showingSolution);
  };



  const renderContent = () => {
    if (selectedProject === null) {
      return <p>Välj en övning i rullgardinsmenyn ovan för att börja.</p>;
    }

    const ex = projects[selectedProjectId!];

    if (!showingSolution) {
      return (
        <div>
          <div className='flex-horizontal'>
              <h2>{ex.title}</h2>
              <button id="toggleView" className='standard-btn' type="button" disabled={selectedProject === null} onClick={toggleView}>{showingSolution ? 'Visa Uppgift' : 'Visa Kodlösning'}</button>
          </div>
          <p>{ex.description}</p>
          <iframe ref={iframeRef} className="previewer-frame" title="Live Preview"></iframe>
        </div>
      );
    } else {
      return (
        <div className={`solution-expanded ${codeLayout ? 'code-layout-columns' : 'code-layout-rows'}`}>
          <div className='solution-container' >
            <div className='title-button'>
              <h2 style={{ marginBottom: 0 }}>{ex.title}</h2>
              <button id="toggleView" className='standard-btn' type="button" disabled={selectedProject === null} onClick={toggleView}>{showingSolution ? 'Visa Uppgift' : 'Visa Kodlösning'}</button>
            </div>
            <p>{ex.description}</p>
            <div className="flex-horizontal">
              <span>Visa:</span>
              <button
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
              >Kolumner</button>
              <button
                id="layoutNoHTML"
              className={`standard-btn${showHTML ? ' selected-btn' : ''}`}
                title="Dölj/visa HTML-kod"
                onClick={() => {setShowHTML(prev => !prev);}}
              >HTML</button>
              <button
                id="layoutNoCSS"
                className={`standard-btn${showCSS ? ' selected-btn' : ''}`}
                title="Dölj/visa CSS-kod"
                onClick={() => {setShowCSS(prev => !prev);}}
              >CSS</button>
              <button
                id="layoutNoJS"
                className={`standard-btn${showJS ? ' selected-btn' : ''}`}
                title="Dölj/visa JavaScript-kod"
                onClick={() => {setShowJS(prev => !prev);}}
              >JavaScript</button>
            </div>
          </div>
          
          <div className="code-columns">
            {showHTML && (
              <div id="htmlCodeBlock" className="code-block">
                <strong>HTML</strong>
                <pre >{selectedProject.html}</pre>
              </div>
            )}
            {showCSS && (
              <div id="cssCodeBlock" className="code-block">
                <strong>CSS</strong>
              <pre>{selectedProject.css}</pre>
            </div>
            )}
            {showJS && (
              <div id="jsCodeBlock" className="code-block">
                <strong>JavaScript</strong>
              <pre>{selectedProject.javascript}</pre>
            </div>
            )}
          </div>
        </div>
      );
    }
  };

  const resetSolutionsView = () => {
    setShowingSolution(false);
    setCodeLayout(true);
    setShowAllprojects(true);
    setDifficultyLevel(difficultyLevel + 1);
    setShowHTML(true);
    setShowCSS(false);
    setShowJS(false);
  };

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
    {showAllprojects &&
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
    }
      
    {!showAllprojects && (<div className='page-main'>

            
            
        <main id="exerciseArea" className="page-content">
          <button id="toggleView" type="button" className='standard-btn right-aligned' disabled={selectedProject === null} onClick={() => resetSolutionsView()}>Gå tillbaka</button>
          {renderContent()}
        </main>
      </div>)}
    
  </>);
};

export default Projects;