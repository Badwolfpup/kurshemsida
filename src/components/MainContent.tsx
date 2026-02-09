import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Projects from '../pages/Projects';
import Settings from '../pages/Settings';
import Portfolio from '../pages/Portfolio';
import ManageUsers from '../pages/admin/ManageUsers';
import Attendance from '../pages/admin/Attendance';
import UserProfiles from '../pages/admin/UserProfiles';
import MakePost from '../pages/admin/MakePost';
import AdminSettings from '../pages/admin/AdminSettings';
import CoachAttendance from '../pages/CoachAttendance';
import AboutCourse from '../pages/AboutContent/AboutCourse';
import Login from '../pages/Login';
import Exercises from '../pages/Exercises';
// import ManageProjects from '../pages/admin/ManageProjects';
// import ManageExercises from '../pages/admin/ManageExercises';

interface MainContentProps {
  setShowAboutPage: (value: boolean) => void;
}

const MainContent: React.FC<MainContentProps> = ({ setShowAboutPage }) => {
  return (
    <div className="main-content">
      <Routes>
        <Route path="/" element={<AboutCourse setShowAboutPage={setShowAboutPage} />} />
        <Route path="/login" element={<Login setShowAboutPage={setShowAboutPage} />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/manageusers" element={<ManageUsers />} />
        <Route path="/userprofile" element={<UserProfiles />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/makepost" element={<MakePost />} />
        <Route path="/adminsettings" element={<AdminSettings />} />
        <Route path='/coach-narvaro' element={<CoachAttendance />} />
        <Route path='/exercises' element={<Exercises />} />
        {/* <Route path='/manage-projects' element={<ManageProjects />} /> */}
        {/* <Route path='/manage-exercises' element={<ManageExercises />} /> */}
      </Routes>

    </div>
  );
};

export default MainContent;