import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Timeline from '../pages/Timeline';
import Exercises from '../pages/Exercises';
import Settings from '../pages/Settings';
import HtmlCourse from '../pages/courses/HtmlCourse';
import CssCourse from '../pages/courses/CssCourse';
import JavascriptCourse from '../pages/courses/JavascriptCourse';
import JsIntroduktion from '../pages/courses/javascript/Introduktion'; // New
import JsVariables from '../pages/courses/javascript/Variables'; // New
import JsConditionals from '../pages/courses/javascript/conditionals';
import JsLoops from '../pages/courses/javascript/loops';
import JsFunctions from '../pages/courses/javascript/functions';
import JsArrays from '../pages/courses/javascript/arrays';
import JsObjects from '../pages/courses/javascript/objects';
import ManageUsers from '../pages/admin/ManageUsers';
import './MainContent.css';
import UserPermissions from '../pages/admin/UserPermissions';
import MakePost from '../pages/admin/MakePost';
import AdminSettings from '../pages/AdminSettings';

const MainContent: React.FC = () => {
  return (
    <div className="main-content">
      <Routes>
        <Route path="/" element={<Timeline />} />
        <Route path="courses/HtmlCourse" element={<HtmlCourse />} />
        <Route path="courses/CssCourse" element={<CssCourse />} />
        <Route path="courses/JavascriptCourse" element={<JavascriptCourse />} />
        <Route path="courses/javascript/introduktion" element={<JsIntroduktion />} />
        <Route path="courses/javascript/variables" element={<JsVariables />} />
        <Route path="courses/javascript/conditionals" element={<JsConditionals />} />
        <Route path="courses/javascript/loops" element={<JsLoops />} />
        <Route path="courses/javascript/functions" element={<JsFunctions />} />
        <Route path="courses/javascript/arrays" element={<JsArrays />} />
        <Route path="courses/javascript/objects" element={<JsObjects />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/manageusers" element={<ManageUsers />} />
        <Route path="/userpermissions" element={<UserPermissions />} />
        <Route path="/makepost" element={<MakePost />} />
        <Route path="/adminsettings" element={<AdminSettings />} />
      </Routes>
    </div>
  );
};

export default MainContent;