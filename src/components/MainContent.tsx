import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Courses from '../pages/Courses';
import Timeline from '../pages/Timeline';
import Messages from '../pages/Messages';
import Exercises from '../pages/Exercises';
import Settings from '../pages/Settings';
import ManageUsers from '../pages/ManageUsers';
import './MainContent.css';
import UserPermissions from '../pages/UserPermissions';
import AdminSettings from '../pages/AdminSettings';

const MainContent: React.FC = () => {
  return (
    <div className="main-content">
      <Routes>
        <Route path="/" element={<Timeline />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/messages" element={<Messages />} />
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