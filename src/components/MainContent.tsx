import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Timeline from '../pages/Timeline';
import Projects from '../pages/Projects';
import Settings from '../pages/Settings';
import Portfolio from '../pages/Portfolio';
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
import Attendance from '../pages/admin/Attendance';
import './MainContent.css';
import UserPermissions from '../pages/admin/UserPermissions';
import MakePost from '../pages/admin/MakePost';
import AdminSettings from '../pages/admin/AdminSettings';
import CoachAttendance from '../pages/CoachAttendance';
import ManageProjects from '../pages/admin/ManageProjects';
import AboutCourse from '../pages/AboutContent/AboutCourse';
import Login from '../pages/Login';
import Exercises from '../pages/Exercises';
import ManageExercises from '../pages/admin/ManageExercises';

interface MainContentProps {
  setShowAboutPage: (value: boolean) => void;
}

const MainContent: React.FC<MainContentProps> = ({ setShowAboutPage }) => {
  return (
    <div className="main-content">
      <Routes>
        <Route path="/" element={<AboutCourse setShowAboutPage={setShowAboutPage} />} />
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
        <Route path="/login" element={<Login setShowAboutPage={setShowAboutPage} />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/manageusers" element={<ManageUsers />} />
        <Route path="/userpermissions" element={<UserPermissions />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/makepost" element={<MakePost />} />
        <Route path="/adminsettings" element={<AdminSettings />} />
        <Route path='/coach-narvaro' element={<CoachAttendance />} />
        <Route path='/manage-projects' element={<ManageProjects />} />
        <Route path='/exercises' element={<Exercises />} />
        <Route path='/manage-exercises' element={<ManageExercises />} />
      </Routes>

    </div>
  );
};

export default MainContent;