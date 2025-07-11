  import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
  import { arrayMove, useSortable } from '@dnd-kit/sortable';
  import { CSS } from '@dnd-kit/utilities';
  import React from 'react';
  import axios from 'axios';
  import Button from '../ui/Button';
  import { MoreVertical, ChevronDown, Pencil, Trash2, Download } from 'lucide-react';


  type Role = {
  id: number;
  name: string;
  code: string;
  description: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  status: 'Approved' | 'Rejected' | 'Awaiting Approval';
  createdBy?: string;
  approvedBy?: string;
  approvedDate?: string;
};


  type RolesProps = {
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  };

  const defaultColumns = [
    { id: 'srNo', label: 'Sr. No.' },     
    { id: 'name', label: 'Role' },
    { id: 'description', label: 'Description' },
    { id: 'startTime', label: 'Start Time' },
    { id: 'endTime', label: 'End Time' },
    { id: 'createdAt', label: 'Created At' },
    { id: 'status', label: 'Status' },
    { id: 'action', label: 'Action' },
    { id: 'details', label: 'Details' },
  ];

  const Roles: React.FC<RolesProps> = ({ roles, setRoles }) => {
    const isAwaitingTab = roles.length > 0 && roles.every(r => r.status === 'Awaiting Approval');
    const awaitingColumns = [
      { id: 'select', label: '' },
      ...defaultColumns.filter(col => col.id !== 'action')
    ];
    const filteredColumns = isAwaitingTab ? awaitingColumns : defaultColumns;
    const [columns, setColumns] = React.useState(filteredColumns);
    React.useEffect(() => {
      setColumns(isAwaitingTab ? awaitingColumns : defaultColumns);
    }, [isAwaitingTab]);

    const [selectedRows, setSelectedRows] = React.useState<number[]>([]);
    const handleSelectRow = (id: number) => {
      setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };
    const handleSelectAll = () => {
      if (selectedRows.length === roles.length) {
        setSelectedRows([]);
      } else {
        setSelectedRows(roles.map(r => r.id));
      }
    };
    const [expandedIds, setExpandedIds] = React.useState<number[]>([]);

    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const handleDragEnd = (event: any) => {
      const { active, over } = event;
      if (!over) return;
      if (active.data.current?.type === 'row' && over.data.current?.type === 'row') {
        const oldIndex = roles.findIndex(r => r.id.toString() === active.id);
        const newIndex = roles.findIndex(r => r.id.toString() === over.id);
        setRoles(arrayMove(roles, oldIndex, newIndex));
      }
      if (active.data.current?.type === 'column' && over.data.current?.type === 'column') {
        const oldIndex = columns.findIndex(c => c.id === active.id);
        const newIndex = columns.findIndex(c => c.id === over.id);
        setColumns(arrayMove(columns, oldIndex, newIndex));
      }
    };

    const renderCellContent = (role: Role, columnId: string, index: number) => {
      if (isAwaitingTab && columnId === 'select') {
        return (
          <input
            type="checkbox"
            checked={selectedRows.includes(role.id)}
            onChange={() => handleSelectRow(role.id)}
            className="form-checkbox h-4 w-4 text-green-600 border-gray-300 rounded"
          />
        );
      }
      switch (columnId) {
        case 'srNo':
          return index + 1;
        case 'status':
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              role.status === 'Approved'
                ? 'bg-green-100 text-green-800'
                : role.status === 'Rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}>
              {role.status}
            </span>
          );
        case 'action':
          if (role.status === 'Awaiting Approval') return null;
          return <RoleActionButton role={role} />;
        case 'details':
          return (
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setExpandedIds(prev =>
                    prev.includes(role.id)
                      ? prev.filter(id => id !== role.id)
                      : [...prev, role.id]
                  );
                }}
                className="flex items-center gap-1 px-2 py-1 text-[#129990]"
              >
                <ChevronDown size={20} className={expandedIds.includes(role.id) ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
            </div>
          );
       default:
  if (columnId === 'createdAt') {
    return new Date(role.createdAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  return role[columnId as keyof Role];

      }
    };

    function handleDelete(roleId: number) {
  if (!window.confirm('Are you sure you want to delete this role?')) return;

  axios.post(`http://localhost:3143/roles/${roleId}/delete`)
    .then((response) => {
      const data = response.data;
      alert(`Role deleted successfully: ${data.deleted?.name || 'Unnamed Role'}`);

      // Update the roles list by removing the deleted role
      setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
    })
    .catch((error) => {
      console.error('Delete error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'An error occurred while deleting the role.';
      alert(`Error: ${message}`);
    });
}




    // Action button as a component to allow hooks
    function RoleActionButton({ role }: { role: Role }) {
      const [open, setOpen] = React.useState(false);
      // Close dropdown on click outside
      React.useEffect(() => {
        if (!open) return;
        function handleClick() {
          setOpen(false);
        }
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
      }, [open]);

      const isAwaiting = role.status === 'Awaiting Approval';

      return (
        <div className="relative flex pl-2">
          {!isAwaiting && (
            <button
              className="flex items-center w-full text-left py-2 text-sm text-[#129990]"
              onClick={e => {
                e.stopPropagation();
                setOpen(false);
                alert(`Edit role: ${role.name}`);
              }}
            >
              <Download className="w-4 h-4 text-[#129990]" />
            </button>
          )}
          <button
            className="flex items-center w-full text-left py-2 text-sm text-red-600"
            onClick={(e)=> {e.stopPropagation();handleDelete(role.id);}}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      );
    }

    // Action button for each role row
    function renderActionButton(role: Role) {
      // const [open, setOpen] = React.useState(false);
      // // Close dropdown on click outside
      // React.useEffect(() => {
      //   if (!open) return;
      //   function handleClick(e: MouseEvent) {
      //     setOpen(false);
      //   }
      //   document.addEventListener('click', handleClick);
      //   return () => document.removeEventListener('click', handleClick);
      // }, [open]);

      return (
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-100 shadow-sm"
            onClick={e => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
          >
            <MoreVertical size={16} />
            <span className="sr-only">Actions</span>
          </button>
          {open && (
            <div className="absolute right-0 z-10 mt-2 w-28 bg-white border rounded shadow-lg py-1">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={e => {
                  e.stopPropagation();
                  setOpen(false);
                  // TODO: Implement edit logic
                  alert(`Edit role: ${role.name}`);
                }}
              >Edit</button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={handleDelete}
              >Delete</button>
            </div>
          )}
        </div>
      );
    }

  
    function RoleDetails({ role }: { role: Role }) {
      const [editMode, setEditMode] = React.useState(false);
      const [editFields, setEditFields] = React.useState({
        description: role.description || '',
        startTime: role.startTime || '',
        endTime: role.endTime || '',
      });

      // Only these fields are editable
      // const editableLabels = [
      //   'Description:',
      //   'Office Start Time (IST):',
      //   'Office End Time (IST):',
      // ];

    const generalInfo = [
    { label: 'Role Name:', value: role.name },
    { label: 'Role Code:', value: role.code },
    {
      label: 'Created Date:',
      value: role.createdAt
    },
    { label: 'Status:', value: role.status },
    { label: 'Description:', value: editFields.description },
  ];


      const timingInfo = [
        { label: 'Office Start Time (IST):', value: editFields.startTime },
        { label: 'Office End Time (IST):', value: editFields.endTime },
        { label: 'Created By:', value: '' },
        { label: 'Approved Date:', value: '' },
        { label: 'Approved By:', value: '' },
      ];

      const handleFieldChange = (label: string, value: string) => {
        if (label === 'Description:') setEditFields(f => ({ ...f, description: value }));
        if (label === 'Office Start Time (IST):') setEditFields(f => ({ ...f, startTime: value }));
        if (label === 'Office End Time (IST):') setEditFields(f => ({ ...f, endTime: value }));
      };

      const handleSave = () => {
        // TODO: Save logic (call API or update parent state)
        setEditMode(false);
      };
      const handleCancel = () => {
        setEditFields({
          description: role.description || '',
          startTime: role.startTime || '',
          endTime: role.endTime || '',
        });
        setEditMode(false);
      };

      return (
        <div className="relative bg-white rounded-lg p-6 shadow border space-y-6">
          {/* Edit button top right */}
          {!editMode && (
            <button
              className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 text-[#129990] border border-[#129990] rounded hover:bg-[#129990]/10 transition"
              onClick={() => setEditMode(true)}
            >
              <Pencil size={16} /> Edit
            </button>
          )}
          {/* Section: General Info */}
          <div>
    <div className="flex items-center gap-2 mb-3"></div>
    <div className="grid grid-cols-4 gap-y-10 text-sm">
      {generalInfo.map((item) => (
        <div key={item.label} className="col-span-1 flex items-start gap-2">
          <div className="text-gray-500 font-bold w-32">{item.label}</div>

          {item.label === 'Description:' && editMode ? (
            <>
              <input
                className="border rounded px-2 py-1 text-gray-800 w-full"
                value={editFields.description}
                onChange={(e) => handleFieldChange(item.label, e.target.value)}
              />
              <Pencil size={16} className="text-[#129990] ml-1" />
            </>
          ) : (
            <div className="text-gray-800 flex items-center flex-wrap">
              {item.label === 'Created Date:' && item.value ? (
                new Date(item.value).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              ) : (
                item.value || <span className="text-gray-300">—</span>
              )}

              {item.label === 'Description:' && !editMode && (
                <Pencil size={16} className="text-[#129990] ml-1" />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>


          {/* Section: Office Timings */}
          <div>
            <div className="flex items-center gap-2 mb-3"></div>
            <div className="grid grid-cols-4 gap-x-8 gap-y-10 text-sm">
              {timingInfo.map((item) => (
                <div key={item.label} className="col-span-1 flex items-center gap-2">
                  <div className="text-gray-500 font-bold">{item.label}</div>
                  {editMode && (item.label === 'Office Start Time (IST):' || item.label === 'Office End Time (IST):') ? (
                    <>
                      <input
                        type="time"
                        className="border rounded px-2 py-1 text-gray-800 w-full"
                        value={item.label === 'Office Start Time (IST):' ? editFields.startTime : editFields.endTime}
                        onChange={e => handleFieldChange(item.label, e.target.value)}
                      />
                      <Pencil size={16} className="text-[#129990] ml-1" />
                    </>
                  ) : (
                    <div className="text-gray-800 flex items-center">
                      {item.value || <span className="text-gray-300">—</span>}
                      {editMode && (item.label === 'Office Start Time (IST):' || item.label === 'Office End Time (IST):') && <Pencil size={16} className="text-[#129990] ml-1" />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Save/Cancel buttons bottom right */}
          {editMode && (
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 rounded bg-[#129990] text-white hover:bg-[#0e7c73]" onClick={handleSave}>Save</button>
              <button className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100" onClick={handleCancel}>Cancel</button>
            </div>
          )}
        </div>
      );
    }


    return (
    <div>
      {/* Roles Table */}
      <div className="bg-white rounded-xl shadow mt-6 overflow-visible">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-50 rounded-xl">
                {columns.map(col => {
                  if (isAwaitingTab && col.id === 'select') {
                    return (
                      <th key="select" className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.length === roles.length && roles.length > 0}
                          onChange={handleSelectAll}
                          className="form-checkbox h-4 w-4 text-green-600 border-gray-300 rounded"
                        />
                      </th>
                    );
                  }
                  if (col.id === 'details') {
                    return (
                      <th key="details" className="p-4 py-3 text-center">
                        <button
                          type="button"
                          className="flex items-center justify-center mx-auto text-[#129990]"
                          title={expandedIds.length === roles.length ? 'Collapse all' : 'Expand all'}
                          onClick={() => {
                            if (expandedIds.length === roles.length) {
                              setExpandedIds([]);
                            } else {
                              setExpandedIds(roles.map(r => r.id));
                            }
                          }}
                        >

                        </button>
                      </th>
                    );
                  }
                  return <DraggableColumnHeader key={col.id} id={col.id} label={col.label} thClassName="p-4 py-3" />;
                })}
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr><td colSpan={columns.length} className="text-center p-4 text-gray-400">No roles created yet.</td></tr>
              ) : (
                roles.map((role, index) => (
                  <React.Fragment key={role.id}>
                  <tr className={expandedIds.includes(role.id) && index === 0 ? 'bg-gray-50' : index % 2 === 0 ? 'bg-[#d2f5f0]/50' : 'bg-white'}>
    {columns.map(col => (
      <td key={col.id} className="p-2">
        {renderCellContent(role, col.id, index)}
      </td>
    ))}
  </tr>

                    {expandedIds.includes(role.id) && (
                      <tr>
                        <td colSpan={columns.length} className="bg-[#d2f5f0]/50 p-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            {/* Basic Info Section */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Role Information</h3>
                              <div className="space-y-3">
                                <div className="flex">
                                  <span className="w-32 font-bold text-gray-600">Role Name:</span>
                                  <span className="text-gray-800">{role.name}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 font-bold text-gray-600">Role Code:</span>
                                  <span className="text-gray-800">{role.code || '-'}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 font-bold text-gray-600">Created Date:</span>
                                  <span className="text-gray-800">{new Date(role.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })}
  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-32 font-bold text-gray-600">Status:</span>
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    role.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                    role.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {role.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Description Section */}
                            <div className="space-y-4">
                              {/* <Button className="w-full" color='Blue' onClick={()=>alert('Edit')}>Edit</Button> */}
                              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Details</h3>
                              
                              <div className="space-y-3">
                                <div>
                                  <div className="font-bold text-gray-600 mb-1">Description:</div>
                                  <p className="text-gray-800">{role.description}</p>
                                </div>
                                <div className="flex">
                                  <span className="w-40 font-bold text-gray-600">Start Time:</span>
                                  <span className="text-gray-800">{role.startTime}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-40 font-bold text-gray-600">End Time:</span>
                                  <span className="text-gray-800">{role.endTime}</span>
                                </div>
                              </div>
                            </div>

                            {/* Approval Section */}
                            {role.status === 'Approved' && (
                              <div className="space-y-4 md:col-span-2">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Approval Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex">
                                    <span className="w-32 font-bold text-gray-600">Created By:</span>
                                    <span className="text-gray-800">{role.createdBy || '-'}</span>
                                  </div>
                                  <div className="flex">
                                    <span className="w-32 font-bold text-gray-600">Approved By:</span>
                                    <span className="text-gray-800">{role.approvedBy || '-'}</span>
                                  </div>
                                  <div className="flex">
                                    <span className="w-32 font-bold text-gray-600">Approved Date:</span>
                                    <span className="text-gray-800">
                                      {role.approvedDate ? new Date(role.approvedDate).toLocaleDateString() : '-'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
          <div className={expandedIds.length > 0 ? 'mb-16' : ''} />
        </DndContext>
      </div>
    </div>
  );
  };

  function DraggableColumnHeader({ id, label, thClassName }: { id: string; label: string; thClassName?: string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'column' } });
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: 'grab',
      opacity: isDragging ? 0.5 : 1,
      background: isDragging ? '#e0e7ff' : undefined,
      userSelect: 'none',
    };
    return (
      <th ref={setNodeRef} style={style} {...attributes} {...listeners} className={thClassName ? thClassName : "p-2"}>
        <span className="flex items-center">{label}</span>
      </th>
    );
  }

  export default Roles;