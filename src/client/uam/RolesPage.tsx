'use client';

import axios from "axios";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useLocation , Navigate } from "react-router-dom";

// import SortableRow from '../../components/utils/SortableRow';

import Layout from "../common/Layout";
import RolesTabs from "./RolesTabs";
import Button from '../ui/Button';
import { Users, Clock } from 'lucide-react';
// import PendingRequest from "../../components/ExposureUpload/PendingRequest";
// import AddExposure from "../../components/ExposureUpload/AddExposure";



const useTabNavigation = (initialTab: string = 'allroles') => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const switchTab = useCallback((tab: string) => setActiveTab(tab), []);
  const isActiveTab = useCallback((tab: string) => activeTab === tab, [activeTab]);
  return { activeTab, switchTab, isActiveTab };
};

  interface Role {
    id?: number;
    name?: string;
    role_code?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    createdAt?: string;
    status?: string;
    createdBy?: string;
    approvedBy?: string | null;
    approveddate?: string | null;
  }

type BackendResponse = {
  showCreateButton?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  showApproveButton?: boolean;
  showRejectButton?: boolean;
  roleData?: Role[];
};




const RolesPages: React.FC = () => {
  const location = useLocation();
  const user = location.state?.user;

  if (!user || !user.isLoggedIn) {
    return <Navigate to="/" />;
  }
  const { activeTab, switchTab, isActiveTab } = useTabNavigation('allroles');

  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [actionVisibility, setActionVisibility] = useState({
    showCreateButton: false,
    showEditButton: false,
    showDeleteButton: false,
    showApproveButton: false,
    showRejectButton: false,
  });

  const [form, setForm] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
  axios
    .get<BackendResponse>(`http://localhost:3143/api/roles/page-data?nocache=${Date.now()}`)
    .then(({ data }) => {
      if (!data || !data.roleData) {
        console.error("Invalid payload structure or empty response:", data);
        return;
      }

      const {
        showCreateButton,
        showEditButton,
        showDeleteButton,
        showApproveButton,
        showRejectButton,
        roleData,
      } = data;

      setActionVisibility({
        showCreateButton: !!showCreateButton,
        showEditButton: !!showEditButton,
        showDeleteButton: !!showDeleteButton,
        showApproveButton: !!showApproveButton,
        showRejectButton: !!showRejectButton,
      });

      setRoles(roleData);
    })
    .catch((err) => {
      console.error("Error fetching roles:", err);
    });
}, []);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if ((name === "startTime" || name === "endTime") && form.startTime && form.endTime) {
      if (form.startTime >= form.endTime) {
        setTimeError("Start time must be before end time.");
      } else {
        setTimeError("");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.name || !form.description || !form.startTime || !form.endTime) {
    setFormError('All fields are required.');
    return;
  }

  if (form.startTime >= form.endTime) {
    setTimeError("Start time must be before end time.");
    return;
  }

  setFormError('');
  setTimeError('');

  const payload = {
  name: form.name,
  rolecode: form.name.toUpperCase().trim(),
  description: form.description,
  office_start_time_ist: (form.startTime),
  office_end_time_ist: (form.endTime),
  created_by: "admin_user_id"
};


  axios.post("http://localhost:3143/api/roles/create", payload)
    .then((res) => {
      if (res.data.success) {
        setRoles(prev => [...prev, res.data.role].sort((a, b) => a.name.localeCompare(b.name)));
        setForm({ name: '', description: '', startTime: '', endTime: '' });
        setShowForm(false);
        alert('Role created successfully!');
      } else {
        alert('Failed to create role: ' + (res.data.error || 'Unknown error.'));
      }
    })
    .catch(err => {
      console.error("Error creating role:", err);
      alert('Failed to create role.');
    });
};


  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return roles;
    const lower = searchTerm.toLowerCase();
    return roles.filter(role =>
      role.name.toLowerCase().includes(lower) ||
      role.description.toLowerCase().includes(lower) ||
      role.status.toLowerCase().includes(lower)
    );
  }, [roles, searchTerm]);

  const tabButtons = [
    { id: 'allroles', label: 'All Roles' },
    { id: 'Awaiting', label: 'Awaiting Approval' },
  ].map(tab => (
    <button
      key={tab.id}
      onClick={() => switchTab(tab.id)}
      className={`
        flex items-center space-x-2 px-6 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200
        ${isActiveTab(tab.id)
          ? 'bg-[#129990] text-white border-[#129990] shadow-sm'
          : 'bg-[#CFFFE2]/30 text-gray-600 border-[#CFFFE2]/30 hover:bg-[#CFFFE2]/50 hover:text-[#129990]'
        }
      `}
    >
      <span>{tab.label}</span>
    </button>
  ));

  return (
    <Layout
      title="Roles"
      showButton={actionVisibility.showCreateButton && !showForm}
      buttonText="Create Role"
      onButtonClick={() => setShowForm(true)}
    >
      {showForm ? (
        <div className="max-w-full mx-auto bg-white rounded-lg shadow-lg p-8 mt-8">
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-4">Create New Role</h2>

    <div className="mb-3">
      <label className="block font-semibold mb-1">
        Role Name <span className="text-red-500">*</span>
      </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>

            <div className="mb-3">
              <label className="block font-semibold mb-1">Description <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>

            <div className="mb-3 flex flex-col sm:flex-row gap-4">
  <div className="flex-1">
    <label className="block font-semibold mb-1">Office Start Time (IST) <span className="text-red-500">*</span></label>
    <input
      type="time"
      name="startTime"
      value={form.startTime}
      onChange={handleChange}
      className="w-full border rounded p-2"
      required
      step="60" // optional: disables seconds
    />
  </div>
  <div className="flex-1">
    <label className="block font-semibold mb-1">Office End Time (IST) <span className="text-red-500">*</span></label>
    <input
      type="time"
      name="endTime"
      value={form.endTime}
      onChange={handleChange}
      className="w-full border rounded p-2"
      required
      step="60"
    />
  </div>
</div>


            {timeError && <div className="text-red-600 mb-2">{timeError}</div>}
            {formError && <div className="text-red-600 mb-2">{formError}</div>}

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" color="Blue" categories="Medium" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" color="Green" categories="Medium">Submit</Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="mb-6 pt-4">
            <div className="flex space-x-1 border-b border-[#129990]/10">
              {tabButtons}
            </div>

            <div className="mt-10 flex items-center justify-end gap-4">
              <button
                type="button"
                className="flex items-center justify-center border border-[#129990] rounded-lg w-10 h-10 hover:bg-[#e6f7f5] transition"
                title="Refresh"
                onClick={() => window.location.reload()}
              >
                <svg width="20" height="20" fill="none" stroke="#129990" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 5.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>

              <form
                className="relative flex items-center"
                onSubmit={e => e.preventDefault()}
              >
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-4 pr-10 py-2 border border-[#129990] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#129990]/30 min-w-[180px]"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#129990]"
                  tabIndex={-1}
                  aria-label="Search"
                >
                  <svg width="18" height="18" fill="none" stroke="#129990" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          <div className="transition-opacity duration-300">
            <RolesTabs
              roles={filteredRoles}
              setRoles={setRoles}
              activeTab={activeTab}
              actionVisibility={actionVisibility}
            />
          </div>
        </>
      )}
    </Layout>
  );
};

export default RolesPages;
