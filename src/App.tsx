import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RolesPages from "./client/uam/RolesPage";
import Login from "./client/common/Login";
import Users from "./client/uam/Users";
import { ThemeProvider } from "./client/contexts/ThemeContext";
import UserCreationForm from "./client/uam/Users/UserCreationForm";
import Roles from "./client/uam/Roles/index";
import RoleCreation from "./client/uam/Roles/RoleCreationForm";
import Permission from "./client/uam/Permission/index";
import ForgotPassword from "./client/common/ForgotPassword";
import MastersPage from './client/common/Masters/Masters';
import ExposureBucketing from './client/fx/exposureBucketing.tsx/index.tsx';
import ExposureUpload from './client/fx/exposureUpload.tsx/index.tsx';
import Hedgingproposal from './client/fx/hedgingproposal/index.tsx';
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route path="/masters" element={<ProtectedRoute><MastersPage /></ProtectedRoute>} />
          <Route path="/user" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/user/create" element={<ProtectedRoute><UserCreationForm /></ProtectedRoute>} />
          <Route path="/role" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
          <Route path="/role/create" element={<ProtectedRoute><RoleCreation /></ProtectedRoute>} />
          <Route path="/permission" element={<ProtectedRoute><Permission /></ProtectedRoute>} />
          <Route path="/exposure-upload" element={<ProtectedRoute><ExposureUpload /></ProtectedRoute>} />
          <Route path="/exposure-bucketing" element={<ProtectedRoute><ExposureBucketing /></ProtectedRoute>} />
          <Route path="/hedging-proposal" element={<ProtectedRoute><Hedgingproposal /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
