import React, { useState } from 'react';
import { uploadImage } from '../utils/imageUtils';
import type { PortfolioOwner, PortfolioProject } from '../Types/PortfolioTypes';

const defaultOwner: PortfolioOwner = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  telephone: '+46 70 123 4567',
  aboutMe: 'Full-stack developer passionate about creating elegant solutions and building modern web applications.',
  profileImageUrl: '',
  githubUrl: 'https://github.com/johndoe',
  linkedinUrl: 'https://linkedin.com/in/johndoe',
  hideFirstName: true,
  hideLastName: true,
  hideEmail: true,
  hideTelephone: true,
};

const defaultProjects: PortfolioProject[] = [
  {
    id: 1,
    title: 'E-commerce Platform',
    description: 'A full-featured e-commerce platform built with React and Node.js. Includes user authentication, product catalog, shopping cart, and payment integration.',
    imageUrl: '',
    githubLink: 'https://github.com/johndoe/ecommerce',
    isPrivate: false,
  },
  {
    id: 2,
    title: 'Weather Dashboard',
    description: 'A responsive weather dashboard that displays real-time weather data using a public API. Features include location search, 5-day forecast, and interactive charts.',
    imageUrl: '',
    githubLink: 'https://github.com/johndoe/weather',
    isPrivate: false,
  },
];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const Portfolio: React.FC = () => {
  // Owner data
  const [ownerData, setOwnerData] = useState<PortfolioOwner>(defaultOwner);
  const [ownerFormData, setOwnerFormData] = useState<PortfolioOwner>(defaultOwner);
  const [isEditingOwner, setIsEditingOwner] = useState(false);

  // Projects data
  const [projects, setProjects] = useState<PortfolioProject[]>(defaultProjects);
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);

  // Project form state
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [projectFormData, setProjectFormData] = useState<Partial<PortfolioProject>>({});

  // Image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // --- Handlers ---

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    target: 'owner' | 'project'
  ) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setIsUploadingImage(true);
    try {
      const base64 = await fileToBase64(file);
      const imageUrl = await uploadImage(base64);
      if (target === 'owner') {
        setOwnerFormData(prev => ({ ...prev, profileImageUrl: imageUrl }));
      } else {
        setProjectFormData(prev => ({ ...prev, imageUrl }));
      }
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveOwner = () => {
    setOwnerData(ownerFormData);
    setIsEditingOwner(false);
  };

  const handleCancelOwner = () => {
    setOwnerFormData(ownerData);
    setIsEditingOwner(false);
  };

  const handleStartEditOwner = () => {
    setOwnerFormData(ownerData);
    setIsEditingOwner(true);
  };

  const handleSaveProject = () => {
    if (isAddingProject) {
      const newProject: PortfolioProject = {
        id: Date.now(),
        title: projectFormData.title || '',
        description: projectFormData.description || '',
        imageUrl: projectFormData.imageUrl || '',
        githubLink: projectFormData.githubLink || '',
        isPrivate: projectFormData.isPrivate ?? true,
      };
      setProjects(prev => [...prev, newProject]);
    } else if (editingProjectId !== null) {
      setProjects(prev =>
        prev.map(p =>
          p.id === editingProjectId ? { ...p, ...projectFormData } as PortfolioProject : p
        )
      );
    }
    setIsAddingProject(false);
    setEditingProjectId(null);
    setProjectFormData({});
  };

  const handleCancelProject = () => {
    setIsAddingProject(false);
    setEditingProjectId(null);
    setProjectFormData({});
  };

  const handleStartAddProject = () => {
    setProjectFormData({
      title: '',
      description: '',
      imageUrl: '',
      githubLink: '',
      isPrivate: true,
    });
    setIsAddingProject(true);
  };

  const handleStartEditProject = (project: PortfolioProject) => {
    setProjectFormData(project);
    setEditingProjectId(project.id);
    setExpandedProjectId(null);
  };

  // --- Render helpers ---

  const renderOwnerView = () => (
    <div className="owner-profile-card">
      {ownerData.profileImageUrl && (
        <img
          src={ownerData.profileImageUrl}
          alt="Profil"
          className="owner-profile-image"
        />
      )}
      <div className="owner-info">
        <h2>
          {!ownerData.hideFirstName && ownerData.firstName}
          {!ownerData.hideFirstName && !ownerData.hideLastName && ' '}
          {!ownerData.hideLastName && ownerData.lastName}
        </h2>
        <p className="owner-about">{ownerData.aboutMe}</p>

        <div className="owner-contact">
          {!ownerData.hideEmail && (
            <div className="flex-horizontal">
              <span className="bold">E-post:</span>
              <a href={`mailto:${ownerData.email}`}>{ownerData.email}</a>
            </div>
          )}
          {!ownerData.hideTelephone && (
            <div className="flex-horizontal">
              <span className="bold">Telefon:</span>
              <span>{ownerData.telephone}</span>
            </div>
          )}
        </div>

        <div className="owner-social-links flex-horizontal">
          {ownerData.githubUrl && (
            <a href={ownerData.githubUrl} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
          {ownerData.linkedinUrl && (
            <a href={ownerData.linkedinUrl} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          )}
          <button className="edit-btn owner-edit-btn" onClick={handleStartEditOwner}>
            Redigera
          </button>
        </div>
      </div>
    </div>
  );

  const renderOwnerEditForm = () => (
    <div className="portfolio-edit-form">
      <h3>Redigera Profil</h3>

      <div className="flex-horizontal portfolio-field-row">
        <div className="flex-column" style={{ flex: 1 }}>
          <label>Förnamn</label>
          <input
            type="text"
            className="standard-input"
            value={ownerFormData.firstName}
            onChange={e => setOwnerFormData(prev => ({ ...prev, firstName: e.target.value }))}
          />
        </div>
        <label className="portfolio-checkbox-label">
          <input
            type="checkbox"
            checked={ownerFormData.hideFirstName}
            onChange={e => setOwnerFormData(prev => ({ ...prev, hideFirstName: e.target.checked }))}
          />
          Dölj
        </label>
      </div>

      <div className="flex-horizontal portfolio-field-row">
        <div className="flex-column" style={{ flex: 1 }}>
          <label>Efternamn</label>
          <input
            type="text"
            className="standard-input"
            value={ownerFormData.lastName}
            onChange={e => setOwnerFormData(prev => ({ ...prev, lastName: e.target.value }))}
          />
        </div>
        <label className="portfolio-checkbox-label">
          <input
            type="checkbox"
            checked={ownerFormData.hideLastName}
            onChange={e => setOwnerFormData(prev => ({ ...prev, hideLastName: e.target.checked }))}
          />
          Dölj
        </label>
      </div>

      <div className="flex-horizontal portfolio-field-row">
        <div className="flex-column" style={{ flex: 1 }}>
          <label>E-post</label>
          <input
            type="email"
            className="standard-input"
            value={ownerFormData.email}
            onChange={e => setOwnerFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <label className="portfolio-checkbox-label">
          <input
            type="checkbox"
            checked={ownerFormData.hideEmail}
            onChange={e => setOwnerFormData(prev => ({ ...prev, hideEmail: e.target.checked }))}
          />
          Dölj
        </label>
      </div>

      <div className="flex-horizontal portfolio-field-row">
        <div className="flex-column" style={{ flex: 1 }}>
          <label>Telefon</label>
          <input
            type="tel"
            className="standard-input"
            value={ownerFormData.telephone}
            onChange={e => setOwnerFormData(prev => ({ ...prev, telephone: e.target.value }))}
          />
        </div>
        <label className="portfolio-checkbox-label">
          <input
            type="checkbox"
            checked={ownerFormData.hideTelephone}
            onChange={e => setOwnerFormData(prev => ({ ...prev, hideTelephone: e.target.checked }))}
          />
          Dölj
        </label>
      </div>

      <div className="flex-column">
        <label>Om Mig</label>
        <textarea
          className="standard-textarea portfolio-textarea"
          rows={6}
          value={ownerFormData.aboutMe}
          onChange={e => setOwnerFormData(prev => ({ ...prev, aboutMe: e.target.value }))}
        />
      </div>

      <div className="flex-column">
        <label>Profilbild</label>
        <input
          type="file"
          accept="image/*"
          className="standard-input"
          onChange={e => handleImageUpload(e, 'owner')}
        />
        {isUploadingImage && <span>Laddar upp...</span>}
        {ownerFormData.profileImageUrl && (
          <img
            src={ownerFormData.profileImageUrl}
            alt="Förhandsgranskning"
            className="owner-profile-image-preview"
          />
        )}
      </div>

      <div className="flex-column">
        <label>GitHub URL</label>
        <input
          type="url"
          className="standard-input"
          placeholder="https://github.com/username"
          value={ownerFormData.githubUrl}
          onChange={e => setOwnerFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
        />
      </div>

      <div className="flex-column">
        <label>LinkedIn URL</label>
        <input
          type="url"
          className="standard-input"
          placeholder="https://linkedin.com/in/username"
          value={ownerFormData.linkedinUrl}
          onChange={e => setOwnerFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
        />
      </div>

      <div className="flex-horizontal-right-aligned">
        <button className="standard-btn" onClick={handleSaveOwner}>Spara</button>
        <button className="delete-btn" onClick={handleCancelOwner}>Avbryt</button>
      </div>
    </div>
  );

  const renderProjectCard = (project: PortfolioProject) => {
    const isExpanded = expandedProjectId === project.id;

    return (
      <div
        key={project.id}
        className={`project-card ${isExpanded ? 'expanded' : ''}`}
        onClick={() => !isExpanded && setExpandedProjectId(project.id)}
      >
        {!isExpanded ? (
          <>
            {project.imageUrl && (
              <img src={project.imageUrl} alt={project.title} className="project-image" />
            )}
            <h3>{project.title}</h3>
            <p className="project-description-snippet">
              {project.description.length > 100
                ? project.description.substring(0, 100) + '...'
                : project.description}
            </p>
          </>
        ) : (
          <>
            <button
              className="back-button"
              onClick={e => {
                e.stopPropagation();
                setExpandedProjectId(null);
              }}
            />
            {project.imageUrl && (
              <img src={project.imageUrl} alt={project.title} className="project-image-expanded" />
            )}
            <h3>{project.title}</h3>
            <p className="project-description-full">{project.description}</p>
            {project.githubLink && (
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="project-github-link"
                onClick={e => e.stopPropagation()}
              >
                Visa på GitHub
              </a>
            )}
            <div className="flex-horizontal-right-aligned" style={{ width: '100%' }}>
              <button
                className="edit-btn"
                onClick={e => {
                  e.stopPropagation();
                  handleStartEditProject(project);
                }}
              >
                Redigera
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderProjectForm = () => (
    <div className="project-edit-overlay" onClick={handleCancelProject}>
      <div className="project-edit-form" onClick={e => e.stopPropagation()}>
        <h3>{isAddingProject ? 'Lägg till Projekt' : 'Redigera Projekt'}</h3>

        <div className="flex-column">
          <label>Titel</label>
          <input
            type="text"
            className="standard-input"
            value={projectFormData.title || ''}
            onChange={e => setProjectFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div className="flex-column">
          <label>Beskrivning</label>
          <textarea
            className="standard-textarea portfolio-textarea"
            rows={8}
            value={projectFormData.description || ''}
            onChange={e => setProjectFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="flex-column">
          <label>GitHub-länk</label>
          <input
            type="url"
            className="standard-input"
            placeholder="https://github.com/username/project"
            value={projectFormData.githubLink || ''}
            onChange={e => setProjectFormData(prev => ({ ...prev, githubLink: e.target.value }))}
          />
        </div>

        <div className="flex-column">
          <label>Projektbild</label>
          <input
            type="file"
            accept="image/*"
            className="standard-input"
            onChange={e => handleImageUpload(e, 'project')}
          />
          {isUploadingImage && <span>Laddar upp...</span>}
          {projectFormData.imageUrl && (
            <img
              src={projectFormData.imageUrl}
              alt="Förhandsgranskning"
              className="project-image-preview"
            />
          )}
        </div>

        <label className="portfolio-checkbox-label">
          <input
            type="checkbox"
            checked={projectFormData.isPrivate ?? true}
            onChange={e => setProjectFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
          />
          Privat (dold från offentlig vy)
        </label>

        <div className="flex-horizontal-right-aligned">
          <button className="standard-btn" onClick={handleSaveProject}>Spara</button>
          <button className="delete-btn" onClick={handleCancelProject}>Avbryt</button>
        </div>
      </div>
    </div>
  );

  // --- Main render ---

  const visibleProjects = projects.filter(p => !p.isPrivate);

  return (
    <div className="page-main">
      <div className="page-header">
        <h1>Min Portfolio</h1>
      </div>
      <div className="page-content">
        {/* Owner Section */}
        {isEditingOwner ? renderOwnerEditForm() : renderOwnerView()}

        {/* Projects Section */}
        <div className="portfolio-projects-section">
          <div className="projects-header flex-horizontal">
            <h2>Projekt</h2>
            <button className="standard-btn" onClick={handleStartAddProject}>
              Lägg till Projekt
            </button>
          </div>

          <div className="projects-grid">
            {visibleProjects.map(project => renderProjectCard(project))}
          </div>

          {visibleProjects.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Inga publika projekt ännu. Klicka på "Lägg till Projekt" för att skapa ett.
            </p>
          )}
        </div>

        {/* Project Form Overlay */}
        {(isAddingProject || editingProjectId !== null) && renderProjectForm()}
      </div>
    </div>
  );
};

export default Portfolio;
