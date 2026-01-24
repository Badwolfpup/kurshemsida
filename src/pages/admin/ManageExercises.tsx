import React, { useState, useMemo, useEffect, useRef } from "react";
import Toast from "../../utils/toastMessage";
import './ManageExercises.css';
import '../../styles/spinner.css';
import type { AddExerciseDto, UpdateExerciseDto } from "../../Types/Dto/ExerciseDto";
import { useExercises, useAddExercise, useUpdateExercise, useDeleteExercise } from "../../hooks/useExercises";

interface Exercise {
    id: number;
    title: string;
    description: string;
    javascript: string;
    expectedResult: string;
    tags: string[] | null;
    difficulty: number;
    lightbulbs: boolean[];
    clues: string[];
}


const ManageExercises: React.FC = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [filterText, setFilterText] = useState<string>('');
    const [showTagOverlay, setShowTagOverlay] = useState(false);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [expectedResult, setExpectedResult] = useState<string>('');
    const [javascript, setJavascript] = useState<string>('');
    const [iframeKey, setIframeKey] = useState(0);

    const [currentClue, setCurrentClue] = useState<string>('');
    const { data: exercises = [] as Exercise[], isLoading, isError, error, refetch, isRefetching } = useExercises();
    const addExerciseMutation = useAddExercise();
    const updateExerciseMutation = useUpdateExercise();
    const deleteExerciseMutation = useDeleteExercise();


    const computedAllTags = useMemo(() => {
        const exerciseTags = exercises ? exercises.flatMap(x => x.tags || []) : [];
        const selectedTags = selectedExercise ? selectedExercise.tags || [] : [];
        return [...new Set([...exerciseTags, ...selectedTags])];  // Combine and dedupe
    }, [exercises, selectedExercise]);

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
            script.textContent = selectedExercise. javascript;
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





    const addExercise = async () => {
        if (!hasAllFieldsText()) {
            return;
        }
        const { id, lightbulbs, ...input } = selectedExercise!; 
        addExerciseMutation.mutate(input as AddExerciseDto, {
            onSuccess: () => {
                setShowEditor(false);
                setToastMessage("Exercise saved successfully!");
                setTimeout(() => setToastMessage(null), 3000);
            }
        });       
        
    };

    const updateExercise = async () => {
        if (!hasAllFieldsText || selectedExercise === null) {
            return;
        }
        const { lightbulbs, ...input } = selectedExercise!; 
        updateExerciseMutation.mutate(input as UpdateExerciseDto, {
            onSuccess: () => {
                setToastMessage("Exercise updated successfully!");
                setTimeout(() => setToastMessage(null), 3000);
            }
        });
        
    };

    const deleteExercise = async () => {
        if (selectedExerciseId === null || selectedExercise === null) {
            return;
        }
        deleteExerciseMutation.mutate({ id: selectedExerciseId, title: selectedExercise.title }, {
            onSuccess: () => {
                setToastMessage("Exercise deleted successfully!");
                setTimeout(() => setToastMessage(null), 3000);
                resetFrames();
            }
        });
        
    };  

    const hasAllFieldsText = () => {
        
        if (!selectedExercise?.title || !selectedExercise.description || !selectedExercise.javascript) {
            console.error('One or more input fields are empty');
            window.alert('Fyll i alla fält innan du sparar övningen.');
            return false;
        }
        return true;
    }


    const handleExerciseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index = e.target.value ? parseInt(e.target.value) : null;
        setSelectedExerciseId(index);
        setSelectedExercise(index !== null ? exercises.find(p => p.id === index) || null : null);
        const iframe = document.querySelector('.preview-container') as HTMLIFrameElement;
        if (iframe != null && iframe.contentDocument != null) {
            iframe.contentDocument.body.innerHTML = '';
            iframe.contentDocument.head.innerHTML = '';
        }
        if (index !== null) {
            setShowEditor(true);
            setIsEditing(true);
            loadExerciseIntoEditor(index);
        }
        else {
            setShowEditor(false);
            setIsEditing(false);
            setSelectedExerciseId(null);
            setSelectedExercise(null);
        }
    }

    const loadExerciseIntoEditor = (index: number) => {
        if (index === null) return;
        const exercise = exercises.find(p => p.id === index);
        console.log(exercise);
        if (!exercise) return;
        setSelectedExercise(exercise);  // Set the whole object
    };


    const resetFrames = () => {
        const iframe = document.querySelector('.preview-container') as HTMLIFrameElement;
        if (iframe != null && iframe.contentDocument != null) {
            iframe.contentDocument.body.innerHTML = '';
            iframe.contentDocument.head.innerHTML = '';
        }
        setSelectedExerciseId(null);
        setSelectedExercise(null);
        setShowEditor(true)
    }

    const toggleCodeEditor = () => {
        resetFrames();
        setIsEditing(false);
        setShowEditor(true);
        setSelectedExerciseId(null);
        setSelectedExercise({
                id: 0,  // Or generate a temp ID
                title: '',
                description: '',
                javascript: '',
                expectedResult: '',
                tags: null,
                difficulty: 1,
                lightbulbs: [true, false, false, false, false],
                clues: []
        })
        }

    const changeDifficulty = (index: number) => () => {
        if (selectedExercise) {
            const newLightbulbs = Array(5).fill(false).map((_, i) => i <= index);
            setSelectedExercise({
                ...selectedExercise,
                lightbulbs: newLightbulbs,
                difficulty: index + 1
            });
        }
    }

    const addClue = () => {
        if (!currentClue.trim()) return;
        if (selectedExercise && selectedExercise.clues.length < 4) {
            setSelectedExercise({
                ...selectedExercise,
                clues: [...selectedExercise.clues, currentClue.trim()]
            });
            setCurrentClue('');
        }
    };

    const removeClue = (index: number) => {
        if (selectedExercise) {
            setSelectedExercise({
                ...selectedExercise,
                clues: selectedExercise.clues.filter((_, i) => i !== index)
            });
        }
    };




if (isLoading) return (
    <div className="loading-container">
        <div className="spinner"></div>
        <p>Laddar övningar...</p>
    </div>
);

if (isError) return (
    <div className="error-container">
        <p>{error instanceof Error ? error.message : 'An error occurred'}</p>
      <button className="retry-button" onClick={() => {refetch()}} disabled={isRefetching}>{isRefetching ? 'Laddar...' : 'Försök igen'}</button>
    </div>
);

return (
    <div className="manage-projects-container exercise-container">
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        <div className="create-projects-container exercise-page">
            <div className="create-projects-header">
                <header className="projects-header projects-header-controls">
                    <h1>Skapa Övning</h1>
                    <label htmlFor="exerciseSelector" className="visually-hidden">Välj övning:</label>
                    <select className="project-selector" id="exerciseSelector" value={selectedExerciseId ?? ''} onChange={handleExerciseChange}>
                        <option value="">Välj övning</option>
                        {exercises.map((ex) => (
                        <option key={ex.id} value={ex.id}>{ex.title}</option>
                        ))}
                    </select>
                    <button id="toggleView" type="button" onClick={toggleCodeEditor}>Skapa ny övning</button>
                </header>  
            </div>
            {showEditor && (
            <div className="project-editor exercise-editor">
                <div className="title-section">
                    <textarea id="titleExerciseEditor" rows={1} value={selectedExercise?.title || ''} 
                        onChange={(e) => {
                            setSelectedExercise(prev => ({...prev!, title: e.target.value}));
                            setTitle(e.target.value);
                        }} 
                        placeholder='Övningstitel här'>{title}</textarea>
                </div>
                <div className="description-section">
                    <textarea rows={2} id="descriptionExerciseEditor" value={selectedExercise?.description || ''} 
                        onChange={(e) => {
                            setSelectedExercise(prev => ({...prev!, description: e.target.value}));
                            setDescription(e.target.value);
                        }} 
                        placeholder='Övningsbeskrivning här'>{description}</textarea>
                </div>
                <div className="title-section">
                    <textarea id="expectedResultExerciseEditor" rows={1} value={selectedExercise?.expectedResult || ''}
                        onChange={(e) => {
                            setSelectedExercise(prev => ({...prev!, expectedResult: e.target.value}));
                            setExpectedResult(e.target.value);
                        }}
                        placeholder='Förväntat resultat här'>{expectedResult}</textarea>
                </div>
                <div className="clues-section">
                    <div className="clue-input-container">
                        <textarea
                            id="clueInput"
                            rows={2}
                            value={currentClue}
                            onChange={(e) => setCurrentClue(e.target.value)}
                            placeholder='Ledtråd här (max 4)'
                            disabled={selectedExercise?.clues && selectedExercise.clues.length >= 4}
                        />
                        <button
                            className='user-button'
                            onClick={addClue}
                            disabled={!currentClue.trim() || (selectedExercise?.clues && selectedExercise.clues.length >= 4)}
                        >
                            Lägg till ledtråd
                        </button>
                    </div>
                    {selectedExercise?.clues && selectedExercise.clues.length > 0 && (
                        <div className="clues-display">
                            {selectedExercise.clues.map((clue, i) => (
                                <div key={i} className="clue-item">
                                    <textarea
                                        rows={2}
                                        value={clue}
                                        readOnly
                                        className="clue-display-text"
                                    />
                                    <button
                                        className='delete-button clue-remove-btn'
                                        onClick={() => removeClue(i)}
                                        title="Ta bort ledtråd"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="javascript-section exercise-javascript-section">
                    <textarea rows={5} id="jsExerciseEditor" value={selectedExercise?.javascript || ''} 
                        onChange={(e) => {
                            setSelectedExercise(prev => ({...prev!, javascript: e.target.value}));
                            setJavascript(e.target.value);
                        }} 
                    placeholder='JavaScript-kod här'>{javascript}</textarea>
                </div>
                <div className='tag-main-container'>
                    <div className="tag-section">
                        {showTagOverlay && (
                            <div className="tag-overlay" onClick={() => setShowTagOverlay(false)}>  {/* Click outside to close */}
                                <div className="tag-popup" onClick={(e) => e.stopPropagation()}>  {/* Prevent close on inner click */}
                                    <div className="tag-input-container">
                                        <input 
                                            type="text" 
                                            id="tagExerciseInput" 
                                            placeholder="Lägg till eller filtrera taggar" 
                                            autoFocus={true}
                                            onChange={(e) => setFilterText(e.target.value)} 
                                        />
                                        <button 
                                            className='user-button' 
                                            onClick={() => {
                                                const tagInput = document.getElementById('tagInput') as HTMLInputElement;
                                                const newTag = tagInput.value.toLowerCase().trim();
                                                if (newTag && selectedExercise && !selectedExercise.tags?.includes(newTag)) {
                                                    setSelectedExercise({
                                                        ...selectedExercise,
                                                        tags: [...selectedExercise.tags ?? [], newTag]
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
                                                if (newtag && selectedExercise && !selectedExercise.tags?.includes(newtag)) {
                                                    setSelectedExercise({
                                                        ...selectedExercise,
                                                        tags: [...selectedExercise.tags ?? [], newtag]
                                                    });
                                                    // setAllTags(prev => [...new Set([...prev, newtag])]);
                                                }
                                            }}>{tag}</span>                                             
                                        ))}
                                </div>
                            </div>
                        )}
                        {selectedExercise?.tags?.map((tag, i) => (
                            <span key={i} className="project-tag chosen-tags" onClick={() => setShowTagOverlay(true)} 
                            onContextMenu={(e) => {
                                console.log(selectedExercise.tags);
                                e.preventDefault();  // Prevents right-click menu
                                if (selectedExercise) {
                                    setSelectedExercise({
                                        ...selectedExercise,
                                        tags: selectedExercise.tags?.filter(t => t !== tag ) || []
                                    });
                                }
                            }}>{tag}</span>
                        ))}
                    </div>
                    <button id="tagEditor" className='user-button' onClick={() => { console.log(computedAllTags);    setShowTagOverlay(true);}}>Lägg till tagg</button> 
                </div>
                <div className='difficulty-container'>
                    <div className='lightbulbs'>
                        {selectedExercise?.lightbulbs.map((lightbulb, i) => (
                            <span key={i} className={`difficulty ${lightbulb ? "high" : "low"}`} onClick={changeDifficulty(i)}>💡</span>
                        ))}
                    </div>
                </div>
                
                <div className="save-button-container">
                    <button id="saveProjectButton" type="button" onClick={isEditing ? updateExercise : addExercise}>{isEditing ? "Uppdatera" : "Spara"} övning</button>
                    <button id="previewProjectButton" type="button" onClick={() => setIframeKey(prev => prev + 1)}>Förhandsgranska</button>
                    <button id="cancelEditButton" type="button" className={`${isEditing ? "delete-button" : ""}`} onClick={isEditing ? () => deleteExercise() : resetFrames}>{isEditing ? "Radera" : "Rensa"}</button>
                </div>
            </div>)}
            <iframe key={iframeKey} className="preview-container exercise-preview" ref={iframeRef} title="Exercise Preview"></iframe>
        </div>

    </div>
    );
}

export default ManageExercises;