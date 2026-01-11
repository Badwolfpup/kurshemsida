import React, { useState, useEffect, useMemo } from 'react';
import './ManageProjects.css'; 
import Toast from '../../utils/toastMessage';
import {processDeltaForImages} from '../../utils/imageUtils';

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
    image?: string;
}

const ManageProjects: React.FC = () => {

    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedProjectType, setSelectedProjectType] = useState<string>('');
    const [showEditor, setShowEditor] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [filterText, setFilterText] = useState<string>('');
    const [showTagOverlay, setShowTagOverlay] = useState(false);
    const [showImageContainer, setShowImageContainer] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    const computedAllTags = useMemo(() => {
        const projectTags = allProjects ? allProjects.flatMap(x => x.tags || []) : [];
        const selectedTags = selectedProject ? selectedProject.tags || [] : [];
        return [...new Set([...projectTags, ...selectedTags])];  // Combine and dedupe
    }, [allProjects, selectedProject]);



    const fetchProjects = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No auth token found');
            return;
        }
        try {
            const response = await fetch('/api/fetch-projects'    , {
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
            setAllProjects(data);
        }
        catch (err) {
            console.error(err instanceof Error ? err.message : 'An error occurred');
            setAllProjects([]);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const addProject = async () => {
        if (!hasAllFieldsText()) {
            return;
        }
        const { id, ...input } = selectedProject!;  // Exclude id when adding new
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No auth token found');
            return;
        }
        try {
            const response = await fetch('/api/add-project', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(input)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            await fetchProjects();
            setToastMessage("Project saved successfully!");
            setTimeout(() => setToastMessage(null), 3000);
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const updateProject = async () => {
        if (!hasAllFieldsText || selectedProject === null) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No auth token found');
            return;
        }
        try {
            const response = await fetch(`/api/update-project`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify(selectedProject)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            await fetchProjects();
            setToastMessage("Project updated successfully!");
            setTimeout(() => setToastMessage(null), 3000);
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const deleteProject = async () => {
        if (selectedProjectId === null || selectedProject === null) {
            return;
        }
        const prompt = window.confirm(`Är du säker på att du vill ta bort projektet ${selectedProject.title}? Detta kan inte ångras.`);
        if (!prompt) return;
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No auth token found');
            return;
        }
        try {
            const response = await fetch(`/api/delete-project/${selectedProjectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            await fetchProjects();
            setToastMessage("Project deleted successfully!");
            setTimeout(() => setToastMessage(null), 3000);
            resetFrames();
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'An error occurred');
        }
    };  

    const hasAllFieldsText = () => {
        
        if (!selectedProject?.title || !selectedProject.description || !selectedProject.html || !selectedProject.css || !selectedProject.javascript) {
            console.error('One or more input fields are empty');
            window.alert('Fyll i alla fält innan du sparar projektet.');
            return false;
        }
        return true;
    }

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index = e.target.value ? parseInt(e.target.value) : null;
        setSelectedProjectId(index);
        setSelectedProject(index !== null ? allProjects.find(p => p.id === index) || null : null);
        const iframe = document.querySelector('.preview-container') as HTMLIFrameElement;
        if (iframe != null && iframe.contentDocument != null) {
            iframe.contentDocument.body.innerHTML = '';
            iframe.contentDocument.head.innerHTML = '';
        }
        if (index !== null) {
            setShowEditor(true);
            setIsEditing(true);
            loadProjectIntoEditor(index);
        }
        else {
            setShowEditor(false);
            setIsEditing(false);
            setSelectedProjectId(null);
            setSelectedProject(null);
        }
    }


    const loadProjectIntoEditor = (index: number) => {
        if (index === null) return;
        const project = allProjects.find(p => p.id === index);
        console.log(project);
        if (!project) return;
        setSelectedProject(project);  // Set the whole object
    };


    const resetFrames = () => {
        const iframe = document.querySelector('.preview-container') as HTMLIFrameElement;
        if (iframe != null && iframe.contentDocument != null) {
            iframe.contentDocument.body.innerHTML = '';
            iframe.contentDocument.head.innerHTML = '';
        }
        setSelectedProjectId(null);
        setSelectedProject(null);
        setShowEditor(true)
    }

    const previewProject = () => {
        const titleEditor = document.getElementById('titleEditor') as HTMLTextAreaElement;
        const descriptionEditor = document.getElementById('descriptionEditor') as HTMLTextAreaElement;
        const htmlEditor = document.getElementById('htmlEditor') as HTMLTextAreaElement;
        const cssEditor = document.getElementById('cssEditor') as HTMLTextAreaElement;
        const jsEditor = document.getElementById('jsEditor') as HTMLTextAreaElement;

        let combinedHtml = '';
        const title = titleEditor.value ?? "";
        if (title) {
            combinedHtml += `<h2>${title}</h2>\n`;
        }
        
        const description = descriptionEditor.value ?? "";
        if (description) {
            combinedHtml += `<p>${description}</p>\n`;
        }
        combinedHtml += htmlEditor.value ?? "";
        const css = cssEditor.value ?? "";
        const js = jsEditor.value ?? "";

        const iframe = document.querySelector('.preview-container') as HTMLIFrameElement;
        if (iframe != null && iframe.contentDocument != null) {
            iframe.contentDocument.body.innerHTML = combinedHtml;
            iframe.contentDocument.head.innerHTML += '<style>' + css + '</style>';
            const script = iframe.contentDocument.createElement('script');
            script.textContent = js;
            iframe.contentDocument.body.appendChild(script);
            console.log(iframe.contentDocument.body.innerHTML);
        }
    }


    const toggleCodeEditor = () => {
        resetFrames();
        setIsEditing(false);
        setShowEditor(true);
        setSelectedProjectId(null);
        setSelectedProjectType('html');
        setSelectedProject({
                id: 0,  // Or generate a temp ID
                title: '',
                description: '',
                html: '',
                css: '',
                javascript: '',
                tags: ['html'],
                difficulty: 1, 
                lightbulbs: [true, false, false, false, false],
        })
    }

    const changeDifficulty = (index: number) => () => {
        if (selectedProject) {
            const newLightbulbs = Array(5).fill(false).map((_, i) => i <= index); 
            setSelectedProject({
                ...selectedProject,
                lightbulbs: newLightbulbs,
                difficulty: index + 1
            });
        }
    }

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
    if (file) {
        // Convert file to base64
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            
            // Create a delta-like structure for the function
            const delta = {
                ops: [{ insert: { image: base64 } }]
            };
            
            // Process (upload) the image
            const processedOps = await processDeltaForImages(delta);
            const imageUrl = processedOps[0]?.insert?.image;  // Get uploaded URL
            
            if (imageUrl) {
                // Add to project
                setSelectedProject({ ...selectedProject!, image: imageUrl });
                setShowImageContainer(true);
            }
        };
        reader.readAsDataURL(file);  // Reads as base64
        setShowImageContainer(true);

    }
    }

    return (
    <div className="manage-projects-container">
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        <div className="create-projects-container">
            <div className="create-projects-header">
                <header className="projects-header projects-header-controls">
                    <h1>Skapa Projekt</h1>
                    <label htmlFor="projectSelector" className="visually-hidden">Välj projekt:</label>
                    <select className="project-selector" id="projectSelector" value={selectedProjectId ?? ''} onChange={handleProjectChange}>
                        <option value="">Välj projekt</option>
                        {allProjects.map((ex) => (
                        <option key={ex.id} value={ex.id}>{ex.title}</option>
                        ))}
                    </select>
                    <button id="toggleView" type="button" onClick={toggleCodeEditor}>Skapa nytt projekt</button>
                </header>  
            </div>
            {showEditor && (
            <div className="project-editor">
                <div className="title-section">
                    <textarea id="titleEditor" rows={1} value={selectedProject?.title || ''} onChange={e => setSelectedProject({...selectedProject!, title: e.target.value})} placeholder='Projekttitel här'/>
                </div>
                <div className="description-section">
                    <textarea rows={2} id="descriptionEditor" value={selectedProject?.description || ''} onChange={e => setSelectedProject({...selectedProject!, description: e.target.value})} placeholder='Projektbeskrivning här'/>
                </div>
                <div className="html-section">
                    <textarea rows={5} id="htmlEditor" value={selectedProject?.html || ''} onChange={e => setSelectedProject({...selectedProject!, html: e.target.value})} placeholder='HTML-kod här'/>
                </div>
                <div className="css-section">
                    <textarea rows={5} id="cssEditor" value={selectedProject?.css || ''} onChange={e => setSelectedProject({...selectedProject!, css: e.target.value})} placeholder='CSS-kod här'/>
                </div>
                <div className="javascript-section">
                    <textarea rows={5} id="jsEditor" value={selectedProject?.javascript || ''} onChange={e => setSelectedProject({...selectedProject!, javascript: e.target.value})} placeholder='JavaScript-kod här'/>
                </div>
                <div className='tag-main-container'>
                    <div className="tag-section">
                        {showTagOverlay && (
                            <div className="tag-overlay" onClick={() => setShowTagOverlay(false)}>  {/* Click outside to close */}
                                <div className="tag-popup" onClick={(e) => e.stopPropagation()}>  {/* Prevent close on inner click */}
                                    <div className="tag-input-container">
                                        <input 
                                            type="text" 
                                            id="tagInput" 
                                            placeholder="Lägg till eller filtrera taggar" 
                                            autoFocus={true}
                                            onChange={(e) => setFilterText(e.target.value)} 
                                        />
                                        <button 
                                            className='user-button' 
                                            onClick={() => {
                                                const tagInput = document.getElementById('tagInput') as HTMLInputElement;
                                                const newTag = tagInput.value.toLowerCase().trim();
                                                if (newTag && selectedProject && !selectedProject.tags.includes(newTag)) {
                                                    setSelectedProject({
                                                        ...selectedProject,
                                                        tags: [...selectedProject.tags, newTag]
                                                    });
                                                    // setAllTags(prev => [...new Set([...prev, newTag])]);
                                                    const tagInputField = document.getElementById('tagInput') as HTMLInputElement;
                                                    if (tagInputField) tagInputField.value = '';
                                                    tagInputField.focus();
                                                }
                                            }}
                                        >
                                            Lägg till tagg
                                        </button>
                                    </div>
                                    {computedAllTags.length > 0 && computedAllTags
                                        .filter(tag => {
                                            if (!filterText) return true;
                                            return tag.toLowerCase().startsWith(filterText.toLowerCase());
                                        })  // Filter based on input
                                        .map((tag, i) => (
                                            <span key={i} id={`tag-${i}`} className='project-tag' onContextMenu={(e) => e.preventDefault()} onClick={() => {
                                                const newtag = document.getElementById(`tag-${i}`)?.innerText;
                                                if (newtag && selectedProject && !selectedProject.tags.includes(newtag)) {
                                                    setSelectedProject({
                                                        ...selectedProject,
                                                        tags: [...selectedProject.tags, newtag]
                                                    });
                                                    // setAllTags(prev => [...new Set([...prev, newtag])]);
                                                }
                                            }}>{tag}</span>                                             
                                        ))}
                                </div>
                            </div>
                        )}
                        {selectedProject?.tags.map((tag, i) => (
                            <span key={i} className="project-tag chosen-tags" onClick={() => setShowTagOverlay(true)} 
                            onContextMenu={(e) => {
                                e.preventDefault();  // Prevents right-click menu
                                if (selectedProject) {
                                    setSelectedProject({
                                        ...selectedProject,
                                        tags: selectedProject.tags.filter(t => t !== tag)
                                    });
                                }
                            }}>{tag}</span>
                        ))}
                    </div>
                    <button id="tagEditor" className='user-button' onClick={() => { console.log(computedAllTags);    setShowTagOverlay(true);}}>Lägg till tagg</button> 
                </div>
                <div className='difficulty-container'>
                    <input type='radio' name='project-type' value='html' checked={selectedProjectType === 'html'} onChange={() => { 
                        setSelectedProjectType('html'); 
                        setSelectedProject(prev => 
                            prev ? { 
                                ...prev, 
                                tags: (() => {
                                const filtered = prev.tags.filter(t => t !== 'css' && t !== 'javascript');
                                if (!filtered.includes('html')) filtered.push('html');
                                return filtered;
                                })()
                            } : null
                            );
                        }}
                    /> HTML
                    <input type='radio' name='project-type' value='css' checked={selectedProjectType === 'css'} onChange={() => { 
                        setSelectedProjectType('css'); 
                        setSelectedProject(prev => 
                            prev ? { 
                                ...prev, 
                                tags: (() => {
                                const filtered = prev.tags.filter(t => t !== 'html' && t !== 'javascript');
                                if (!filtered.includes('css')) filtered.push('css');
                                return filtered;
                                })()
                            } : null
                            );
                    }}
                    /> CSS
                    <input type='radio' name='project-type' value='javascript' checked={selectedProjectType === 'javascript'} onChange={() => { 
                        setSelectedProjectType('javascript'); 
                        setSelectedProject(prev => 
                            prev ? { 
                                ...prev, 
                                tags: (() => {
                                const filtered = prev.tags.filter(t => t !== 'html' && t !== 'css');
                                if (!filtered.includes('javascript')) filtered.push('javascript');
                                return filtered;
                                })()
                            } : null
                            );
                        }}
                    /> JS


                    <div className='lightbulbs'>
                        {selectedProject?.lightbulbs.map((lightbulb, i) => (
                            <span key={i} className={`difficulty ${lightbulb ? "high" : "low"}`} onClick={changeDifficulty(i)}>💡</span>
                        ))}
                    </div>
                    <button className='user-button show-image-container' style={{ marginLeft: 'auto' }} onClick={() => {  document.getElementById('image-input')?.click() }}>Lägg till bild</button>
                    <input id="image-input" type='file' accept='image/*'  style={{display: 'none' }} onChange={(e) => { handleImage(e); }}/>
                </div>
                {showImageContainer && <div  className='image-container'>
                    {!imageLoaded && <div className="loading">Loading image...</div>}
                    <img className='project-image' style={{ display: imageLoaded ? 'block' : 'none' }} onLoad={() => setImageLoaded(true)} src={selectedProject?.image} alt="Projektbild" />
                    <button className='user-button' onClick={() =>  { setShowImageContainer(false); if (selectedProject) selectedProject.image = ""; setImageLoaded(false); }}>Ta bort bild</button>
                </div> }
                <div className="save-button-container">
                    <button id="saveProjectButton" type="button" onClick={isEditing ? updateProject : addProject}>{isEditing ? "Uppdatera" : "Spara"} projekt</button>
                    <button id="previewProjectButton" type="button" onClick={previewProject}>Förhandsgranska</button>
                    <button id="cancelEditButton" type="button" className={`${isEditing ? "delete-button" : ""}`} onClick={isEditing ? () => deleteProject() : resetFrames}>{isEditing ? "Radera" : "Rensa"}</button>
                </div>
            </div>)}
        </div>
        <iframe className="preview-container">

        </iframe>

    </div>
    );
};

export default ManageProjects;