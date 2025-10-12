import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Courses from '../pages/courses';
import Timeline from '../pages/timeline';
import Messages from '../pages/messages';
import Exercises from '../pages/exercises';
import Settings from '../pages/Settings';
import './MainContent.css';

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
      </Routes>
    </div>
  );
};

export default MainContent;