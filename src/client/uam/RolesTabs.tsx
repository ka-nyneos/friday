import React, { useMemo } from 'react';
import Roles from './Roles';

export type Role = {
  id: number;
  name: string;
  code:string;
  description: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  status: 'approved' | 'rejected' | 'awaiting-approval' | 'inactive' | 'pending';
};

type ActionVisibility = {
  showEditButton: boolean;
  showDeleteButton: boolean;
  showApproveButton: boolean;
  showRejectButton: boolean;
};

type RolesTabsProps = {
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  activeTab: string;
  actionVisibility: ActionVisibility;
};

const RolesTabs: React.FC<RolesTabsProps> = ({
  roles,
  setRoles,
  activeTab,
  actionVisibility
}) => {
  const allRoles = roles;
  const awaitingRoles = useMemo(() => roles.filter(r => r.status === 'awaiting-approval' || r.status === 'pending'), [roles]);

  const tabMap: Record<string, Role[]> = {
    allroles: allRoles,
    Awaiting: awaitingRoles,
    awaiting: awaitingRoles
  };

  const currentRoles = tabMap[activeTab.toLowerCase()] || allRoles;

  return (
    <Roles
      roles={currentRoles}
      setRoles={setRoles}
      actionVisibility={actionVisibility}
    />
  );
};

export default RolesTabs;
