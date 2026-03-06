
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../services/store';
import { UserRole, FileType, Permission, User, EducationalFile, Section, Subject, VerificationCode } from '../types';
import { Users, FileText, FileVideo, FileAudio, Activity, Trash2, Shield, Eye, Plus, Edit, Upload, UserCog, Lock, Wand2, Settings as SettingsIcon, MessageSquare, Sun, Moon, Download, X, Bell, Send, Database, FileSpreadsheet, AlertTriangle, FileWarning, ZoomIn, ZoomOut, Layers, RefreshCw, CheckSquare, Filter, Copy, Info, Calendar, User as UserIcon, Key, Image as ImageIcon, Save, Phone, Hash, Type, Power, Search, CheckCircle, XCircle, Ban, ExternalLink, Minimize, Maximize, FileUp, UploadCloud, Link as LinkIcon, Loader2, List, Grid, SendHorizontal, AlignLeft, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Document, Page, pdfjs } from 'react-pdf';
import { Link, useLocation, Navigate } from 'react-router-dom';

pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.3.136/build/pdf.worker.min.js`;

// --- Shared Components ---

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-space-800 p-4 md:p-6 rounded-xl border border-space-700 flex items-center justify-between shadow-lg h-full">
        <div>
            <p className="text-muted text-xs md:text-sm mb-1">{title}</p>
            <p className="text-2xl md:text-3xl font-bold text-main">{value}</p>
        </div>
        <div className={`p-2 md:p-3 rounded-full bg-space-900 ${color}`}>
            <Icon size={20} className="md:w-6 md:h-6" />
        </div>
    </div>
);

const TabButton = ({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon?: any }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 text-xs md:text-sm ${active ? 'bg-space-accent text-space-900 shadow-lg shadow-space-accent/20 scale-105' : 'bg-space-800 text-muted hover:bg-space-700 border border-space-700 hover:text-white'}`}
    >
        {Icon && <Icon size={14} className="md:w-4 md:h-4" />}
        {label}
    </button>
);

const PermissionDenied = () => (
    <div className="flex flex-col items-center justify-center p-12 h-full text-center animate-fade-in">
        <AlertTriangle size={48} className="text-yellow-500 mb-4" />
        <h3 className="text-xl font-bold text-yellow-500 mb-2">ليس لديك صلاحية بذلك</h3>
        <p className="text-muted text-sm">يرجى مراجعة المطور الرئيسي للحصول على الصلاحيات اللازمة.</p>
    </div>
);

// --- Admin Dashboard (Home) ---

export const AdminDashboard: React.FC = () => {
  const { users, files, logs, formatTime, currentUser } = useStore();

  if (currentUser?.role === UserRole.SUB_ADMIN && !currentUser.permissions?.canViewStats) {
      return <PermissionDenied />;
  }

  const totalStudents = users.filter(u => u.role === UserRole.STUDENT).length;
  const totalDevs = users.filter(u => u.role !== UserRole.STUDENT).length;
  const activeToday = users.filter(u => {
     if (!u.lastLogin) return false;
     const today = new Date().toDateString();
     return new Date(u.lastLogin).toDateString() === today;
  }).length;
  const neverLoggedIn = users.filter(u => !u.lastLogin && u.role === UserRole.STUDENT).length;

  const viewsData = files.map(f => ({ name: f.title.substring(0, 15) + '...', views: f.views })).sort((a,b) => b.views - a.views).slice(0, 5);

  const getLogColor = (log: any) => {
      const user = users.find(u => u.id === log.userId);
      if (!user) return 'text-main';
      if (user.role === UserRole.ADMIN) return 'text-red-500';
      if (user.role === UserRole.SUB_ADMIN) return 'text-yellow-400';
      if (user.role === UserRole.STUDENT) return 'text-green-400';
      return 'text-main';
  };

  return (
    <div className="space-y-6 md:space-y-8 text-main animate-fade-in">
       <div className="flex justify-between items-center">
           <h1 className="text-2xl md:text-3xl font-bold">لوحة المعلومات</h1>
       </div>
       
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="إجمالي الطلاب" value={totalStudents} icon={Users} color="text-blue-400" />
          <StatCard title="إجمالي المطورين" value={totalDevs} icon={Shield} color="text-purple-400" />
          <StatCard title="المتصلين اليوم" value={activeToday} icon={Activity} color="text-green-400" />
          <StatCard title="عدد الملفات" value={files.length} icon={FileText} color="text-space-accent" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
           <div className="bg-space-800 p-4 md:p-6 rounded-xl border border-space-700 shadow-xl overflow-hidden">
               <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-main">أكثر الملفات مشاهدة</h3>
               <div className="h-56 md:h-64">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={viewsData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                           <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tick={{fill: '#94a3b8'}} />
                           <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} fontSize={10} />
                           <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                           <Bar dataKey="views" fill="#FDB813" radius={[4, 4, 0, 0]} />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </div>

           <div className="bg-space-800 p-4 md:p-6 rounded-xl border border-space-700 shadow-xl flex flex-col h-[400px]">
               <div className="flex justify-between items-center mb-4 shrink-0">
                   <h3 className="text-lg md:text-xl font-bold text-main">سجل النشاطات</h3>
                   <Link to="/admin/activity" className="bg-space-900 border border-space-700 hover:bg-space-700 px-3 py-1 rounded-lg text-xs md:text-sm flex items-center gap-2 transition-colors">
                       <Eye size={14} /> عرض الكل
                   </Link>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                   {logs.slice(0, 50).map(log => (
                       <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs md:text-sm p-3 rounded-lg hover:bg-space-700/50 border border-space-700/30 transition-colors">
                           <div className="mb-1 sm:mb-0">
                               <span className={`font-bold ml-2 ${getLogColor(log)}`}>{log.userName}:</span>
                               <span className="text-slate-300">{log.action}</span>
                           </div>
                           <span className="text-muted text-[10px] md:text-xs dir-ltr font-mono bg-space-900 px-2 py-0.5 rounded w-fit">
                               {formatTime(log.timestamp)}
                           </span>
                       </div>
                   ))}
               </div>
           </div>
       </div>
    </div>
  );
};

// --- Admin Users ---

export const AdminUsers: React.FC = () => {
    const { users, currentUser, deleteUser, updateUser, sections, registerStudent, registerSubAdmin, showToast, formatTime, exportUsersToCSV, importUsers, globalPasswordLength, passwordPrefix, enablePrefixInAuto, generateAlphanumericPasswords, phoneNumberLength, forceFullDataUpdateAll, toggleForceUpdateUser, sendNotification, broadcastNotification, triggerPermissionError } = useStore();
    const [viewMode, setViewMode] = useState<'STUDENTS' | 'DEVS'>('STUDENTS');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [filterType, setFilterType] = useState<'ALL' | 'DUPLICATE' | 'COMPLETED' | 'INCOMPLETE' | 'LOGGED_IN' | 'NEVER'>('ALL');
    
    // Notifications
    const [showNotifModal, setShowNotifModal] = useState(false);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [notifMessage, setNotifMessage] = useState('');
    
    // User Details Modal
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    
    // Incomplete Details Modal
    const [showIncompleteDetails, setShowIncompleteDetails] = useState<string[] | null>(null);

    // Confirm Modals
    const [showForceUpdateConfirm, setShowForceUpdateConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToSuspend, setUserToSuspend] = useState<User | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', phone: '', password: '', role: UserRole.STUDENT, sectionId: '', 
        permissions: { canManageContent: false, canManageStudents: false, canViewStats: false, canAccessSettings: false, canManageSubAdmins: false, canManageCodes: false }
    });

    const checkPermission = (actionType: 'STUDENTS' | 'SUB_ADMINS') => {
        if (currentUser?.role === UserRole.ADMIN) return true;
        if (currentUser?.role === UserRole.SUB_ADMIN) {
            if (actionType === 'STUDENTS' && currentUser.permissions?.canManageStudents) return true;
            if (actionType === 'SUB_ADMINS' && currentUser.permissions?.canManageSubAdmins) return true;
        }
        triggerPermissionError();
        return false;
    };

    const getIncompleteFields = (user: User) => {
        const issues = [];
        if (user.role === UserRole.STUDENT) {
            const nameParts = user.name.trim().split(/\s+/);
            if (nameParts.length < 3) issues.push('الاسم غير ثلاثي');
            if (!user.sectionId) issues.push('القسم غير محدد');
        }
        if (phoneNumberLength && user.phone.length !== phoneNumberLength) issues.push('الهاتف ناقص');
        return issues;
    };

    const checkCompletion = (user: User) => {
        const issues = getIncompleteFields(user);
        return issues.length > 0 ? 'غير مكتمل' : 'مكتمل';
    };

    let filteredUsers = users.filter(u => {
        const isTargetRole = viewMode === 'STUDENTS' ? u.role === UserRole.STUDENT : (u.role === UserRole.ADMIN || u.role === UserRole.SUB_ADMIN);
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search);
        
        // Hide Main Admin from Sub-Admins list
        if (viewMode === 'DEVS' && u.role === UserRole.ADMIN) return false;

        return isTargetRole && matchesSearch;
    });

    if (filterType === 'DUPLICATE') {
        const nameMap = new Map<string, number>();
        users.forEach(u => nameMap.set(u.name, (nameMap.get(u.name) || 0) + 1));
        filteredUsers = filteredUsers.filter(u => (nameMap.get(u.name) || 0) > 1);
    } else if (filterType === 'COMPLETED') {
        filteredUsers = filteredUsers.filter(u => checkCompletion(u) === 'مكتمل');
    } else if (filterType === 'INCOMPLETE') {
        filteredUsers = filteredUsers.filter(u => checkCompletion(u) !== 'مكتمل');
    } else if (filterType === 'LOGGED_IN') {
        filteredUsers = filteredUsers.filter(u => u.lastLogin !== null);
    } else if (filterType === 'NEVER') {
        filteredUsers = filteredUsers.filter(u => u.lastLogin === null);
    }

    const generatePass = () => {
        let pass = '';
        if (enablePrefixInAuto && passwordPrefix) {
            const remaining = Math.max(0, globalPasswordLength - passwordPrefix.length);
            let randomPart = '';
            if (generateAlphanumericPasswords) {
                 // Enhanced logic to ensure mixed chars
                const nums = '0123456789';
                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                const allChars = nums + letters;
                
                // Ensure at least one of each if length permits
                if (remaining >= 2) {
                    randomPart += nums.charAt(Math.floor(Math.random() * nums.length));
                    randomPart += letters.charAt(Math.floor(Math.random() * letters.length));
                    for (let i = 2; i < remaining; i++) {
                         randomPart += allChars.charAt(Math.floor(Math.random() * allChars.length));
                    }
                    // Shuffle
                    randomPart = randomPart.split('').sort(() => 0.5 - Math.random()).join('');
                } else {
                     for (let i = 0; i < remaining; i++) {
                         randomPart += allChars.charAt(Math.floor(Math.random() * allChars.length));
                    }
                }
            } else {
                randomPart = Math.floor(Math.random() * (10 ** remaining)).toString().padStart(remaining, '0');
            }
            pass = passwordPrefix + randomPart;
        } else {
            if (generateAlphanumericPasswords) {
                const nums = '0123456789';
                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                const allChars = nums + letters;
                if (globalPasswordLength >= 2) {
                     pass += nums.charAt(Math.floor(Math.random() * nums.length));
                     pass += letters.charAt(Math.floor(Math.random() * letters.length));
                     for (let i = 2; i < globalPasswordLength; i++) {
                         pass += allChars.charAt(Math.floor(Math.random() * allChars.length));
                     }
                     pass = pass.split('').sort(() => 0.5 - Math.random()).join('');
                } else {
                    for (let i = 0; i < globalPasswordLength; i++) {
                        pass += allChars.charAt(Math.floor(Math.random() * allChars.length));
                    }
                }
            } else {
                pass = Math.floor(Math.random() * (10 ** globalPasswordLength)).toString().padStart(globalPasswordLength, '0');
            }
        }
        setFormData(prev => ({ ...prev, password: pass.substring(0, globalPasswordLength) }));
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!checkPermission('STUDENTS')) return;
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const csvText = evt.target?.result as string;
            const lines = csvText.split('\n').slice(1);
            const newUsers: User[] = [];
            lines.forEach(line => {
                const cols = line.split(',');
                if (cols.length >= 3) {
                    const name = cols[0]?.trim();
                    const phone = cols[1]?.trim();
                    const password = cols[2]?.trim();
                    const sectionName = cols[4]?.trim(); 
                    const sectionId = sections.find(s => s.title === sectionName)?.id || '';
                    if (name && phone && password) {
                        newUsers.push({
                            id: Math.random().toString(36).substr(2,9),
                            name, phone, password, role: UserRole.STUDENT, sectionId,
                            createdAt: new Date().toISOString(), lastLogin: null, isSuspended: false
                        });
                    }
                }
            });
            importUsers(newUsers);
            showToast(`تم استيراد ${newUsers.length} مستخدم`);
        };
        reader.readAsText(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'ADD') {
                if (formData.role === UserRole.STUDENT) {
                    await registerStudent(formData.name, formData.phone, formData.password, formData.sectionId, '', true);
                } else {
                    await registerSubAdmin(formData.name, formData.phone, formData.password, formData.permissions);
                }
                showToast('تمت إضافة المستخدم بنجاح');
            } else if (modalMode === 'EDIT' && selectedUser) {
                const updates: Partial<User> = { name: formData.name, phone: formData.phone };
                if (formData.password) updates.password = formData.password;
                if (selectedUser.role === UserRole.STUDENT) updates.sectionId = formData.sectionId;
                if (selectedUser.role === UserRole.SUB_ADMIN) updates.permissions = formData.permissions;
                await updateUser(selectedUser.id, updates);
                showToast('تم تحديث بيانات المستخدم');
            }
            setShowModal(false);
            resetForm();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleSendNotif = () => {
        if (!checkPermission('STUDENTS')) return;
        if (!selectedUser || !notifMessage.trim()) return;
        sendNotification(selectedUser.id, notifMessage);
        setShowNotifModal(false);
        setNotifMessage('');
        showToast('تم إرسال الإشعار');
    };

    const handleBroadcastNotif = () => {
        if (!checkPermission('STUDENTS')) return;
        if (!notifMessage.trim()) return;
        broadcastNotification(notifMessage);
        setShowBroadcastModal(false);
        setNotifMessage('');
        showToast('تم إرسال الإشعار للجميع');
    };

    const handleDeleteUser = () => {
        if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
            showToast('تم الحذف بنجاح');
        }
    };

    const handleSuspendUser = () => {
        if (userToSuspend) {
            updateUser(userToSuspend.id, { isSuspended: !userToSuspend.isSuspended });
            showToast(userToSuspend.isSuspended ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب');
            setUserToSuspend(null);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', phone: '', password: '', role: viewMode === 'STUDENTS' ? UserRole.STUDENT : UserRole.SUB_ADMIN, sectionId: '',
            permissions: { canManageContent: false, canManageStudents: false, canViewStats: false, canAccessSettings: false, canManageSubAdmins: false, canManageCodes: false }
        });
        setSelectedUser(null);
    };

    const handleEdit = (user: User) => {
        const type = user.role === UserRole.STUDENT ? 'STUDENTS' : 'SUB_ADMINS';
        if (!checkPermission(type)) return;

        setSelectedUser(user);
        setModalMode('EDIT');
        setFormData({
            name: user.name,
            phone: user.phone,
            password: '', 
            role: user.role,
            sectionId: user.sectionId || '',
            permissions: user.permissions || { canManageContent: false, canManageStudents: false, canViewStats: false, canAccessSettings: false, canManageSubAdmins: false, canManageCodes: false }
        });
        setShowModal(true);
    };

    const handleAddClick = () => {
        const type = viewMode === 'STUDENTS' ? 'STUDENTS' : 'SUB_ADMINS';
        if (!checkPermission(type)) return;

        resetForm();
        setModalMode('ADD');
        setFormData(prev => ({ ...prev, role: viewMode === 'STUDENTS' ? UserRole.STUDENT : UserRole.SUB_ADMIN }));
        setShowModal(true);
    };

    const tryAction = (action: () => void, type: 'STUDENTS' | 'SUB_ADMINS') => {
        if (checkPermission(type)) {
            action();
        }
    };

    const handleViewData = (targetUser: User) => {
        const type = targetUser.role === UserRole.STUDENT ? 'STUDENTS' : 'SUB_ADMINS';
        if (checkPermission(type)) {
            setViewingUser(targetUser);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-main">إدارة المستخدمين</h1>
                
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    {viewMode === 'STUDENTS' && (
                        <>
                            <button onClick={() => tryAction(() => setShowForceUpdateConfirm(true), 'STUDENTS')} className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 text-xs md:text-sm">
                                <RefreshCw size={16} /> تحديث إجباري
                            </button>
                            <button onClick={() => tryAction(() => setShowBroadcastModal(true), 'STUDENTS')} className="bg-space-accent text-space-900 px-3 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 text-xs md:text-sm shadow-md shadow-yellow-500/20">
                                <Bell size={16} /> إشعار للكل
                            </button>
                            <div className="flex gap-2">
                                <label onClick={() => !checkPermission('STUDENTS') && event?.preventDefault()} className="bg-space-800 text-main px-3 py-2 rounded-lg font-bold hover:bg-space-700 transition-colors cursor-pointer flex items-center justify-center gap-2 border border-space-700 text-xs md:text-sm flex-1">
                                    <Upload size={16} /> استيراد
                                    <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
                                </label>
                                <button onClick={() => tryAction(() => exportUsersToCSV(UserRole.STUDENT), 'STUDENTS')} className="bg-space-800 text-main px-3 py-2 rounded-lg font-bold hover:bg-space-700 transition-colors flex items-center justify-center gap-2 border border-space-700 text-xs md:text-sm flex-1">
                                    <Download size={16} /> تصدير
                                </button>
                            </div>
                        </>
                    )}
                    <button onClick={handleAddClick} className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-green-500 transition-colors flex items-center justify-center gap-2 text-xs md:text-sm shadow-md shadow-green-500/20">
                        <Plus size={18} /> {viewMode === 'STUDENTS' ? 'إضافة طالب' : 'إضافة مطور'}
                    </button>
                </div>
            </div>

            {/* Filters and Table rendering... */}
            <div className="bg-space-800 p-2 md:p-4 rounded-xl border border-space-700 flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <TabButton active={viewMode === 'STUDENTS'} onClick={() => {setViewMode('STUDENTS'); setFilterType('ALL');}} label="الطلاب" icon={Users} />
                    <TabButton active={viewMode === 'DEVS'} onClick={() => {setViewMode('DEVS'); setFilterType('ALL');}} label="المطورين الفرعيين" icon={Shield} />
                </div>
                
                <div className="flex gap-2 items-center w-full md:w-auto">
                    <div className="relative">
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="bg-space-900 border border-space-700 rounded-lg py-2 px-2 md:px-3 text-main text-xs md:text-sm outline-none focus:border-space-accent appearance-none pr-6 cursor-pointer"
                        >
                            <option value="ALL">الكل</option>
                            <option value="DUPLICATE">المتكرر</option>
                            {viewMode === 'STUDENTS' && (
                                <>
                                    <option value="COMPLETED">اكتمال البيانات</option>
                                    <option value="INCOMPLETE">بيانات غير مكتملة</option>
                                    <option value="LOGGED_IN">سجل دخول</option>
                                    <option value="NEVER">لم يسجل دخول</option>
                                </>
                            )}
                        </select>
                        <Filter className="absolute left-1.5 top-2.5 text-muted pointer-events-none" size={12} />
                    </div>

                    <div className="relative flex-1 md:w-64">
                        <input 
                            type="text" 
                            placeholder="بحث..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-space-900 border border-space-700 rounded-lg py-2 px-3 pl-8 text-main text-xs md:text-sm focus:border-space-accent outline-none"
                        />
                        <Search className="absolute left-2.5 top-2.5 text-muted" size={14} />
                    </div>
                </div>
            </div>

            <div className="bg-space-800 rounded-xl border border-space-700 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-space-900 text-muted text-xs md:text-sm font-bold">
                            <tr>
                                <th className="p-2 md:p-4 w-12 text-center"></th>
                                <th className="p-2 md:p-4">الاسم</th>
                                <th className="p-2 md:p-4">الهاتف</th>
                                <th className="p-2 md:p-4 hidden sm:table-cell">{viewMode === 'STUDENTS' ? 'آخر ظهور' : 'الصلاحيات'}</th>
                                {viewMode === 'DEVS' && <th className="p-2 md:p-4 hidden sm:table-cell">آخر ظهور</th>}
                                {viewMode === 'STUDENTS' && <th className="p-2 md:p-4 hidden md:table-cell">البيانات</th>}
                                <th className="p-2 md:p-4 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs md:text-sm">
                            {filteredUsers.map(user => {
                                const completion = checkCompletion(user);
                                return (
                                <tr key={user.id} className={`transition-colors ${user.isSuspended ? 'bg-red-900/30 border-2 border-red-600' : 'hover:bg-space-700/30 border-b border-space-700'}`}>
                                    <td className="p-2 md:p-4 flex justify-center">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-space-600" />
                                        ) : (
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-space-700 flex items-center justify-center text-space-accent font-bold text-[10px] border border-space-600">
                                                <UserIcon size={16} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-2 md:p-4 font-bold text-main max-w-[100px] truncate">
                                        {user.name}
                                    </td>
                                    <td className="p-2 md:p-4 text-muted dir-ltr text-right font-mono">{user.phone}</td>
                                    <td className="p-2 md:p-4 text-muted hidden sm:table-cell">
                                        {user.role === UserRole.STUDENT 
                                            ? (user.lastLogin ? new Date(user.lastLogin).toLocaleString('ar-EG') : 'لم يسجل دخول')
                                            : user.role === UserRole.SUB_ADMIN 
                                                ? <span className="flex items-center gap-1"><Shield size={12}/> {Object.values(user.permissions || {}).filter(Boolean).length}</span>
                                                : 'كامل'
                                        }
                                    </td>
                                    {viewMode === 'DEVS' && (
                                        <td className="p-2 md:p-4 text-muted hidden sm:table-cell">
                                            {user.lastLogin ? new Date(user.lastLogin).toLocaleString('ar-EG') : 'لم يسجل دخول'}
                                        </td>
                                    )}
                                    {viewMode === 'STUDENTS' && (
                                        <td className="p-2 md:p-4 hidden md:table-cell">
                                            {completion === 'مكتمل' ? (
                                                <span className="text-green-400 text-[10px] bg-green-400/10 px-1.5 py-0.5 rounded">مكتمل</span>
                                            ) : (
                                                <button 
                                                    onClick={() => setShowIncompleteDetails(getIncompleteFields(user))}
                                                    className="text-orange-400 text-[10px] bg-orange-400/10 px-1.5 py-0.5 rounded hover:bg-orange-400/20"
                                                >
                                                    غير مكتمل
                                                </button>
                                            )}
                                        </td>
                                    )}
                                    <td className="p-2 md:p-4 flex items-center justify-center gap-1 md:gap-2">
                                        <button onClick={() => handleViewData(user)} className="p-1.5 md:p-2 text-space-accent hover:bg-space-accent/10 rounded transition-colors" title="عرض البيانات">
                                            <Info size={16} />
                                        </button>
                                        {user.role !== UserRole.ADMIN && (
                                            <>
                                                {user.role === UserRole.STUDENT && (
                                                    <>
                                                        <button 
                                                            onClick={() => tryAction(() => toggleForceUpdateUser(user.id), 'STUDENTS')}
                                                            className={`p-1.5 md:p-2 rounded transition-colors ${user.forceFullDataUpdate ? 'text-orange-400 bg-orange-400/10' : 'text-slate-400 hover:text-space-accent'}`} 
                                                            title="تحديث بيانات"
                                                        >
                                                            <RefreshCw size={16} />
                                                        </button>
                                                        <button onClick={() => tryAction(() => { setSelectedUser(user); setShowNotifModal(true); }, 'STUDENTS')} className="p-1.5 md:p-2 text-blue-400 hover:bg-blue-400/10 rounded" title="إرسال إشعار">
                                                            <Bell size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => handleEdit(user)} className="p-1.5 md:p-2 text-blue-400 hover:bg-blue-400/10 rounded" title="تعديل">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => tryAction(() => setUserToSuspend(user), user.role === UserRole.STUDENT ? 'STUDENTS' : 'SUB_ADMINS')} className={`p-1.5 md:p-2 rounded ${user.isSuspended ? 'text-green-400' : 'text-red-400 hover:bg-red-400/10'}`} title={user.isSuspended ? "تفعيل" : "تعطيل"}>
                                                    {user.isSuspended ? <CheckCircle size={16} /> : <Ban size={16} />}
                                                </button>
                                                <button onClick={() => tryAction(() => setUserToDelete(user), user.role === UserRole.STUDENT ? 'STUDENTS' : 'SUB_ADMINS')} className="p-1.5 md:p-2 text-red-400 hover:bg-red-400/10 rounded" title="حذف">
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modals */}
            {userToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-space-800 rounded-2xl border border-red-500 w-full max-w-sm shadow-2xl p-6 text-center">
                        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">تأكيد الحذف النهائي</h3>
                        <p className="text-slate-300 text-sm mb-6">هل أنت متأكد من حذف المستخدم <b>{userToDelete.name}</b>؟ هذا الإجراء لا يمكن التراجع عنه.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={handleDeleteUser} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-500">نعم، حذف</button>
                            <button onClick={() => setUserToDelete(null)} className="bg-space-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-space-600">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
            
            {userToSuspend && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-space-800 rounded-2xl border border-orange-500 w-full max-w-sm shadow-2xl p-6 text-center">
                        <Ban size={48} className="text-orange-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">{userToSuspend.isSuspended ? 'تأكيد التفعيل' : 'تأكيد التعطيل'}</h3>
                        <p className="text-slate-300 text-sm mb-6">
                            {userToSuspend.isSuspended ? `هل تريد تفعيل حساب ${userToSuspend.name}؟` : `هل تريد تعطيل حساب ${userToSuspend.name} ومنعه من الدخول؟`}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={handleSuspendUser} className={`text-white px-6 py-2 rounded-lg font-bold ${userToSuspend.isSuspended ? 'bg-green-600 hover:bg-green-500' : 'bg-orange-600 hover:bg-orange-500'}`}>
                                {userToSuspend.isSuspended ? 'نعم، تفعيل' : 'نعم، تعطيل'}
                            </button>
                            <button onClick={() => setUserToSuspend(null)} className="bg-space-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-space-600">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
            {showIncompleteDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-space-800 rounded-2xl border border-orange-500 w-full max-w-sm shadow-2xl p-6 text-center">
                        <AlertTriangle size={48} className="text-orange-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">البيانات الناقصة</h3>
                        <ul className="text-slate-300 text-sm mb-6 space-y-2 list-disc list-inside text-right">
                            {showIncompleteDetails.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                            ))}
                        </ul>
                        <button onClick={() => setShowIncompleteDetails(null)} className="bg-space-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-space-600">إغلاق</button>
                    </div>
                </div>
            )}
            {showForceUpdateConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-space-800 rounded-2xl border border-red-500 w-full max-w-sm shadow-2xl p-6 text-center">
                        <RefreshCw size={48} className="text-red-500 mx-auto mb-4 animate-spin-slow" />
                        <h3 className="text-xl font-bold text-white mb-2">تأكيد التحديث الإجباري</h3>
                        <p className="text-slate-300 text-sm mb-6">سيتم إجبار <b>جميع الطلاب</b> على تحديث بياناتهم عند تسجيل الدخول القادم. هل أنت متأكد؟</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => { forceFullDataUpdateAll(); setShowForceUpdateConfirm(false); showToast('تم إرسال الطلب'); }} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-500">نعم، تنفيذ</button>
                            <button onClick={() => setShowForceUpdateConfirm(false)} className="bg-space-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-space-600">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
            {viewingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-space-800 rounded-2xl border border-space-700 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="p-5 relative">
                            <button onClick={() => setViewingUser(null)} className="absolute top-3 right-3 text-muted hover:text-white"><X size={20}/></button>
                            <div className="flex flex-col items-center mb-6">
                                {viewingUser.avatarUrl ? (
                                    <img src={viewingUser.avatarUrl} alt="" className="w-32 h-32 rounded-full object-cover border-2 border-space-accent shadow-lg mb-3" />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-space-700 flex items-center justify-center text-space-accent text-5xl font-bold mb-3 border-2 border-space-accent">
                                        <UserIcon size={48} />
                                    </div>
                                )}
                                <h2 className="text-xl font-bold text-main">{viewingUser.name}</h2>
                                <span className={`text-xs mt-1 px-2 py-0.5 rounded-full ${viewingUser.isSuspended ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {viewingUser.isSuspended ? 'حساب معطل' : 'حساب نشط'}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-space-900 p-3 rounded-xl border border-space-700 flex flex-col gap-1">
                                    <span className="text-muted text-[10px] font-bold">الاسم</span>
                                    <span className="text-main font-bold text-sm truncate" title={viewingUser.name}>{viewingUser.name}</span>
                                </div>
                                <div className="bg-space-900 p-3 rounded-xl border border-space-700 flex flex-col gap-1">
                                    <span className="text-muted text-[10px] font-bold">رقم الهاتف</span>
                                    <span className="text-main font-mono dir-ltr select-all text-sm font-bold">{viewingUser.phone}</span>
                                </div>
                                <div className="bg-space-900 p-3 rounded-xl border border-space-700 flex flex-col gap-1">
                                    <span className="text-muted text-[10px] font-bold">كلمة المرور</span>
                                    <span className="text-main font-mono select-all text-sm font-bold">{viewingUser.password}</span>
                                </div>
                                <div className="bg-space-900 p-3 rounded-xl border border-space-700 flex flex-col gap-1">
                                    <span className="text-muted text-[10px] font-bold">
                                        {viewingUser.role === UserRole.SUB_ADMIN ? 'الصلاحيات' : 'القسم'}
                                    </span>
                                    <div className="text-main text-sm font-bold">
                                        {viewingUser.role === UserRole.STUDENT 
                                            ? (sections.find(s => s.id === viewingUser.sectionId)?.title || '-')
                                            : viewingUser.role === UserRole.SUB_ADMIN
                                                ? <div className="flex flex-wrap gap-1 mt-1">
                                                    {Object.entries(viewingUser.permissions || {}).filter(([k,v]) => v).map(([k,v]) => (
                                                        <span key={k} className="text-[10px] bg-space-800 px-1 rounded border border-space-700">
                                                            {k === 'canManageContent' && 'إدارة المحتوى'}
                                                            {k === 'canManageStudents' && 'إدارة الطلاب'}
                                                            {k === 'canViewStats' && 'الإحصائيات والسجلات'}
                                                            {k === 'canAccessSettings' && 'الأعدادات'}
                                                            {k === 'canManageSubAdmins' && 'إدارة المطورين'}
                                                            {k === 'canManageCodes' && 'اكواد التحقق'}
                                                        </span>
                                                    ))}
                                                  </div>
                                                : '-'
                                        }
                                    </div>
                                </div>
                                <div className="bg-space-900 p-3 rounded-xl border border-space-700 flex flex-col gap-1">
                                    <span className="text-muted text-[10px] font-bold">الجنس</span>
                                    <span className="text-main text-sm font-bold">{viewingUser.gender === 'MALE' ? 'ذكر' : viewingUser.gender === 'FEMALE' ? 'أنثى' : '-'}</span>
                                </div>
                                <div className="bg-space-900 p-3 rounded-xl border border-space-700 flex flex-col gap-1">
                                    <span className="text-muted text-[10px] font-bold">تاريخ الميلاد</span>
                                    <span className="text-main text-sm font-bold">{viewingUser.birthDate || '-'}</span>
                                </div>
                                <div className="bg-space-900 p-3 rounded-xl border border-space-700 flex flex-col gap-1">
                                    <span className="text-muted text-[10px] font-bold">تاريخ الانضمام</span>
                                    <span className="text-main text-sm font-bold dir-ltr">{new Date(viewingUser.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="bg-space-900 p-3 rounded-xl border border-space-700 flex flex-col gap-1">
                                    <span className="text-muted text-[10px] font-bold">آخر ظهور</span>
                                    <span className="text-main text-sm font-bold dir-ltr">{viewingUser.lastLogin ? new Date(viewingUser.lastLogin).toLocaleString() : 'لم يسجل دخول'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modals */}
            {showNotifModal && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-space-800 rounded-2xl border border-blue-500 w-full max-w-sm shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-xl font-bold text-white flex items-center gap-2"><Bell className="text-blue-500" size={24}/> إرسال إشعار</h3>
                             <button onClick={() => setShowNotifModal(false)} className="text-muted hover:text-white"><X size={20}/></button>
                        </div>
                        <p className="text-sm text-muted mb-2">إلى: {selectedUser.name}</p>
                        <textarea 
                            value={notifMessage}
                            onChange={e => setNotifMessage(e.target.value)}
                            className="w-full bg-space-900 border border-space-700 rounded-lg p-3 text-main outline-none focus:border-blue-500 h-32 resize-none mb-4"
                            placeholder="اكتب نص الإشعار هنا..."
                        />
                        <button onClick={handleSendNotif} disabled={!notifMessage.trim()} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50">إرسال</button>
                    </div>
                </div>
            )}

            {showBroadcastModal && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-space-800 rounded-2xl border border-space-accent w-full max-w-sm shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-xl font-bold text-white flex items-center gap-2"><Bell className="text-space-accent" size={24}/> إشعار للجميع</h3>
                             <button onClick={() => setShowBroadcastModal(false)} className="text-muted hover:text-white"><X size={20}/></button>
                        </div>
                        <p className="text-sm text-muted mb-2">سيصل هذا الإشعار لجميع المستخدمين في النظام.</p>
                        <textarea 
                            value={notifMessage}
                            onChange={e => setNotifMessage(e.target.value)}
                            className="w-full bg-space-900 border border-space-700 rounded-lg p-3 text-main outline-none focus:border-space-accent h-32 resize-none mb-4"
                            placeholder="اكتب نص الإشعار هنا..."
                        />
                        <button onClick={handleBroadcastNotif} disabled={!notifMessage.trim()} className="w-full bg-space-accent text-space-900 py-2 rounded-lg font-bold hover:bg-yellow-400 disabled:opacity-50">إرسال للكل</button>
                    </div>
                </div>
            )}

            {/* Add/Edit User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-space-800 rounded-2xl border border-space-700 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-space-700 flex justify-between items-center sticky top-0 bg-space-800 z-10">
                            <h2 className="text-xl font-bold text-main">{modalMode === 'ADD' ? (formData.role === UserRole.STUDENT ? 'إضافة طالب جديد' : 'إضافة مطور فرعي') : 'تعديل البيانات'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-muted hover:text-white"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            
                            <div>
                                <label className="text-sm text-muted block mb-1">الاسم</label>
                                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none" />
                            </div>
                            <div>
                                <label className="text-sm text-muted block mb-1">رقم الهاتف/اسم المستخدم</label>
                                <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none dir-ltr text-right" />
                            </div>
                            
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="text-sm text-muted block mb-1">{modalMode === 'EDIT' ? 'كلمة المرور الجديدة' : 'كلمة المرور'}</label>
                                    <input type="text" required={modalMode === 'ADD'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none" />
                                </div>
                                <button type="button" onClick={generatePass} className="bg-space-700 p-2.5 rounded text-space-accent hover:bg-space-600 mb-0.5" title="توليد تلقائي"><Wand2 size={20}/></button>
                            </div>

                            {formData.role === UserRole.STUDENT && (
                                <div>
                                    <label className="text-sm text-muted block mb-1">القسم الدراسي</label>
                                    <select value={formData.sectionId} onChange={e => setFormData({...formData, sectionId: e.target.value})} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none">
                                        <option value="">اختر القسم (اختياري)</option>
                                        {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                    </select>
                                </div>
                            )}

                             {formData.role === UserRole.SUB_ADMIN && (
                                <div className="space-y-2 mt-4">
                                    <p className="font-bold text-main border-b border-space-700 pb-2">الصلاحيات</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.keys(formData.permissions).map(key => (
                                            <label key={key} className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-white">
                                                <input 
                                                    type="checkbox" 
                                                    checked={(formData.permissions as any)[key]} 
                                                    onChange={e => setFormData({...formData, permissions: {...formData.permissions, [key]: e.target.checked}})}
                                                    className="accent-space-accent"
                                                />
                                                {key === 'canManageContent' && 'إدارة المحتوى'}
                                                {key === 'canManageStudents' && 'إدارة الطلاب'}
                                                {key === 'canViewStats' && 'الإحصائيات والسجلات'}
                                                {key === 'canAccessSettings' && 'الأعدادات'}
                                                {key === 'canManageSubAdmins' && 'إدارة المطورين'}
                                                {key === 'canManageCodes' && 'اكواد التحقق'}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="w-full bg-space-accent text-space-900 font-bold py-3 rounded-lg hover:bg-yellow-400 mt-4">حفظ</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Admin Content ---
export const AdminContent: React.FC = () => {
    // ... reused existing code ...
    const { sections, subjects, files, addSection, updateSection, deleteSection, addSubject, updateSubject, deleteSubject, addFile, updateFile, deleteFile, showToast, currentUser, viewRecords, users } = useStore();
    
    // ... reusing the exact same logic as before, just ensuring imports are consistent
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'SECTIONS' | 'SUBJECTS' | 'FILES'>((location.state as any)?.defaultTab || 'SECTIONS');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [filterSubject, setFilterSubject] = useState('');
    const [viewingFileDetails, setViewingFileDetails] = useState<EducationalFile | null>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<'INFO' | 'COMMENTS' | 'VIEWERS'>('INFO');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{type: 'SECTION'|'SUBJECT'|'FILE', id: string, name: string} | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [fileType, setFileType] = useState<FileType>(FileType.PDF);
    const [contentUrl, setContentUrl] = useState('');
    const [preventDownload, setPreventDownload] = useState(false);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [fileName, setFileName] = useState('');

    const canManageContent = currentUser?.role === UserRole.ADMIN || (currentUser?.role === UserRole.SUB_ADMIN && currentUser.permissions?.canManageContent);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSectionId(sections[0]?.id || '');
        setSubjectId(subjects[0]?.id || '');
        setFileType(FileType.PDF);
        setContentUrl('');
        setPreventDownload(false);
        setEditingItem(null);
        setFileName('');
        setIsProcessingFile(false);
    };

    const openAddModal = () => {
        resetForm();
        setEditingItem(null);
        setShowModal(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        setTitle(item.title);
        if (activeTab === 'SECTIONS') {
        } else if (activeTab === 'SUBJECTS') {
            setSectionId(item.sectionId);
        } else if (activeTab === 'FILES') {
            setSubjectId(item.subjectId);
            setFileType(item.type);
            setContentUrl(item.contentUrl);
            setDescription(item.description || '');
            setPreventDownload(item.preventDownload);
        }
        setShowModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 500 * 1024 * 1024) { // 500MB
            alert('حجم الملف كبير جداً');
            return;
        }
        setIsProcessingFile(true);
        setFileName(file.name);
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setContentUrl(event.target.result as string);
                setIsProcessingFile(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const initiateDelete = (type: 'SECTION'|'SUBJECT'|'FILE', item: any) => {
        setDeleteConfirmation({ type, id: item.id, name: item.title });
    };

    const executeDelete = () => {
        if (!deleteConfirmation) return;
        if (deleteConfirmation.type === 'SECTION') deleteSection(deleteConfirmation.id);
        else if (deleteConfirmation.type === 'SUBJECT') deleteSubject(deleteConfirmation.id);
        else if (deleteConfirmation.type === 'FILE') deleteFile(deleteConfirmation.id);
        showToast('تم الحذف بنجاح');
        setDeleteConfirmation(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isProcessingFile) return alert('يرجى الانتظار');
        if (activeTab === 'SECTIONS') {
            editingItem ? updateSection(editingItem.id, title) : addSection(title);
        } else if (activeTab === 'SUBJECTS') {
            editingItem ? updateSubject(editingItem.id, title) : addSubject(title, sectionId);
        } else if (activeTab === 'FILES') {
            if (editingItem) updateFile(editingItem.id, { title, description, type: fileType, contentUrl, preventDownload, subjectId });
            else addFile({
                id: Math.random().toString(36).substr(2, 9),
                title, description, type: fileType, contentUrl, subjectId, preventDownload,
                createdAt: new Date().toISOString(), views: 0, comments: [], isSuspended: false
            });
        }
        setShowModal(false);
        showToast(editingItem ? 'تم التعديل' : 'تمت الإضافة');
    };
    
    const sortedFiles = [...files].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const getAddButtonText = () => {
        if (activeTab === 'SECTIONS') return 'إضافة قسم';
        if (activeTab === 'SUBJECTS') return 'إضافة مادة';
        return 'إضافة ملف';
    };

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-main">إدارة المحتوى</h1>
            </div>
            
            {/* Controls Bar - Responsive Wrap */}
            <div className="flex flex-wrap gap-3 justify-between items-center bg-space-800 p-3 rounded-xl border border-space-700">
                <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-start">
                    <TabButton active={activeTab === 'SECTIONS'} onClick={() => setActiveTab('SECTIONS')} label="الأقسام" icon={Layers} />
                    <TabButton active={activeTab === 'SUBJECTS'} onClick={() => setActiveTab('SUBJECTS')} label="المواد" icon={Database} />
                    <TabButton active={activeTab === 'FILES'} onClick={() => setActiveTab('FILES')} label="الملفات" icon={FileText} />
                </div>
                {canManageContent && (
                    <button onClick={openAddModal} className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-500 transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-green-500/20 animate-pulse-slow">
                        <Plus size={16} /> {getAddButtonText()}
                    </button>
                )}
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'SECTIONS' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sections.map(s => (
                            <div key={s.id} className="bg-space-800 p-4 md:p-6 rounded-xl border border-space-700 hover:border-space-accent transition-all group flex flex-col justify-between h-32 md:h-40">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-space-accent">
                                        <Layers size={20} className="md:w-6 md:h-6" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-main mb-1 truncate">{s.title}</h3>
                                    <span className="text-xs text-muted">{subjects.filter(sub => sub.sectionId === s.id).length} مواد</span>
                                </div>
                                {canManageContent && (
                                    <div className="flex justify-end gap-2 mt-2 opacity-100 md:opacity-50 md:group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditModal(s)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={16}/></button>
                                        <button onClick={() => initiateDelete('SECTION', s)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={16}/></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'SUBJECTS' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjects.map(s => (
                            <div key={s.id} className="bg-space-800 p-4 md:p-6 rounded-xl border border-space-700 hover:border-space-accent transition-all group flex flex-col justify-between h-32 md:h-40">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                                        <Database size={20} className="md:w-6 md:h-6" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-main mb-1 truncate">{s.title}</h3>
                                    <span className="text-xs text-muted flex items-center gap-1">
                                        <Layers size={12} /> {sections.find(sec => sec.id === s.sectionId)?.title}
                                    </span>
                                </div>
                                {canManageContent && (
                                    <div className="flex justify-end gap-2 mt-2 opacity-100 md:opacity-50 md:group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditModal(s)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={16}/></button>
                                        <button onClick={() => initiateDelete('SUBJECT', s)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={16}/></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'FILES' && (
                    <>
                        <div className="p-4 border-b border-space-700 bg-space-800/50 mb-4 rounded-lg">
                             <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="bg-space-900 border border-space-700 text-main rounded px-3 py-2 text-sm outline-none w-full md:w-auto cursor-pointer">
                                 <option value="">كل المواد</option>
                                 {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                             </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortedFiles.filter(f => !filterSubject || f.subjectId === filterSubject).map(f => (
                                <div key={f.id} className={`bg-space-800 p-4 rounded-xl border border-space-700 hover:border-space-accent transition-all group flex flex-col ${f.isSuspended ? 'opacity-70 border-red-500/30' : ''}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`p-2 rounded ${f.isSuspended ? 'bg-red-900/20 text-red-400' : 'bg-space-900 text-space-accent'}`}>
                                            {f.type === FileType.PDF ? <FileText size={18} className="md:w-5 md:h-5"/> : f.type === FileType.VIDEO ? <FileVideo size={18} className="md:w-5 md:h-5"/> : f.type === FileType.AUDIO ? <FileAudio size={18} className="md:w-5 md:h-5"/> : f.type === FileType.IMAGE ? <ImageIcon size={18} className="md:w-5 md:h-5"/> : <Type size={18} className="md:w-5 md:h-5"/>}
                                        </div>
                                        <div className="flex gap-1">
                                            {f.preventDownload && <Lock size={14} className="text-red-400" />}
                                            {f.isSuspended && <Ban size={14} className="text-orange-400" />}
                                        </div>
                                    </div>
                                    <h4 className={`font-bold text-base md:text-lg mb-1 truncate ${f.isSuspended ? 'text-red-300' : 'text-main'}`}>{f.title}</h4>
                                    <p className="text-[10px] md:text-xs text-muted mb-4 truncate">{subjects.find(s => s.id === f.subjectId)?.title}</p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-space-700">
                                        <button onClick={() => { setViewingFileDetails(f); setActiveDetailTab('INFO'); }} className="flex gap-2 text-xs text-muted hover:text-white transition-colors">
                                            <span className="flex items-center gap-1 hover:text-blue-400" onClick={(e) => { e.stopPropagation(); setViewingFileDetails(f); setActiveDetailTab('VIEWERS'); }}><Eye size={12}/> {f.views}</span>
                                            <span className="flex items-center gap-1 hover:text-green-400" onClick={(e) => { e.stopPropagation(); setViewingFileDetails(f); setActiveDetailTab('COMMENTS'); }}><MessageSquare size={12}/> {f.comments?.length || 0}</span>
                                        </button>
                                        <div className="flex gap-1">
                                            <Link to={`/admin/file/${f.id}`} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded" title="معاينة"><Eye size={14} className="md:w-4 md:h-4"/></Link>
                                            {canManageContent && (
                                                <>
                                                    <button onClick={() => updateFile(f.id, { isSuspended: !f.isSuspended })} className={`p-1.5 rounded ${f.isSuspended ? 'text-green-400 hover:bg-green-400/10' : 'text-orange-400 hover:bg-orange-400/10'}`} title={f.isSuspended ? "تفعيل" : "تعطيل"}>
                                                        {f.isSuspended ? <CheckCircle size={14} className="md:w-4 md:h-4"/> : <Ban size={14} className="md:w-4 md:h-4"/>}
                                                    </button>
                                                    <button onClick={() => openEditModal(f)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={14} className="md:w-4 md:h-4"/></button>
                                                    <button onClick={() => initiateDelete('FILE', f)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={14} className="md:w-4 md:h-4"/></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {files.filter(f => !filterSubject || f.subjectId === filterSubject).length === 0 && <div className="col-span-full p-8 text-center text-muted">لا توجد ملفات</div>}
                        </div>
                    </>
                )}
            </div>
            
            {/* Modal Components - Keep similar, ensuring responsiveness on modal wrapper */}
            {deleteConfirmation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-space-800 rounded-2xl border border-red-500 w-full max-w-sm shadow-2xl p-6 text-center">
                        <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">تأكيد الحذف</h3>
                        <p className="text-slate-300 text-sm mb-6">هل أنت متأكد من حذف {deleteConfirmation.type === 'SECTION' ? 'القسم' : deleteConfirmation.type === 'SUBJECT' ? 'المادة' : 'الملف'} <b>{deleteConfirmation.name}</b>؟</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={executeDelete} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-500 flex-1">نعم، حذف</button>
                            <button onClick={() => setDeleteConfirmation(null)} className="bg-space-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-space-600 flex-1">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* File details modal */}
            {viewingFileDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-space-800 rounded-2xl border border-space-700 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="p-4 border-b border-space-700 flex justify-between items-center sticky top-0 bg-space-800 z-10">
                            <div className="flex gap-4 items-center overflow-hidden">
                                <button onClick={() => setViewingFileDetails(null)} className="text-muted hover:text-white shrink-0"><X size={20}/></button>
                                <h2 className="text-base font-bold text-main truncate">{viewingFileDetails.title}</h2>
                            </div>
                        </div>
                        <div className="p-2 bg-space-900 flex justify-center gap-2 border-b border-space-700">
                            <button onClick={() => setActiveDetailTab('INFO')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeDetailTab === 'INFO' ? 'bg-space-700 text-white' : 'text-muted'}`}>تفاصيل</button>
                            <button onClick={() => setActiveDetailTab('VIEWERS')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeDetailTab === 'VIEWERS' ? 'bg-space-700 text-white' : 'text-muted'}`}>المشاهدين</button>
                            <button onClick={() => setActiveDetailTab('COMMENTS')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeDetailTab === 'COMMENTS' ? 'bg-space-700 text-white' : 'text-muted'}`}>التعليقات</button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* ... tab contents same as before ... */}
                            {activeDetailTab === 'INFO' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="bg-space-900 p-4 rounded-xl border border-space-700 cursor-pointer hover:bg-space-800 transition-colors" onClick={() => setActiveDetailTab('VIEWERS')}>
                                            <Eye size={24} className="mx-auto mb-2 text-blue-400"/>
                                            <div className="text-2xl font-bold text-main">{viewingFileDetails.views}</div>
                                            <div className="text-xs text-muted">مشاهدة</div>
                                        </div>
                                        <div className="bg-space-900 p-4 rounded-xl border border-space-700 cursor-pointer hover:bg-space-800 transition-colors" onClick={() => setActiveDetailTab('COMMENTS')}>
                                            <MessageSquare size={24} className="mx-auto mb-2 text-green-400"/>
                                            <div className="text-2xl font-bold text-main">{viewingFileDetails.comments?.length || 0}</div>
                                            <div className="text-xs text-muted">تعليق</div>
                                        </div>
                                    </div>
                                    {viewingFileDetails.description && (
                                        <div className="bg-space-900 p-4 rounded-xl border border-space-700">
                                            <h4 className="font-bold text-main mb-2 text-sm">الوصف</h4>
                                            <p className="text-sm text-slate-300 whitespace-pre-wrap">{viewingFileDetails.description}</p>
                                        </div>
                                    )}
                                </>
                            )}
                            {activeDetailTab === 'VIEWERS' && (
                                <div className="space-y-2">
                                    <h4 className="font-bold text-main mb-3 text-sm flex items-center gap-2"><Eye size={16}/> قائمة المشاهدين</h4>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                                        {viewRecords.filter(v => v.fileId === viewingFileDetails.id).length > 0 ? (
                                            viewRecords.filter(v => v.fileId === viewingFileDetails.id).map((record, idx) => {
                                                const student = users.find(u => u.id === record.studentId);
                                                return (
                                                    <div key={idx} className="bg-space-900 p-3 rounded-lg border border-space-700 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-space-800 flex items-center justify-center text-xs font-bold text-space-accent">
                                                                {student?.name.charAt(0) || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-main">{student?.name || 'مستخدم محذوف'}</p>
                                                                <p className="text-[10px] text-muted">{student?.phone || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-muted text-xs text-center py-4">لا توجد مشاهدات مسجلة</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {activeDetailTab === 'COMMENTS' && (
                                <div>
                                    <h4 className="font-bold text-main mb-3 text-sm flex items-center gap-2"><MessageSquare size={16}/> كل التعليقات</h4>
                                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                                        {viewingFileDetails.comments && viewingFileDetails.comments.length > 0 ? (
                                            viewingFileDetails.comments.slice().reverse().map(c => (
                                                <div key={c.id} className="bg-space-900 p-3 rounded-lg border border-space-700">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-space-accent text-xs">{c.userName}</span>
                                                        <span className="text-[10px] text-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-300">{c.content}</p>
                                                </div>
                                            ))
                                        ) : <p className="text-muted text-xs text-center py-4">لا توجد تعليقات</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Form modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-space-800 rounded-2xl border border-space-700 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="p-6 border-b border-space-700 flex justify-between items-center sticky top-0 bg-space-800 z-10">
                            <h2 className="text-xl font-bold text-main">{editingItem ? 'تعديل' : 'إضافة'} {activeTab === 'SECTIONS' ? 'قسم' : activeTab === 'SUBJECTS' ? 'مادة' : 'ملف'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-muted hover:text-white"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div><label className="text-sm text-muted block mb-1">العنوان</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none" /></div>
                            {activeTab === 'SUBJECTS' && (<div><label className="text-sm text-muted block mb-1">القسم التابع له</label><select required value={sectionId} onChange={e => setSectionId(e.target.value)} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none"><option value="">اختر القسم</option>{sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></div>)}
                            {activeTab === 'FILES' && (<><div><label className="text-sm text-muted block mb-1">المادة</label><select required value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none"><option value="">اختر المادة</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></div><div><label className="text-sm text-muted block mb-1">الوصف (اختياري)</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full h-20 bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none resize-none" placeholder="اكتب تفاصيل الملف..." /></div><div><label className="text-sm text-muted block mb-1">نوع الملف</label><select value={fileType} onChange={e => {setFileType(e.target.value as FileType); }} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none"><option value={FileType.PDF}>PDF</option><option value={FileType.TEXT}>نص</option><option value={FileType.IMAGE}>صورة</option><option value={FileType.VIDEO}>فيديو</option><option value={FileType.AUDIO}>صوت</option></select></div>{fileType === FileType.TEXT ? (<div><label className="text-sm text-muted block mb-1">المحتوى النصي</label><textarea required value={contentUrl} onChange={e => setContentUrl(e.target.value)} className="w-full h-32 bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none" placeholder="اكتب النص هنا..." /></div>) : (<><div><label className="text-sm text-muted block mb-1">رابط المحتوى (URL)</label><input value={contentUrl.startsWith('data:') ? '' : contentUrl} onChange={e => setContentUrl(e.target.value)} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none dir-ltr" placeholder="https://..." /></div><div className="relative mt-2"><label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-space-900 transition-colors ${isProcessingFile ? 'border-space-accent opacity-50 cursor-not-allowed' : 'border-space-700 hover:border-space-accent hover:bg-space-800'}`}>{isProcessingFile ? <div className="flex flex-col items-center text-space-accent"><Loader2 size={24} className="animate-spin mb-1" /><p className="text-xs">جاري المعالجة...</p></div> : fileName || (editingItem && contentUrl.startsWith('data:')) ? <div className="flex flex-col items-center text-green-400"><CheckCircle size={24} className="mb-1" /><p className="text-xs font-bold truncate max-w-[200px]">{fileName || 'ملف محفوظ'}</p><p className="text-[10px] text-muted mt-0.5">اضغط للتغيير</p></div> : <div className="flex flex-col items-center text-muted"><UploadCloud size={24} className="mb-1" /><p className="text-xs font-bold">رفع ملف محلي</p></div>}<input type="file" className="hidden" onChange={handleFileChange} accept={fileType === FileType.PDF ? ".pdf" : fileType === FileType.VIDEO ? "video/*" : fileType === FileType.IMAGE ? "image/*" : fileType === FileType.AUDIO ? "audio/*" : "*"} disabled={isProcessingFile} /></label></div></>)}<div className="flex items-center gap-2"><input type="checkbox" id="prevDl" checked={preventDownload} onChange={e => setPreventDownload(e.target.checked)} className="accent-space-accent" /><label htmlFor="prevDl" className="text-sm text-muted cursor-pointer">منع التحميل</label></div></>)}
                            <button type="submit" disabled={isProcessingFile} className="w-full bg-space-accent text-space-900 font-bold py-3 rounded-lg hover:bg-yellow-400 mt-4 disabled:opacity-50">{isProcessingFile ? 'يرجى الانتظار...' : 'حفظ'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Admin Codes ---
export const AdminCodes: React.FC = () => {
    // ... keep code logic mostly same ...
    const { verificationCodes, generateVerificationCodes, deleteVerificationCode, deleteAllVerificationCodes, deleteUnusedVerificationCodes, deleteUsedVerificationCodes, showToast, exportCodesToCSV, formatTime, currentUser, triggerPermissionError } = useStore();
    const [numToGen, setNumToGen] = useState(50);
    const [codeLength, setCodeLength] = useState(4);
    const [isAlphanumeric, setIsAlphanumeric] = useState(false);
    const [filter, setFilter] = useState<'ALL'|'USED'|'UNUSED'>('ALL');
    const [confirmModal, setConfirmModal] = useState<{type: 'UNUSED' | 'USED' | 'ALL' | null}>({type: null});

    const canManageCodes = currentUser?.role === UserRole.ADMIN || (currentUser?.role === UserRole.SUB_ADMIN && currentUser.permissions?.canManageCodes);
    
    const filteredCodes = verificationCodes.filter(c => {
        if (filter === 'USED') return c.isUsed;
        if (filter === 'UNUSED') return !c.isUsed;
        return true;
    });

    const handleGenerate = () => {
        if (!canManageCodes) {
            triggerPermissionError();
            return;
        }
        generateVerificationCodes(numToGen, codeLength, isAlphanumeric);
        showToast(`تم توليد ${numToGen} كود`);
    };

    const handleDelete = (id: string) => {
        if (!canManageCodes) {
            triggerPermissionError();
            return;
        }
        deleteVerificationCode(id);
    };

    const confirmDeleteAction = (type: 'UNUSED' | 'USED' | 'ALL') => {
        if (!canManageCodes) {
            triggerPermissionError();
            return;
        }
        setConfirmModal({type});
    };

    const executeDelete = () => {
        if (!canManageCodes) {
            triggerPermissionError();
            return;
        }
        if (confirmModal.type === 'UNUSED') deleteUnusedVerificationCodes();
        else if (confirmModal.type === 'USED') deleteUsedVerificationCodes();
        else if (confirmModal.type === 'ALL') deleteAllVerificationCodes();
        setConfirmModal({type: null});
        showToast('تم الحذف بنجاح');
    };

    const handleExport = () => {
        if (!canManageCodes) {
            triggerPermissionError();
            return;
        }
        exportCodesToCSV();
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-main">أكواد التحقق</h1>
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-space-800 p-6 rounded-xl border border-space-700 shadow-lg">
                    <h3 className="font-bold text-lg mb-4 text-main flex items-center gap-2"><Plus size={20} className="text-green-400"/> توليد الأكواد</h3>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="flex gap-2 items-center"><label className="text-sm text-muted w-24">العدد:</label><input type="number" value={numToGen} onChange={e => setNumToGen(parseInt(e.target.value)||0)} className="bg-space-900 border border-space-700 rounded p-2 text-main w-24 text-center" min="1" max="500" /></div>
                            <div className="flex gap-2 items-center"><label className="text-sm text-muted w-24">طول الكود:</label><input type="number" value={codeLength} onChange={e => setCodeLength(parseInt(e.target.value)||0)} className="bg-space-900 border border-space-700 rounded p-2 text-main w-24 text-center" min="4" max="12" /></div>
                            <div className="flex items-center gap-2"><input type="checkbox" id="alpha" checked={isAlphanumeric} onChange={e => setIsAlphanumeric(e.target.checked)} className="accent-space-accent w-4 h-4"/><label htmlFor="alpha" className="text-sm text-muted cursor-pointer">أرقام مع حروف إنجليزية</label></div>
                            <button onClick={handleGenerate} className="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-500 transition-colors mt-2">توليد الآن</button>
                        </div>
                        <div className="w-full md:w-px h-px md:h-auto bg-space-700"></div>
                        <div className="flex-1 flex flex-col justify-center gap-2">
                            <h3 className="font-bold text-main mb-2">التنظيف والتصدير</h3>
                            <div className="flex gap-2"><button onClick={() => confirmDeleteAction('UNUSED')} className="flex-1 bg-space-900 text-muted p-2 rounded hover:bg-space-700 text-xs transition-colors border border-space-700 h-10">حذف المتاح فقط</button><button onClick={() => confirmDeleteAction('USED')} className="flex-1 bg-space-900 text-muted p-2 rounded hover:bg-space-700 text-xs transition-colors border border-space-700 h-10">حذف المستخدم فقط</button></div>
                            <div className="flex gap-2"><button onClick={handleExport} className="flex-1 bg-space-700 text-white p-2 rounded hover:bg-space-600 text-xs flex items-center justify-center gap-1 transition-colors h-10"><Download size={14}/> تصدير CSV</button><button onClick={() => confirmDeleteAction('ALL')} className="flex-1 bg-red-500/20 text-red-400 p-2 rounded hover:bg-red-500 hover:text-white text-xs border border-red-500/50 transition-colors h-10">حذف الكل</button></div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Table */}
            <div className="bg-space-800 rounded-xl border border-space-700 shadow-lg overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 border-b border-space-700 flex justify-between items-center bg-space-800"><div className="flex items-center gap-2 flex-wrap"><div className="text-sm font-bold text-muted">الإجمالي: {verificationCodes.length}</div><div className="h-4 w-px bg-space-700 mx-2 hidden sm:block"></div><TabButton active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="الكل" /><TabButton active={filter === 'UNUSED'} onClick={() => setFilter('UNUSED')} label="متاح" /><TabButton active={filter === 'USED'} onClick={() => setFilter('USED')} label="مستخدم" /></div></div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-right text-sm"><thead className="bg-space-900 text-muted sticky top-0"><tr><th className="p-3">الكود</th><th className="p-3">الحالة</th><th className="p-3 hidden sm:table-cell">تاريخ الإنشاء</th><th className="p-3">استخدم بواسطة</th><th className="p-3 hidden sm:table-cell">تاريخ الاستخدام</th><th className="p-3"></th></tr></thead><tbody className="divide-y divide-space-700">{filteredCodes.map(c => (<tr key={c.id} className="hover:bg-space-700/30"><td className="p-3 font-mono font-bold text-lg text-space-accent tracking-widest">{c.code}</td><td className="p-3">{c.isUsed ? <span className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded">مستخدم</span> : <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded">متاح</span>}</td><td className="p-3 text-muted text-xs dir-ltr hidden sm:table-cell">{new Date(c.createdAt).toLocaleDateString()}</td><td className="p-3 text-muted text-xs">{c.usedBy || '-'}</td><td className="p-3 text-muted text-xs dir-ltr hidden sm:table-cell">{c.usedAt ? formatTime(c.usedAt) : '-'}</td><td className="p-3 text-center"><button onClick={() => handleDelete(c.id)} className="text-red-400 hover:bg-red-400/10 p-1.5 rounded"><Trash2 size={14}/></button></td></tr>))}</tbody></table>{filteredCodes.length === 0 && <div className="p-10 text-center text-muted">لا توجد أكواد</div>}
                </div>
            </div>
            {confirmModal.type && (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><div className="bg-space-800 rounded-2xl border border-red-500 w-full max-w-sm shadow-2xl p-6 text-center"><AlertTriangle size={48} className="text-red-500 mx-auto mb-4" /><h3 className="text-xl font-bold text-white mb-2">{confirmModal.type === 'ALL' ? 'تأكيد حذف الكل' : confirmModal.type === 'UNUSED' ? 'حذف غير المستخدم' : 'حذف المستخدم'}</h3><p className="text-slate-300 text-sm mb-6">{confirmModal.type === 'ALL' ? 'هل أنت متأكد من حذف جميع الأكواد (المتاحة والمستخدمة)؟' : confirmModal.type === 'UNUSED' ? 'هل تريد حذف جميع الأكواد المتاحة؟' : 'هل تريد حذف سجل الأكواد المستخدمة؟'}</p><div className="flex gap-3 justify-center"><button onClick={executeDelete} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-500">نعم، حذف</button><button onClick={() => setConfirmModal({type: null})} className="bg-space-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-space-600">إلغاء</button></div></div></div>)}
        </div>
    );
};

// --- Admin Settings ---

export const AdminSettings: React.FC = () => {
    // Reusing existing AdminSettings but ensuring logging
    const { currentUser, globalPasswordLength, setGlobalPasswordLength, phoneNumberLength, setPhoneNumberLength, systemMessage, updateSystemMessage, showToast, codeGetUrl, setCodeGetUrl, codePrefix, setCodePrefix, setPasswordPrefix, enablePrefixInAuto, setEnablePrefixInAuto, enablePrefixInCodes, setEnablePrefixInCodes, generateAlphanumericPasswords, setGenerateAlphanumericPasswords, timeFormat, setTimeFormat, triggerPermissionError } = useStore();
    const [msgContent, setMsgContent] = useState(systemMessage.content);
    const [isActive, setIsActive] = useState(systemMessage.isActive);
    const [urlInput, setUrlInput] = useState(codeGetUrl || '');
    const [prefixInput, setPrefixInput] = useState(codePrefix || '');

    // Permission Check
    const canAccessSettings = currentUser?.role === UserRole.ADMIN || (currentUser?.role === UserRole.SUB_ADMIN && currentUser.permissions?.canAccessSettings);

    const tryAction = (action: () => void) => {
        if (!canAccessSettings) {
            triggerPermissionError();
        } else {
            action();
        }
    };

    const handleSaveMsg = () => {
        tryAction(() => {
            updateSystemMessage({ content: msgContent, isActive, showAtLogin: false });
            showToast('تم تحديث رسالة النظام');
        });
    };

    const handleSaveUrl = () => {
        tryAction(() => {
            setCodeGetUrl(urlInput);
            showToast('تم تحديث رابط الكود');
        });
    };

    const handleSavePrefix = () => {
        tryAction(() => {
            setCodePrefix(prefixInput);
            setPasswordPrefix(prefixInput);
            showToast('تم حفظ البادئة');
        });
    };

    const handleSettingChange = (action: () => void) => {
        tryAction(action);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-main">إعدادات النظام</h1>

            <div className="bg-space-800 p-6 rounded-xl border border-space-700 shadow-lg space-y-6">
                <h3 className="text-xl font-bold text-space-accent flex items-center gap-2"><SettingsIcon size={24}/> التكوين العام</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-muted mb-2">طول كلمة المرور (عند إنشاء حساب والتوليد التلقائي)</label>
                        <select 
                            value={globalPasswordLength}
                            onChange={(e) => handleSettingChange(() => { setGlobalPasswordLength(parseInt(e.target.value)); showToast('تم الحفظ'); })}
                            className="w-full bg-space-900 border border-space-700 rounded p-3 text-main outline-none focus:border-space-accent"
                        >
                            {[4, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n} خانات</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-muted mb-2">طول رقم الهاتف (عند إنشاء حساب)</label>
                        <input 
                            type="number"
                            value={phoneNumberLength || ''}
                            onChange={(e) => setPhoneNumberLength(parseInt(e.target.value))}
                            onBlur={() => handleSettingChange(() => showToast('تم الحفظ'))}
                            className="w-full bg-space-900 border border-space-700 rounded p-3 text-main outline-none focus:border-space-accent"
                            placeholder="مثلا: 11"
                        />
                        <p className="text-xs text-muted mt-1">اتركه فارغاً لتعطيل التحقق من الطول.</p>
                    </div>
                    
                    <div className="md:col-span-2 space-y-4">
                        <label className="block text-sm text-muted mb-2">إعدادات البادئة</label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={prefixInput}
                                onChange={(e) => setPrefixInput(e.target.value)}
                                className="flex-1 bg-space-900 border border-space-700 rounded p-3 text-main outline-none focus:border-space-accent dir-ltr"
                                placeholder="مثال: STD"
                            />
                            <button onClick={handleSavePrefix} className="bg-green-600 hover:bg-green-500 text-white px-4 rounded font-bold">حفظ البادئة</button>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mt-2">
                            <label className="flex items-center gap-2 text-main cursor-pointer p-3 bg-space-900 rounded border border-space-700 hover:border-space-accent transition-colors flex-1">
                                <input type="checkbox" checked={enablePrefixInAuto} onChange={e => handleSettingChange(() => setEnablePrefixInAuto(e.target.checked))} className="accent-space-accent w-5 h-5"/>
                                تفعيل البادئة في توليد كلمات المرور
                            </label>
                            <label className="flex items-center gap-2 text-main cursor-pointer p-3 bg-space-900 rounded border border-space-700 hover:border-space-accent transition-colors flex-1">
                                <input type="checkbox" checked={enablePrefixInCodes} onChange={e => handleSettingChange(() => setEnablePrefixInCodes(e.target.checked))} className="accent-space-accent w-5 h-5"/>
                                تفعيل البادئة في توليد الأكواد
                            </label>
                        </div>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 text-main cursor-pointer p-3 bg-space-900 rounded border border-space-700 hover:border-space-accent transition-colors flex-1">
                                <input type="checkbox" checked={generateAlphanumericPasswords} onChange={e => handleSettingChange(() => setGenerateAlphanumericPasswords(e.target.checked))} className="accent-space-accent w-5 h-5"/>
                                توليد كلمات مرور ارقام مع حروف انجليزية
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm text-muted mb-2">رابط الحصول على كود</label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                className="flex-1 bg-space-900 border border-space-700 rounded p-3 text-main outline-none focus:border-space-accent dir-ltr"
                                placeholder="https://example.com/get-code"
                            />
                            <button onClick={handleSaveUrl} className="bg-green-600 hover:bg-green-500 text-white px-4 rounded font-bold">حفظ</button>
                        </div>
                        <p className="text-xs text-muted mt-1">سيظهر الرابط عند الضغط على "احصل على كود"</p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm text-muted mb-2 flex items-center gap-2"><Clock size={16}/> تنسيق الوقت</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-main cursor-pointer bg-space-900 px-4 py-2 rounded border border-space-700 hover:border-space-accent transition-colors">
                                <input type="radio" name="timeFormat" value="12" checked={timeFormat === '12'} onChange={() => handleSettingChange(() => {setTimeFormat('12'); showToast('تم تغيير التنسيق');})} className="accent-space-accent"/>
                                12 ساعة (مساءً/صباحاً)
                            </label>
                            <label className="flex items-center gap-2 text-main cursor-pointer bg-space-900 px-4 py-2 rounded border border-space-700 hover:border-space-accent transition-colors">
                                <input type="radio" name="timeFormat" value="24" checked={timeFormat === '24'} onChange={() => handleSettingChange(() => {setTimeFormat('24'); showToast('تم تغيير التنسيق');})} className="accent-space-accent"/>
                                24 ساعة
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Message section ... */}
            <div className="bg-space-800 p-6 rounded-xl border border-space-700 shadow-lg space-y-4">
                <h3 className="text-xl font-bold text-space-accent flex items-center gap-2"><MessageSquare size={24}/> رسالة النظام</h3>
                <p className="text-sm text-muted">ستظهر هذه الرسالة للطلاب عند تسجيل الدخول.</p>
                
                <textarea 
                    value={msgContent}
                    onChange={e => setMsgContent(e.target.value)}
                    className="w-full h-32 bg-space-900 border border-space-700 rounded p-3 text-main outline-none focus:border-space-accent resize-none"
                    placeholder="اكتب رسالتك هنا..."
                />
                
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-main cursor-pointer p-2 bg-space-900 rounded border border-space-700 hover:border-space-accent transition-colors">
                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-space-accent w-5 h-5"/>
                        تفعيل الرسالة
                    </label>
                </div>

                <button onClick={handleSaveMsg} className="bg-space-accent text-space-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors">حفظ إعدادات الرسالة</button>
            </div>
        </div>
    );
};
