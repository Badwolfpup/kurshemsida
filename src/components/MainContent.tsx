import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Timeline from '../pages/Timeline';
import Exercises from '../pages/Exercises';
import Settings from '../pages/Settings';
import HtmlCourse from '../pages/courses/HtmlCourse';
import CssCourse from '../pages/courses/CssCourse';
import JavascriptCourse from '../pages/courses/JavascriptCourse';
import ManageUsers from '../pages/ManageUsers';
import './MainContent.css';
import UserPermissions from '../pages/UserPermissions';
import AdminSettings from '../pages/AdminSettings';

const MainContent: React.FC = () => {
  return (
    <div className="main-content">
      <Routes>
        <Route path="/" element={<Timeline />} />
        <Route path="courses/HtmlCourse" element={<HtmlCourse />} />
        <Route path="courses/CssCourse" element={<CssCourse />} />
        <Route path="courses/JavascriptCourse" element={<JavascriptCourse />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/manageusers" element={<ManageUsers />} />
        <Route path="/userpermissions" element={<UserPermissions />} />
        <Route path="/adminsettings" element={<AdminSettings />} />
      </Routes>
    </div>
  );
};

export default MainContent;