
import React, { useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import getPermissions from '../../data/FetchPermissions';
import '../../styles/button.css';
import '../../styles/spinner.css';
import './UserPermissions.css';
import Toast from '../../utils/toastMessage';
import { useUser } from '../../context/UserContext';


interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  authLevel: number;  // Role as number
  isActive: boolean;
  course?: number;
  coachId?: number | null;
}

interface Permissions {
  userId: number;
  html: boolean;
  css: boolean;
  javascript: boolean;
  variable: boolean;
  conditionals: boolean;
  loops: boolean;
  functions: boolean;
  arrays: boolean;
  objects: boolean;
}

interface JavaScriptModule {
  id: string;
  name: string;
  enabled: boolean;
  difficulty: number;
  locked: boolean;
  clues: boolean;
}

interface Project {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  tags: string[];
  typeofproject: string;
}

const defaultPermissions: Permissions = {
  userId: 0,
  html: false,
  css: false,
  javascript: false,
  variable: false,
  conditionals: false,
  loops: false,
  functions: false,
  arrays: false,
  objects: false
};

const UserPermissions: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permissions>(defaultPermissions);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isStudent, setIsStudent] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [allProjects, setAllProjects] = useState<Project[]>([]);
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

  useEffect(() => {
    const initialize = async () => {
      await fetchUsers();
      await fetchProjects();
      setSelectedRole("4");
    };
    initialize();
  }, []);

  // Handle passed user from navigation
  useEffect(() => {
    const passedUser = location.state?.selectedUser;
    if (passedUser) {
      setSelectedUser(passedUser);
      setIsStudent(passedUser.authLevel === 4);
      fetchPermissions(passedUser.email);
    }
  }, [location.state]);

  const fetchPermissions = async (email: string) => {
    if (!email) {
      setUserPermissions(defaultPermissions);
      return;
    }
    try {
      const data: Permissions = await getPermissions(email) as Permissions;
      if (!data) {
        setUserPermissions(defaultPermissions);
        return;
      }
      setUserPermissions(data);
      console.log(`Email: ${email}`, data);
    } catch (err) {
      console.log(err instanceof Error ? err.message : 'An error occurred');
    }
  }

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Ingen autentiseringstoken hittades. Vänligen logga in.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/fetch-users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let data = await response.json() as User[];
        data.sort((a, b) => a.firstName.localeCompare(b.firstName));
        setActiveUsers(data.filter(user => user.isActive));

        const filtered = data.filter(user => user.isActive && user.authLevel === (selectedRole ? Number(selectedRole) : 4));
        setFilteredUsers(filtered);

        if (filtered.length > 0 && !selectedUser) {
          setSelectedUser(filtered[0]);
          setIsStudent(filtered[0].authLevel === 4);
          fetchPermissions(filtered[0].email);
        }
      }
      catch (err) {
        setError('Kunde inte ladda användare. Försök igen senare.');
      }
      finally {
        setLoading(false);
      }
    }

    const updateUser = async (user: User | null)  => {
      if (!user) return;
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found.');
        return;
      }
      console.log(user);
      try {
        const updateData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            authLevel: user.authLevel,
            isActive: user.isActive,
            ...(user.course !== undefined && { course: user.course }),
            ...(user.coachId !== undefined && { coachId: user.coachId })
      };
        console.log('Sending:', JSON.stringify(updateData));
        const response = await fetch(`/api/update-user`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        if (!response.ok) {
          throw new Error(`Failed to ${(user.isActive ? "inactivate" : "activate")} user: ${response.status}`);
        }
        // Refetch users after status change
        await fetchUsers();
        setToastMessage(`Användare ${user.isActive ? 'inaktiverad' : 'aktiverad'} framgångsrikt!`);
      } 
      catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    const fetchProjects = async () => {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
          setError('Ingen autentiseringstoken hittades. Vänligen logga in.');
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
          data.sort((a, b) => a.difficulty - b.difficulty);
          data.forEach(project => {
            if (!project.tags) {
              project.tags = [];
            }
            if (!project.hasOwnProperty('typeofproject') || project.typeofproject === null || project.typeofproject === undefined || project.typeofproject === "") {
              project.typeofproject = "html";
            }
          if (project.tags.some(tag => tag.toLowerCase() === "javascript")) project.typeofproject = "javascript";
          else if (project.tags.some(tag => tag.toLowerCase() === "css")) project.typeofproject = "css";
          else project.typeofproject = "html";
          });
          setAllProjects(data);
      }
      catch (err) {
          setError('Kunde inte ladda projekt. Försök igen senare.');
          setAllProjects([]);
      }

    };

 
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
      allProjects.forEach(p => {
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
      allProjects.forEach(p => {
        newLocks[p.id] = { ...newLocks[p.id], html: newLocked };
      });
      setProjectLocks(newLocks);
    };

    const handleToggleHtmlCssLocked = () => {
      const newLocked = !htmlCssLocked;
      setHtmlCssLocked(newLocked);
      const newLocks = { ...projectLocks };
      allProjects.forEach(p => {
        newLocks[p.id] = { ...newLocks[p.id], html: newLocked, css: newLocked };
      });
      setProjectLocks(newLocks);
    };

    const handleToggleHtmlCssJsLocked = () => {
      const newLocked = !htmlCssJsLocked;
      setHtmlCssJsLocked(newLocked);
      const newLocks = { ...projectLocks };
      allProjects.forEach(p => {
        newLocks[p.id] = { ...newLocks[p.id], html: newLocked, css: newLocked, js: newLocked };
      });
      setProjectLocks(newLocks);
    };

    const renderProjectSection = (projectType: string, displayName: string) => {
      const projectsOfType = allProjects.filter(p => p.typeofproject === projectType);
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
                        <div className="project-name">{project.name}</div>
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
            <div className="combobox-wrapper">
              <select name='coachId' id="coachId" value={selectedUser?.coachId || selectedCoach} onChange={handleInputChange} className="coach-combobox">
                <option value="">Välj coach (valfritt)</option>
                {
                  activeUsers.filter(user => user.authLevel === 3 && user.isActive).map((coach) => (
                    <option key={coach.email} value={coach.id || ""}>
                      {`${coach.firstName} ${coach.lastName}`}
                    </option>
                  ))
                }
              </select>
            </div>
          );
    }
  
    const addCourseComboBox = (): React.ReactNode => {
      console.log('Rendering course combobox');
        return (
          <div className="combobox-wrapper">
            <select name='course' id="course" value={selectedUser?.course} onChange={handleInputChange} className="course-combobox">
              <option value="">Välj spår</option>
              <option value="1">Spår 1</option>
              <option value="2">Spår 2</option>
              <option value="3">Spår 3</option>
            </select>
          </div>
        );
    }
    
    const addRoleComboBox = (): React.ReactNode => {
        return (
          <div className="combobox-wrapper" >
            <select name='authLevel' id="authLevel" className="role-combobox" required value={selectedUser?.authLevel || selectedRole} onChange={(e) => { handleInputChange(e); showStudentCombobox(e.target.value);}}>
              <option value="" disabled>Välj roll</option>
              {userType === "Admin" ? <option value="1">Admin</option> : null}
              <option value="2">Lärare</option>
              <option value="3">Coach</option>
              <option value="4">Deltagare</option>
            </select>
          </div>
        );
    }

    const userChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const email = e.target.value;
      const user = activeUsers.find(user => user.email === email) || null;
      setIsStudent(user?.authLevel === 4);
      fetchPermissions(email)
      setSelectedUser(user);
    }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    console.log(role);
    const active = activeUsers.filter(user => user.authLevel === parseInt(role))
    setFilteredUsers(active);
    if (active.length > 0) {
       setSelectedUser(active[0]);
       setIsStudent(active[0].authLevel === 4);
    }
  }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let parsedValue: any = value;
        if (name === 'coachId') {
          setSelectedCoach(activeUsers.find(user => user.id === parseInt(value)) ? value : "");
        }
        if (type === 'number' || name === 'authLevel' || name === 'course' || name === 'coachId') {
            parsedValue = value ? parseInt(value) : null;
        }
        console.log(value);
        if (selectedUser !== null) setSelectedUser(selectedUser ? { ...selectedUser, [name]: parsedValue } : null);
    };


  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Laddar användare...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>{error}</p>
      <button className="retry-button" onClick={fetchUsers}>Försök igen</button>
    </div>
  );

  return (

    <div className='permission-main-container'>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <div className='navbar'>
        <select name='authLevel' className="role-combobox" value={selectedRole} required onChange={(e) => handleRoleChange(e)}>
          {userType === "Admin" ? <option value="1">Admin</option> : null}
          <option value="2">Lärare</option>
          <option value="3">Coach</option>
          <option value="4">Deltagare</option>
        </select>
        <select id="user-dropdown" onChange={(e) => userChanged(e)}>
          {filteredUsers.map(user => (
            <option key={user.email} value={user.email}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
        <button className='user-button' onClick={() => updateUser(selectedUser)}>Uppdatera</button>
      </div>
      {userPermissions.userId !== 0 && (
        <div className='permissions-container'>
          <div>
            <div className="add-user-form">
              <div className="add-user-name-inputs">
                <input type="text" name='firstName' id="firstName" placeholder="Förnamn"  required value={selectedUser?.firstName} onChange={handleInputChange}/>
                <input type="text" name='lastName' id="lastName" placeholder="Efternamn" required value={selectedUser?.lastName} onChange={handleInputChange}/>
                <input type="email" name='email' id="email" placeholder="Email" required value={selectedUser?.email} onChange={handleInputChange}/>
                {addRoleComboBox()}
                {isStudent && addCourseComboBox()}
                {isStudent && addCoachComboBox()}
              </div>
              {/* <div className="add-user-buttons">
                <button className='user-button' onClick={() => {addUser(getNewUserInputs()); setSelectedCoach(""); setSelectedRole("4"); setAddNewUserForm(false);}}>{btnText}</button>
                <button className='user-button' onClick={() => {setAddNewUserForm(false); setSelectedCoach(""); setSelectedRole("4")}}>Avbryt</button>
              </div> */}
          </div>
          </div>
          <h3>Projekt</h3>
          <div className='courses-sections'>
            {renderProjectSection('html', 'HTML')}
            {renderProjectSection('css', 'CSS')}
            {renderProjectSection('javascript', 'JavaScript')}
          </div>
        </div>
      )}
      <br/>
      {userPermissions.userId !== 0 && (
        <div className='permissions-container'>
          <h3>JavaScript Moduler</h3>
          <div className='courses-sections'>
            {renderJavaScriptModulesSection()}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPermissions;
