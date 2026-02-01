import React, { useState } from 'react';
import './ManageProjects.css';
import '../../styles/spinner.css';
import Toast from '../../utils/toastMessage';
import type ProjectType from '../../Types/ProjectType';
import type { AddProjectDto, UpdateProjectDto } from '../../Types/Dto/ProjectDto';
import { useProjects, useAddProject, useDeleteProject, useUpdateProject } from '../../hooks/useProjects';


const ManageProjects: React.FC = () => {

    const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const { data: projects = [] as ProjectType[], isLoading, isError, error, refetch, isRefetching } = useProjects();
    const addProjectMutation = useAddProject();
    const updateProjectMutation = useUpdateProject();
    const deleteProjectMutation = useDeleteProject();



    const addProject = async () => {
        if (!hasAllFieldsText()) {
            return;
        }
        const { id, lightbulbs, ...input } = selectedProject!; 
        addProjectMutation.mutate(input as AddProjectDto, {
            onSuccess: () => {
                setShowEditor(false);
                setToastMessage("Project saved successfully!");
                setTimeout(() => setToastMessage(null), 3000);
            }
        });
    };

    const updateProject = async () => {
        if (!hasAllFieldsText || selectedProject === null) {
            return;
        }

        const { lightbulbs, ...input } = selectedProject!; 
        updateProjectMutation.mutate(input as UpdateProjectDto, {
            onSuccess: () => {
                setToastMessage("Project updated successfully!");
                setTimeout(() => setToastMessage(null), 3000);
            }
        });

    };

    const deleteProject = async () => {
        if (selectedProject === null) return
        deleteProjectMutation.mutate({ id: selectedProject.id, title: selectedProject.title }, {
            onSuccess: () => {
                setToastMessage("Project deleted successfully!");
                setTimeout(() => setToastMessage(null), 3000);
                resetFrames();
            }
        });
      
    };  

    const hasAllFieldsText = () => {
        
        if (!selectedProject?.title || !selectedProject.description || !selectedProject.html || !selectedProject.css || !selectedProject.javascript) {
            console.error('One or more input fields are empty');
            window.alert('Fyll i alla fält innan du /uppdaterar projektet.');
            return false;
        }
        return true;
    }

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index = e.target.value ? parseInt(e.target.value) : null;
        setSelectedProject(index !== null ? projects.find(p => p.id === index) || null : null);
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
            setSelectedProject(null);
        }
    }


    const loadProjectIntoEditor = (index: number) => {
        if (index === null) return;
        const project = projects.find(p => p.id === index);
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
        setSelectedProject({
                id: 0,  // Or generate a temp ID
                title: '',
                description: '',
                html: '',
                css: '',
                javascript: '',
                difficulty: 1, 
                projectType: 'html',
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



    if (isLoading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Laddar projekt...</p>
        </div>
    );

    if (isError) return (
        <div className="error-container">
            <p>{error?.message}</p>
      <button className="retry-button" onClick={() => {refetch()}} disabled={isRefetching}>{isRefetching ? 'Laddar...' : 'Försök igen'}</button>
        </div>
    );

    return (
    <div className="manage-projects-container">
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        <div className="create-projects-container">
            <div className="create-projects-header">
                <header className="projects-header projects-header-controls">
                    <h1>Skapa Projekt</h1>
                    <label htmlFor="projectSelector" className="visually-hidden">Välj projekt:</label>
                    <select className="project-selector" id="projectSelector" value={selectedProject ? selectedProject.id : ''} onChange={handleProjectChange}>
                        <option value="">Välj projekt</option>
                        {projects.map((ex) => (
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

                <div className='difficulty-container'>
                    <input type='radio' name='project-type' value='html' checked={selectedProject?.projectType === 'html'} onChange={() => {
                        setSelectedProject({...selectedProject!, projectType: 'html'}); 
                    }}
                    /> HTML
                    <input type='radio' name='project-type' value='css' checked={selectedProject?.projectType === 'css'} onChange={() => { 
                        setSelectedProject({...selectedProject!, projectType: 'css'}); 
                    }}
                    /> CSS
                    <input type='radio' name='project-type' value='javascript' checked={selectedProject?.projectType === 'javascript'} onChange={() => { 
                        setSelectedProject({...selectedProject!, projectType: 'javascript'}); 
                    }}  
                    /> JS
                    <div className='lightbulbs'>
                        {selectedProject?.lightbulbs.map((lightbulb, i) => (
                            <span key={i} className={`difficulty ${lightbulb ? "high" : "low"}`} onClick={changeDifficulty(i)}>💡</span>
                        ))}
                    </div>

                </div>
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