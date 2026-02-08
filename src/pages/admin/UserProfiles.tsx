
import React, { useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/button.css';
import '../../styles/selects.css';
import '../../styles/spinner.css';
import './UserProfiles.css';
import Toast from '../../utils/toastMessage';
import { useUser } from '../../context/UserContext';
import type UserType from '../../Types/User';
import type ProjectType from '../../Types/ProjectType';
// import type ExerciseType from '../../Types/ExerciseType';
import { useUsers, useUpdateUser } from '../../hooks/useUsers';
import { useProjects } from '../../hooks/useProjects';
// import { useExercises } from '../../hooks/useExercises';


interface JavaScriptModule {
  id: string;
  name: string;
  enabled: boolean;
  difficulty: number;
  locked: boolean;
  clues: boolean;
}

const UserProfiles: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isStudent, setIsStudent] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const { data: projects = [] as ProjectType[]} = useProjects();
  // const { data: exercises = [] as ExerciseType[]} = useExercises();
  const { data: users = [] as UserType[], refetch, isRefetching, isLoading, isError, error } = useUsers();
  const updateUserMutation = useUpdateUser();

  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    html: false,
    css: false,
    javascript: false,
    jsModules: false
  });
  const [selectedProjects, setSelectedProjects] = useState<{[key: number]: boolean}>({});
  const [jsModules, setJsModules] = useState<JavaScriptModule[]>([
    { id: 'variables', name: 'Variabler och Datatyper', enabled: false, difficulty: 5, locked: false, clues: false },
    { id: 'operators', name: 'Operatorer', enabled: false, difficulty: 5, locked: false, clues: false },
    { id: 'conditionals', name: 'Villkor (if, else, switch)', enabled: false, difficulty: 5, locked: false, clues: false },
    { id: 'loops', name: 'Loopar (for, while, do-while)', enabled: false, difficulty: 5, locked: false, clues: false },
    { id: 'functions', name: 'Funktioner', enabled: false, difficulty: 5, locked: false, clues: false },
    { id: 'arrays', name: 'Arrayer', enabled: false, difficulty: 5, locked: false, clues: false },
    { id: 'objects', name: 'Objekt', enabled: false, difficulty: 5, locked: false, clues: false },
    { id: 'strings', name: 'Strängar och Metoder', enabled: false, difficulty: 5, locked: false, clues: false },
    { id: 'dom', name: 'DOM Grundläggande', enabled: false, difficulty: 5, locked: false, clues: false },
    { id: 'events', name: 'Händelser', enabled: false, difficulty: 5, locked: false, clues: false }
  ]);
  const [allLocked, setAllLocked] = useState<boolean>(false);
  const [allDifficulty, setAllDifficulty] = useState<number>(5);
  const [allClues, setAllClues] = useState<boolean>(false);

  // Project lock states
  const [projectLocks, setProjectLocks] = useState<{[key: number]: {
    html: boolean;
    css: boolean;
    js: boolean;
  }}>({});
  const [allProjectsLocked, setAllProjectsLocked] = useState<boolean>(false);
  const [htmlLocked, setHtmlLocked] = useState<boolean>(false);
  const [htmlCssLocked, setHtmlCssLocked] = useState<boolean>(false);
  const [htmlCssJsLocked, setHtmlCssJsLocked] = useState<boolean>(false);

  const { userType } = useUser();
  const location = useLocation();

  // Handle passed user from navigation
  useEffect(() => {
    const passedUser = location.state?.selectedUser;
    if (passedUser) {
      setSelectedRole(passedUser.authLevel.toString());
      setSelectedUser(passedUser);
      setIsStudent(passedUser.authLevel === 4);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);


  const handleUpdateUser = (user: UserType, update: boolean) => {
      if (!selectedUser) return;

      updateUserMutation.mutate(user, {
        onSuccess: () => {
          setToastMessage(`${update ? 'Användaren uppdaterad' : 'Schemat uppdaterat'}!`);
          setTimeout(() => setToastMessage(null), 3000);
        }
      });
  }
 
    // const checkboxChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //   const { id, checked } = e.target;
    //   const newPermissions = { ...userPermissions, [id]: checked };
    //   const token = localStorage.getItem('token');
    //   if (!token) {
    //     console.log('No authentication token found.');
    //     return;
    //   }
    //   try {
    //     const response = await fetch(`/api/update-user-permissions`, {
    //       method: 'PUT',
    //       headers: {
    //         'Authorization': `Bearer ${token}`,
    //         'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify(newPermissions)
    //     });
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     console.log('Permissions updated successfully');
    //     fetchPermissions(activeUsers.find(user => user.id === newPermissions.userId)?.email || '');
    //     setToastMessage('Behörigheter uppdaterade framgångsrikt!');
    //   } catch (err) {
    //     console.log(err instanceof Error ? err.message : 'An error occurred');
    //   }
    // }

    const toggleSection = (section: string) => {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };

    const toggleProjectSelection = (projectId: number) => {
      setSelectedProjects(prev => ({
        ...prev,
        [projectId]: !prev[projectId]
      }));
    };

    // const toggleSelectAllProjects = (projectType: string) => {
    //   const projectsOfType = allProjects.filter(p => p.typeofproject === projectType);
    //   const allSelected = projectsOfType.every(p => selectedProjects[p.id]);

    //   const newSelections = { ...selectedProjects };
    //   projectsOfType.forEach(p => {
    //     newSelections[p.id] = !allSelected;
    //   });
    //   setSelectedProjects(newSelections);
    // };

    // Project lock toggle functions
    const toggleProjectLock = (projectId: number, lockType: 'html' | 'css' | 'js') => {
      setProjectLocks(prev => ({
        ...prev,
        [projectId]: {
          ...prev[projectId],
          [lockType]: !prev[projectId]?.[lockType]
        }
      }));
    };

    const handleToggleAllProjectsLocked = () => {
      const newLocked = !allProjectsLocked;
      setAllProjectsLocked(newLocked);
      const newLocks: typeof projectLocks = {};
      projects.forEach(p => {
        newLocks[p.id] = { html: newLocked, css: newLocked, js: newLocked };
      });
      setProjectLocks(newLocks);
      setHtmlLocked(newLocked);
      setHtmlCssLocked(newLocked);
      setHtmlCssJsLocked(newLocked);
    };

    const handleToggleHtmlLocked = () => {
      const newLocked = !htmlLocked;
      setHtmlLocked(newLocked);
      const newLocks = { ...projectLocks };
      projects.forEach(p => {
        newLocks[p.id] = { ...newLocks[p.id], html: newLocked };
      });
      setProjectLocks(newLocks);
    };

    const handleToggleHtmlCssLocked = () => {
      const newLocked = !htmlCssLocked;
      setHtmlCssLocked(newLocked);
      const newLocks = { ...projectLocks };
      projects.forEach(p => {
        newLocks[p.id] = { ...newLocks[p.id], html: newLocked, css: newLocked };
      });
      setProjectLocks(newLocks);
    };

    const handleToggleHtmlCssJsLocked = () => {
      const newLocked = !htmlCssJsLocked;
      setHtmlCssJsLocked(newLocked);
      const newLocks = { ...projectLocks };
      projects.forEach(p => {
        newLocks[p.id] = { ...newLocks[p.id], html: newLocked, css: newLocked, js: newLocked };
      });
      setProjectLocks(newLocks);
    };

    const typeOfProject = (project: ProjectType): string => project.projectType === "javascript" ? "javascript" : project.projectType === "css" ? "css" : "html";
    

    const renderProjectSection = (projectType: string, displayName: string) => {
      const projectsOfType = projects.filter(p => typeOfProject(p) === projectType);
      const isExpanded = expandedSections[projectType];
      // const allSelected = projectsOfType.length > 0 && projectsOfType.every(p => selectedProjects[p.id]);

      // Determine which locks to show based on project type
      const showHtml = true;
      const showCss = projectType === 'css' || projectType === 'javascript';
      const showJs = projectType === 'javascript';

      return (
        <div className="project-section">
          <div className="project-section-header" onClick={() => toggleSection(projectType)}>
            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
            <span className="section-title">{displayName}</span>
            <span className="project-count">({projectsOfType.length} projekt)</span>
          </div>
          {isExpanded && (
            <div className="project-section-content">
              <div className="projects-list">
                {/* Toggle all row */}
                <div className="project-item toggle-all-row">
                  <div className="project-lock-left">
                    <span className="control-icon" onClick={handleToggleAllProjectsLocked}>
                      {allProjectsLocked ? '🔒' : '🔓'}
                    </span>
                  </div>
                  <div className="project-details">
                    <div className="project-name" style={{ fontWeight: 600 }}>Välj alla</div>
                  </div>
                  <div className="project-locks-right">
                    {showHtml && (
                      <div className="lock-column">
                        <span className="lock-label">HTML</span>
                        <span className="control-icon" onClick={handleToggleHtmlLocked}>
                          {htmlLocked ? '🔒' : '🔓'}
                        </span>
                      </div>
                    )}
                    {showCss && (
                      <div className="lock-column">
                        <span className="lock-label">CSS</span>
                        <span className="control-icon" onClick={handleToggleHtmlCssLocked}>
                          {htmlCssLocked ? '🔒' : '🔓'}
                        </span>
                      </div>
                    )}
                    {showJs && (
                      <div className="lock-column">
                        <span className="lock-label">JS</span>
                        <span className="control-icon" onClick={handleToggleHtmlCssJsLocked}>
                          {htmlCssJsLocked ? '🔒' : '🔓'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Individual project rows */}
                {projectsOfType.map(project => {
                  const locks = projectLocks[project.id] || { html: false, css: false, js: false };
                  return (
                    <div key={project.id} className="project-item">
                      <div className="project-lock-left">
                        <input
                          type="checkbox"
                          checked={selectedProjects[project.id] || false}
                          onChange={() => toggleProjectSelection(project.id)}
                        />
                      </div>
                      <div className="project-details">
                        <div className="project-name">{project.title}</div>
                        <div className="project-description">{project.description}</div>
                        <div className="project-difficulty">
                          Svårighetsgrad: {'⭐'.repeat(project.difficulty)}
                        </div>
                      </div>
                      <div className="project-locks-right">
                        {showHtml && (
                          <div className="lock-column">
                            <span className="control-icon" onClick={() => toggleProjectLock(project.id, 'html')}>
                              {locks.html ? '🔒' : '🔓'}
                            </span>
                          </div>
                        )}
                        {showCss && (
                          <div className="lock-column">
                            <span className="control-icon" onClick={() => toggleProjectLock(project.id, 'css')}>
                              {locks.css ? '🔒' : '🔓'}
                            </span>
                          </div>
                        )}
                        {showJs && (
                          <div className="lock-column">
                            <span className="control-icon" onClick={() => toggleProjectLock(project.id, 'js')}>
                              {locks.js ? '🔒' : '🔓'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    };

    // const toggleAllModules = () => {
    //   const allEnabled = jsModules.every(m => m.enabled);
    //   setJsModules(jsModules.map(m => ({ ...m, enabled: !allEnabled })));
    // };

    const handleToggleAllLocked = () => {
      const newLocked = !allLocked;
      setAllLocked(newLocked);
      setJsModules(jsModules.map(m => ({ ...m, locked: newLocked })));
    };

    const handleToggleAllClues = () => {
      const newClues = !allClues;
      setAllClues(newClues);
      setJsModules(jsModules.map(m => ({ ...m, clues: newClues })));
    };

    const handleSetAllDifficulty = (difficulty: number) => {
      setAllDifficulty(difficulty);
      setJsModules(jsModules.map(m => ({ ...m, difficulty })));
    };

    // const toggleModuleEnabled = (id: string) => {
    //   setJsModules(jsModules.map(m =>
    //     m.id === id ? { ...m, enabled: !m.enabled } : m
    //   ));
    // };

    const toggleModuleLocked = (id: string) => {
      setJsModules(jsModules.map(m =>
        m.id === id ? { ...m, locked: !m.locked } : m
      ));
    };

    const toggleModuleClues = (id: string) => {
      setJsModules(jsModules.map(m =>
        m.id === id ? { ...m, clues: !m.clues } : m
      ));
    };

    const updateModuleDifficulty = (id: string, difficulty: number) => {
      setJsModules(jsModules.map(m =>
        m.id === id ? { ...m, difficulty } : m
      ));
    };

    const renderJavaScriptModulesSection = () => {
      const isExpanded = expandedSections['jsModules'];

      return (
        <div className="project-section">
          <div className="project-section-header" onClick={() => toggleSection('jsModules')}>
            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
            <span className="section-title">JavaScript Moduler</span>
            <span className="project-count">({jsModules.length} moduler)</span>
          </div>
          {isExpanded && (
            <div className="project-section-content">
              <div className="js-modules-list">
                <div className="js-module-item toggle-all-row">
                  <div className="module-main-controls">
                    <span className="module-name" style={{ fontWeight: 600 }}>Välj alla</span>
                  </div>
                  <div className="module-extra-controls">
                    <div className="module-control" title="Lås/Lås upp alla">
                      <span className="control-icon" onClick={handleToggleAllLocked}>
                        {allLocked ? '🔒' : '🔓'}
                      </span>
                    </div>
                    <div className="module-control" title="Sätt svårighetsgrad för alla">
                      <select
                        onChange={(e) => handleSetAllDifficulty(Number(e.target.value))}
                        className="difficulty-select-with-icon"
                        value={allDifficulty}
                      >
                        <option value="1">1💡</option>
                        <option value="2">2💡</option>
                        <option value="3">3💡</option>
                        <option value="4">4💡</option>
                        <option value="5">5💡</option>
                      </select>
                    </div>
                    <div className="module-control" title="Aktivera/Inaktivera ledtrådar för alla">
                      <span
                        className={`control-icon clues-icon ${allClues ? 'active' : ''}`}
                        onClick={handleToggleAllClues}
                      >
                        ❓
                      </span>
                    </div>
                  </div>
                </div>
                {jsModules.map(module => (
                  <div key={module.id} className="js-module-item">
                    <div className="module-main-controls">
                      <span className="module-name">{module.name}</span>
                    </div>
                    <div className="module-extra-controls">
                      <div className="module-control" title="Låst">
                        <span className="control-icon" onClick={() => toggleModuleLocked(module.id)}>
                          {module.locked ? '🔒' : '🔓'}
                        </span>
                      </div>
                      <div className="module-control" title="Svårighetsgrad">
                        <select
                          value={module.difficulty}
                          onChange={(e) => updateModuleDifficulty(module.id, Number(e.target.value))}
                          className="difficulty-select-with-icon"
                        >
                          <option value="1">1💡</option>
                          <option value="2">2💡</option>
                          <option value="3">3💡</option>
                          <option value="4">4💡</option>
                          <option value="5">5💡</option>
                        </select>
                      </div>
                      <div className="module-control" title="Ledtrådar">
                        <span
                          className={`control-icon clues-icon ${module.clues ? 'active' : ''}`}
                          onClick={() => toggleModuleClues(module.id)}
                        >
                          ❓
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };

    const showStudentCombobox = (value: string) => {
      setSelectedRole(value);
      if (value === "4" )  setIsStudent(true);
      else setIsStudent(false);
    }
    const addCoachComboBox = (): React.ReactNode => {
          return (
              <select name='coachId' id="coachId" value={selectedUser?.coachId || selectedCoach} onChange={handleInputChange} className="standard-select">
                <option value="">Välj coach (valfritt)</option>
                {
                  users.filter(user => user.authLevel === 3 && user.isActive).map((coach) => (
                    <option key={coach.email} value={coach.id || ""}>
                      {`${coach.firstName} ${coach.lastName}`}
                    </option>
                  ))
                }
              </select>
          );
    }
  
    const addCourseComboBox = (): React.ReactNode => {
        return (
            <select name='course' id="course" value={selectedUser?.course || ""} onChange={handleInputChange} className="standard-select">
              <option value="" disabled>Välj spår</option>
              <option value="1">Spår 1</option>
              <option value="2">Spår 2</option>
              <option value="3">Spår 3</option>
            </select>
        );
    }
    
    const addRoleComboBox = (): React.ReactNode => {
        return (
            <select name='authLevel' id="authLevel" className="standard-select" required value={selectedUser?.authLevel || selectedRole} onChange={(e) => { handleInputChange(e); showStudentCombobox(e.target.value);}}>
              <option value="" disabled>Välj roll</option>
              {userType === "Admin" ? <option value="1">Admin</option> : null}
              <option value="2">Lärare</option>
              <option value="3">Coach</option>
              <option value="4">Deltagare</option>
            </select>
        );
    }

    const addContactComboBox = (): React.ReactNode => {
        return (
            <select name='contactId' id="contactId" className="standard-select"  onChange={(e) => handleInputChange(e)} value={selectedUser?.contactId || 0}>
              <option value={0}>Välj lärare (valfritt)</option>
              {users.length > 0 ? (
                users.filter(user => user.authLevel <= 2 && user.isActive).map((contact) => (
                  <option key={contact.email} value={contact.id || 0}>
                    {`${contact.firstName} ${contact.lastName}`}
                  </option>
                ))
              ) : null}
            </select>
        );
  }

    const userChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      const user = users.find(user => user.id === parseInt(id)) || null;
      setIsStudent(user?.authLevel === 4);
      setSelectedUser(user);
    }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    setSelectedRole(role);
    const active = users.filter(user => user.authLevel === parseInt(role))
    if (active.length > 0) {
       setSelectedUser(active[0]);
       setIsStudent(active[0].authLevel === 4);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      let parsedValue: any = value;
      if (name === 'coachId') {
        setSelectedCoach(users.find(user => user.id === parseInt(value)) ? value : "");
      }
      // if (name === 'teacherId' || name === 'contactId') {
      //   setSelectedTeacherId(value ? parseInt(value) : null);
      //   if (selectedUser) selectedUser.contactId = value ? parseInt(value) : null;
      // }
      if (type === 'number' || name === 'authLevel' || name === 'course' || name === 'coachId' || name === 'contactId') {
          parsedValue = value ? parseInt(value) : null;
      }
      if (selectedUser !== null) setSelectedUser(selectedUser ? { ...selectedUser, [name]: parsedValue } : null);
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

  return (

    <div className='page-main'>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <div className='page-header-row-direction'>
        <h2>Användarprofiler: </h2>
        <select name='authLevel' className="standard-select" value={selectedRole} required onChange={(e) => handleRoleChange(e)}>
          {userType === "Admin" ? <option value="1">Admin</option> : null}
          <option value="2">Lärare</option>
          <option value="3">Coach</option>
          <option value="4">Deltagare</option>
        </select>
        <select id="user-dropdown" className="standard-select" value={selectedUser?.id || ""}  onChange={(e) => userChanged(e)}>
          {users.filter(user => user.authLevel === parseInt(selectedRole)).map(user => (
            <option key={user.email} value={user.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
        <button className='standard-btn right-aligned' onClick={() => selectedUser && handleUpdateUser(selectedUser, true)}>Uppdatera</button>
      </div>
      
        <div className='page-content'>
          <div>
            <div>
              <div className="flex-wrap-horizontal">
                <div className='flex-column-horizontal-wrap'>
                  <span className='span-title-center'>Förnamn</span>
                  <input className='standard-input' type="text" name='firstName' id="firstName" placeholder="Förnamn"  required value={selectedUser?.firstName} onChange={handleInputChange}/>
                </div>
                <div className='flex-column-horizontal-wrap'>
                  <span className='span-title-center'>Efternamn</span>
                  <input className='standard-input' type="text" name='lastName' id="lastName" placeholder="Efternamn" required value={selectedUser?.lastName} onChange={handleInputChange}/>
                </div>
              <div className='flex-column-horizontal-wrap'>
                <span className='span-title-center'>Email</span>
                <input className='standard-input' type="email" name='email' id="email" placeholder="Email" required value={selectedUser?.email} onChange={handleInputChange}/>
              </div> 
              <div className='flex-column-horizontal-wrap'>
                <span className='span-title-center'>Startdatum</span>
                <input className='standard-input' type="date" name='startDate' id="startDate" placeholder="Startdatum" value={selectedUser?.startDate ? new Date(selectedUser.startDate).toISOString().split('T')[0] : ""} onChange={handleInputChange}/>
              </div> 
              <div className='flex-column-horizontal-wrap'>
                <span className='span-title-center'>Telefon</span>
                <input className='standard-input' type="tel" name='telephone' id="telephone" placeholder="Telefon (valfritt)" value={selectedUser?.telephone || ""} onChange={handleInputChange}/>
              </div>  
              <div className='flex-column-horizontal-wrap'>
                <span className='span-title-center'>Roll</span>
                {addRoleComboBox()}
              </div>
                {isStudent && (<div className='flex-column-horizontal-wrap'><span className='span-title-center'>Kurs</span> {addCourseComboBox()}</div>)}
                {isStudent && (<div className='flex-column-horizontal-wrap'><span className='span-title-center'>Coach</span> {addCoachComboBox()}</div>)}
                {isStudent && (<div className='flex-column-horizontal-wrap'><span className='span-title-center'>Kontakt</span> {addContactComboBox()}</div>)}
              </div>
              {selectedUser?.authLevel === 4 && <div>
                <h2>Schemalagda dagar</h2>
                <div className="page-table-wrapper">
                  <table className='page-table'>
                    <thead>
                      <tr>
                          <th>Pass</th>
                          <th>Måndag</th>
                          <th>Tisdag</th>
                          <th>Onsdag</th>
                          <th>Torsdag</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Förmiddag</td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledMonAm: !selectedUser.scheduledMonAm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (selectedUser?.scheduledMonAm ? " attended-btn" : "")} ></button></td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledTueAm: !selectedUser.scheduledTueAm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (selectedUser?.scheduledTueAm ? " attended-btn" : "")} ></button></td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledWedAm: !selectedUser.scheduledWedAm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (selectedUser?.scheduledWedAm ? " attended-btn" : "")} ></button></td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledThuAm: !selectedUser.scheduledThuAm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (selectedUser?.scheduledThuAm ? " attended-btn" : "")} ></button></td>
                      </tr>
                      <tr>
                        <td>Eftermiddag</td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledMonPm: !selectedUser.scheduledMonPm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (selectedUser?.scheduledMonPm ? " attended-btn" : "")} ></button></td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledTuePm: !selectedUser.scheduledTuePm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (selectedUser?.scheduledTuePm ? " attended-btn" : "")} ></button></td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledWedPm: !selectedUser.scheduledWedPm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (selectedUser?.scheduledWedPm ? " attended-btn" : "")} ></button></td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledThuPm: !selectedUser.scheduledThuPm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (selectedUser?.scheduledThuPm ? " attended-btn" : "")} ></button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>}
          </div>
          </div>
          <h3>Projekt</h3>
          <div className='courses-sections'>
            {renderProjectSection('html', 'HTML')}
            {renderProjectSection('css', 'CSS')}
            {renderProjectSection('javascript', 'JavaScript')}
          </div>

      <br/>
      
      <div className='permissions-container'>
        <h3>JavaScript Moduler</h3>
        <div className='courses-sections'>
          {renderJavaScriptModulesSection()}
        </div>
      </div>
    </div>
        </div>
  );
};

export default UserProfiles;
