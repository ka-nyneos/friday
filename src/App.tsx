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

function App() {
  return (
    <ThemeProvider>

      <BrowserRouter>
        <Routes>
          <Route path="/masters" element={<MastersPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Login />} />
          <Route path="/user" element={<Users />} />
          <Route path="user/create" element={<UserCreationForm/>}/>
          <Route path="/roles" element={<RolesPages />} />
          <Route path="role" element={<Roles />} />
          <Route path="role/create" element={<RoleCreation/>} />
          <Route path="permission" element={<Permission/>} />
          <Route path="exposure-upload" element={<ExposureUpload/>} />
          <Route path="exposure-bucketing" element={<ExposureBucketing/>} />
          <Route path="hedging-proposal" element={<Hedgingproposal/>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
