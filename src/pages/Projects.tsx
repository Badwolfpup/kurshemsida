import React, { useState, useRef, useEffect } from 'react';
import './Projects.css';


interface Project {
    id: number;
    title: string;
    description: string;
    html: string;
    css: string;
    javascript: string;
    tags: string[];
    difficulty: number;
    lightbulbs: boolean[];
}

const Projects: React.FC = () => {
  const [showingSolution, setShowingSolution] = useState(false);
  const [codeLayout, setCodeLayout] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [showAllprojects, setShowAllprojects] = useState<boolean>(true);
  const [showHTML, setShowHTML] = useState<boolean>(true);
  const [showCSS, setShowCSS] = useState<boolean>(false);
  const [showJS, setShowJS] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [course, setCourse] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<boolean[]>([true, false, false, false, false]);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [remainingTags, setRemainingTags] = useState<string[]>([]);
  const [pickedTag, setPickedTag] = useState<string>('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  


    const fetchProjects = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No auth token found');
            return;
        }
        try {
            const response = await fetch(`/api/fetch-projects`    , {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json() as Project[];
            data.forEach(proj => {
                proj.lightbulbs = Array(5).fill(false).map((_, i) => i < proj.difficulty);
            });
            setRemainingTags([...new Set(data.flatMap(proj => proj.tags.filter(tag => ['html', 'css', 'javascript'].includes(tag) === false)))]);
            setAllProjects(data);
            setFilteredProjects(data);
        }
        catch (err) {
            console.error(err instanceof Error ? err.message : 'An error occurred');
            setAllProjects([]);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

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
          <body>
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

  const handleAddingTag = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tag = e.target.value;
    if (tag) {
      setSelectedTags(prev => [...prev, tag]);
      setRemainingTags(prev => prev.filter(t => t !== tag));
      setPickedTag('');
      filterProject(course, [ ...selectedTags, tag ]);
    }
  };

  const filterProject = (selectedCourse: string = course, taglist: string[] = selectedTags, difficulty: number = difficultyLevel) => {
      const filtered = allProjects.filter(proj => { 
          const tags = taglist.length > 0 ? [...taglist] : [];  
          if (selectedCourse && !proj.tags.includes(selectedCourse)) return false;
          return (tags.length === 0 && proj.difficulty <= difficulty) || (tags.some(tag => proj.tags.includes(tag)) && proj.difficulty <= difficulty);
      })
      setFilteredProjects(filtered);
  }

  const renderContent = () => {
    if (selectedProject === null) {
      return <p>Välj en övning i rullgardinsmenyn ovan för att börja.</p>;
    }

    const ex = allProjects[selectedProjectId!];

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
                title="Visa kod i kolumner"
                onClick={() => setCodeLayout(prev => !prev)}
              >Kolumner</button>
              <button
                id="layoutRows"
                className={`${codeLayout ? 'active' : ''}`}
                title="Visa kod i rader"
                onClick={() => setCodeLayout(prev => !prev)}
              >Rader</button>
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
              {/* <pre >{escapeHTML(selectedProject.css)}</pre> */}
            </div>
            )}
            {showJS && (
              <div id="jsCodeBlock" className="code-block">
                <strong>JavaScript</strong>
              <pre>{selectedProject.javascript}</pre>
              {/* <pre >{escapeHTML(selectedProject.javascript)}</pre> */}
            </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <>
    {showAllprojects &&  
      (<div className="all-projects-container" >
          <header className="projects-header">  {/* Renamed to match CSS */}
              <div className="projects-header-controls">  {/* Renamed to match CSS */}
                  <div  className="tag-section"> 
                      {selectedTags.map((tag, i) => (
                          <span key={i} className="project-tag chosen-tags"
                              onContextMenu={(e) => {
                                  if (selectedTags.length > 0) {
                                    setSelectedTags(prev => prev.filter(t => t !== tag));
                                    setRemainingTags(prev => [...prev, tag]);
                                    filterProject(course, selectedTags.filter(t => t !== tag));
                                  }
                                  e.preventDefault();
                              }}>{tag}</span>
                      ))}
                  </div>
                  <select id="tagSelector" value={pickedTag ?? ''} onChange={handleAddingTag}>
                      <option value="">Välj tagg</option>
                      {remainingTags.map((tag, i) => (
                          <option key={i} value={tag}>{tag}</option>
                      ))}
                  </select>
                  <label>  {/* Wrap checkbox in label for better UX */}
                      <input name='course-selector' type='radio' value='html' readOnly checked={course === 'html'} onClick={() => {  filterProject('html'); setCourse('html');}} /> HTML
                  </label>
                  <label>
                      <input name='course-selector' type='radio' value='css' readOnly checked={course === 'css'} onClick={() => {  filterProject('css'); setCourse('css');}} /> CSS
                  </label>
                  <label>
                      <input name='course-selector' type='radio' value='javascript' readOnly checked={course === 'javascript'} onClick={() => {  filterProject('javascript'); setCourse('javascript');}} /> JavaScript
                  </label>
                  <div className='no-margin-lightbulbs'>
                      {difficultyFilter.map((lightbulb, i) => (
                          <span key={i} className={`difficulty ${lightbulb ? "high" : "low"}`} onClick={() => {
                              const newfilter = Array(5).fill(false).map((_, idx) => idx <= i);
                              setDifficultyFilter(newfilter);
                              setDifficultyLevel(i + 1);
                              filterProject(course, selectedTags, i + 1);
                          }}>💡</span>
                      ))}
                  </div>
              </div>
          </header>
          <div className="projects-list">
              {filteredProjects.map((proj) =>  (
                  <div key={proj.id} className="project-card" onClick={() => { setSelectedProject(proj); setShowAllprojects(false); setSelectedProjectId(allProjects.findIndex(p => p.id === proj.id)); }}>
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

      </div>
    )}
      
    {!showAllprojects && (<div>
          <div className="spa-header-controls">

            <button id="toggleView" type="button" className='user-button' disabled={selectedProject === null} onClick={() => setShowAllprojects(true)}>Gå tillbaka</button>
            
          </div>
        <main id="exerciseArea" className="spa-main">
          {renderContent()}
        </main>
    </div>)}
    </>
  );
};

export default Projects;