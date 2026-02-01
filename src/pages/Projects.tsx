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


  const hideCodeblocks = (codeblock: string) => {
    const block = document.getElementById(`${codeblock}CodeBlock`);
    block?.classList.toggle('hide-codeblock');
    const btn = document.getElementById(`layoutNo${codeblock.toUpperCase()}`);
    btn?.classList.toggle('active');
  };


  const renderContent = () => {
    if (selectedProject === null) {
      return <p>Välj en övning i rullgardinsmenyn ovan för att börja.</p>;
    }

    const ex = projects[selectedProjectId!];

    if (!showingSolution) {
      return (
        <div>
          <div className='title-button'>
              <h2>{ex.title}</h2>
              <button id="toggleView" type="button" disabled={selectedProject === null} onClick={toggleView}>{showingSolution ? 'Visa Färdig UI' : 'Visa Kodlösning'}</button>
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
              <button id="toggleView" type="button" disabled={selectedProject === null} onClick={toggleView}>{showingSolution ? 'Visa Färdig UI' : 'Visa Kodlösning'}</button>
            </div>
            <p>{ex.description}</p>
            <div className="code-toggle">
              <span>Visa:</span>
              <button
                id="layoutColumns"
                className={`${!codeLayout ? 'active' : ''}`}
                title="Visa kod i rader"
                onClick={() => setCodeLayout(prev => !prev)}
              >Rader</button>
              <button
                id="layoutRows"
                className={`${codeLayout ? 'active' : ''}`}
                title="Visa kod i kolumner"
                onClick={() => setCodeLayout(prev => !prev)}
              >Kolumner</button>
              <button
                id="layoutNoHTML"
                className='user-button hide-code-btns active'
                title="Dölj/visa HTML-kod"
                onClick={() => {setShowHTML(prev => !prev); hideCodeblocks('html')}}
              >HTML</button>
              <button
                id="layoutNoCSS"
                className='user-buttonactive'
                title="Dölj/visa CSS-kod"
                onClick={() => {setShowCSS(prev => !prev); hideCodeblocks('css')}}
              >CSS</button>
              <button
                id="layoutNoJS"
                className='user-buttonactive'
                title="Dölj/visa JavaScript-kod"
                onClick={() => {setShowJS(prev => !prev); hideCodeblocks('js')}}
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
      (<div className="all-projects-container" >
          <header className="projects-header">  
              <div className="projects-header-controls"> 
                  <label>  
                      <input name='course-selector' type='radio' value='html' readOnly checked={course === 'html'} onChange={() => {   setCourse('html');}} /> HTML
                  </label>
                  <label>
                      <input name='course-selector' type='radio' value='css' readOnly checked={course === 'css'} onChange={() => {   setCourse('css');}} /> CSS
                  </label>
                  <label>
                      <input name='course-selector' type='radio' value='javascript' readOnly checked={course === 'javascript'} onChange={() => {   setCourse('javascript');}} /> JavaScript
                  </label>
                  <div className='no-margin-lightbulbs'>
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
          <div className="projects-list">
              {projects.filter(x => course ? x.projectType === course && x.difficulty >= difficultyLevel : x.difficulty >= difficultyLevel).map((proj) =>  (
                  <div key={proj.id} className="project-card" onClick={() => { setSelectedProject(proj); setShowAllprojects(false); setSelectedProjectId(projects.findIndex(p => p.id === proj.id)); }}>
                      <h2>{proj.title}</h2>
                      <p>{proj.description}</p>
                      <div className="lightbulb-container">
                          {Array.from({ length: proj.lightbulbs.reduce((a, b) => b ? a + 1 : a, 0) }).map((_, i) => (
                              <span key={i} className={'difficulty high'}>💡</span>
                          ))}
                      </div> 
                  </div>
              ))}
          </div>

      </div>)
    }
      
    {!showAllprojects && (<div>
          <div className="spa-header-controls">

            <button id="toggleView" type="button" className='user-button' disabled={selectedProject === null} onClick={() => setShowAllprojects(true)}>Gå tillbaka</button>
            
          </div>
        <main id="exerciseArea" className="spa-main">
          {renderContent()}
        </main>
      </div>)}
    
  </>);
};

export default Projects;