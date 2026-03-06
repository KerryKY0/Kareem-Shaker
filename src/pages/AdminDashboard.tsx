
import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { UserRole, FileType, Permission, User, EducationalFile, Section, Subject, VerificationCode } from '../types';
import { Users, FileText, FileVideo, FileAudio, Activity, Trash2, Shield, Eye, Plus, Edit, Upload, UserCog, Lock, Wand2, Settings as SettingsIcon, MessageSquare, Sun, Moon, Download, X, Bell, Send, Database, FileSpreadsheet, AlertTriangle, FileWarning, ZoomIn, ZoomOut, Layers, RefreshCw, CheckSquare, Filter, Copy, Info, Calendar, User as UserIcon, Key, Image as ImageIcon, Save, Phone, Hash, Type, Power, Search, CheckCircle, XCircle, Ban, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- Shared Components ---

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-space-800 p-6 rounded-xl border border-space-700 flex items-center justify-between shadow-lg">
        <div>
            <p className="text-muted text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-main">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-space-900 ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

const TabButton = ({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon?: any }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${active ? 'bg-space-accent text-space-900 shadow-lg shadow-space-accent/20 scale-105' : 'bg-space-800 text-muted hover:bg-space-700 border border-space-700 hover:text-white'}`}
    >
        {Icon && <Icon size={16} />}
        {label}
    </button>
);

// --- Admin Dashboard (Home) ---

export const AdminDashboard: React.FC = () => {
  const { users, files, logs } = useStore();

  const totalStudents = users.filter(u => u.role === UserRole.STUDENT).length;
  const activeToday = users.filter(u => {
     if (!u.lastLogin) return false;
     const today = new Date().toDateString();
     return new Date(u.lastLogin).toDateString() === today;
  }).length;
  const neverLoggedIn = users.filter(u => !u.lastLogin && u.role === UserRole.STUDENT).length;

  const viewsData = files.map(f => ({ name: f.title.substring(0, 15) + '...', views: f.views })).sort((a,b) => b.views - a.views).slice(0, 5);

  const getLogColor = (log: any) => {
      if (log.userName === 'النظام' || log.userId === 'system' || log.userId === 'sys') return 'text-purple-400';
      const user = users.find(u => u.id === log.userId);
      if (!user) return 'text-main';
      if (user.role === UserRole.ADMIN) return 'text-red-500';
      if (user.role === UserRole.SUB_ADMIN) return 'text-yellow-400';
      if (user.role === UserRole.STUDENT) return 'text-green-400';
      return 'text-main';
  };

  return (
    <div className="space-y-8 text-main animate-fade-in">
       <h1 className="text-3xl font-bold">لوحة المعلومات</h1>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="إجمالي الطلاب" value={totalStudents} icon={Users} color="text-blue-400" />
          <StatCard title="المتصلين اليوم" value={activeToday} icon={Activity} color="text-green-400" />
          <StatCard title="لم يسجلوا دخول" value={neverLoggedIn} icon={Eye} color="text-red-400" />
          <StatCard title="عدد الملفات" value={files.length} icon={FileText} color="text-space-accent" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-space-800 p-6 rounded-xl border border-space-700 shadow-xl">
               <h3 className="text-xl font-bold mb-6 text-main">أكثر الملفات مشاهدة</h3>
               <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={viewsData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                           <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tick={{fill: '#94a3b8'}} />
                           <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
                           <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                           <Bar dataKey="views" fill="#FDB813" radius={[4, 4, 0, 0]} />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </div>

           <div className="bg-space-800 p-6 rounded-xl border border-space-700 shadow-xl flex flex-col h-[400px]">
               <h3 className="text-xl font-bold mb-4 text-main shrink-0">سجل النشاطات الأخير</h3>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                   {logs.slice(0, 50).map(log => (
                       <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm p-3 rounded-lg hover:bg-space-700/50 border border-space-700/30 transition-colors">
                           <div className="mb-1 sm:mb-0">
                               <span className={`font-bold ml-2 ${getLogColor(log)}`}>{log.userName}:</span>
                               <span className="text-slate-300">{log.action}</span>
                           </div>
                           <span className="text-muted text-xs dir-ltr font-mono bg-space-900 px-2 py-0.5 rounded">
                               {new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
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
    const { users, deleteUser, updateUser, sections, registerStudent, registerSubAdmin, currentUser, showToast } = useStore();
    const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '', phone: '', password: '', role: UserRole.STUDENT, sectionId: '', 
        permissions: { canUpload: false, canDelete: false, canAddStudent: false, canEditStudentPass: false, canViewStats: false, canAccessSettings: false, canManageSubAdmins: false }
    });

    const filteredUsers = users.filter(u => {
        const matchesRole = filterRole === 'ALL' || u.role === filterRole;
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search);
        return matchesRole && matchesSearch;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'ADD') {
                if (formData.role === UserRole.STUDENT) {
                    await registerStudent(formData.name, formData.phone, formData.password, formData.sectionId, '', true);
                } else if (formData.role === UserRole.SUB_ADMIN) {
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

    const resetForm = () => {
        setFormData({
            name: '', phone: '', password: '', role: UserRole.STUDENT, sectionId: '',
            permissions: { canUpload: false, canDelete: false, canAddStudent: false, canEditStudentPass: false, canViewStats: false, canAccessSettings: false, canManageSubAdmins: false }
        });
        setSelectedUser(null);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setModalMode('EDIT');
        setFormData({
            name: user.name,
            phone: user.phone,
            password: '', // Don't show current password
            role: user.role,
            sectionId: user.sectionId || '',
            permissions: user.permissions || { canUpload: false, canDelete: false, canAddStudent: false, canEditStudentPass: false, canViewStats: false, canAccessSettings: false, canManageSubAdmins: false }
        });
        setShowModal(true);
    };

    const toggleSuspend = (user: User) => {
        if (confirm(user.isSuspended ? 'هل تريد تفعيل هذا الحساب؟' : 'هل تريد تعطيل هذا الحساب؟')) {
            updateUser(user.id, { isSuspended: !user.isSuspended });
            showToast(user.isSuspended ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-main">إدارة المستخدمين</h1>
                <button onClick={() => { resetForm(); setModalMode('ADD'); setShowModal(true); }} className="bg-space-accent text-space-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2">
                    <Plus size={20} /> إضافة مستخدم
                </button>
            </div>

            <div className="bg-space-800 p-4 rounded-xl border border-space-700 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <TabButton active={filterRole === 'ALL'} onClick={() => setFilterRole('ALL')} label="الكل" />
                    <TabButton active={filterRole === UserRole.STUDENT} onClick={() => setFilterRole(UserRole.STUDENT)} label="الطلاب" />
                    <TabButton active={filterRole === UserRole.SUB_ADMIN} onClick={() => setFilterRole(UserRole.SUB_ADMIN)} label="المشرفين" />
                    <TabButton active={filterRole === UserRole.ADMIN} onClick={() => setFilterRole(UserRole.ADMIN)} label="المطورين" />
                </div>
                <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="بحث بالاسم أو الهاتف..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-space-900 border border-space-700 rounded-lg py-2 px-4 pl-10 text-main focus:border-space-accent outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 text-muted" size={18} />
                </div>
            </div>

            <div className="bg-space-800 rounded-xl border border-space-700 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-space-900 text-muted text-sm font-bold">
                            <tr>
                                <th className="p-4">الاسم</th>
                                <th className="p-4">رقم الهاتف</th>
                                <th className="p-4">الدور</th>
                                <th className="p-4">القسم/الصلاحيات</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-space-700 text-sm">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-space-700/30 transition-colors">
                                    <td className="p-4 font-bold text-main flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-space-700 flex items-center justify-center text-space-accent font-bold text-xs border border-space-600">
                                            {user.name.charAt(0)}
                                        </div>
                                        {user.name}
                                    </td>
                                    <td className="p-4 text-muted dir-ltr text-right">{user.phone}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === UserRole.ADMIN ? 'bg-red-500/20 text-red-400' : user.role === UserRole.SUB_ADMIN ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {user.role === UserRole.ADMIN ? 'مطور رئيسي' : user.role === UserRole.SUB_ADMIN ? 'مطور فرعي' : 'طالب'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-muted">
                                        {user.role === UserRole.STUDENT 
                                            ? sections.find(s => s.id === user.sectionId)?.title || '-' 
                                            : user.role === UserRole.SUB_ADMIN 
                                                ? <span title="صلاحيات محددة" className="cursor-help flex items-center gap-1"><Shield size={14}/> {Object.values(user.permissions || {}).filter(Boolean).length} صلاحيات</span>
                                                : 'كامل الصلاحيات'
                                        }
                                    </td>
                                    <td className="p-4">
                                        {user.isSuspended ? (
                                            <span className="text-red-400 flex items-center gap-1"><Ban size={14} /> معطل</span>
                                        ) : (
                                            <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14} /> نشط</span>
                                        )}
                                    </td>
                                    <td className="p-4 flex items-center justify-center gap-2">
                                        {user.role !== UserRole.ADMIN && (
                                            <>
                                                <button onClick={() => handleEdit(user)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded" title="تعديل">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => toggleSuspend(user)} className={`p-2 rounded ${user.isSuspended ? 'text-green-400 hover:bg-green-400/10' : 'text-orange-400 hover:bg-orange-400/10'}`} title={user.isSuspended ? "تفعيل" : "تعطيل"}>
                                                    {user.isSuspended ? <CheckCircle size={16} /> : <Ban size={16} />}
                                                </button>
                                                <button onClick={() => { if(confirm('حذف نهائي؟')) { deleteUser(user.id); showToast('تم الحذف'); } }} className="p-2 text-red-400 hover:bg-red-400/10 rounded" title="حذف">
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && <div className="p-8 text-center text-muted">لا توجد نتائج مطابقة</div>}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-space-800 rounded-2xl border border-space-700 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-space-700 flex justify-between items-center sticky top-0 bg-space-800 z-10">
                            <h2 className="text-xl font-bold text-main">{modalMode === 'ADD' ? 'إضافة مستخدم جديد' : 'تعديل بيانات المستخدم'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-muted hover:text-white"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {modalMode === 'ADD' && (
                                <div className="flex gap-2 mb-4 bg-space-900 p-1 rounded-lg">
                                    <button type="button" onClick={() => setFormData({...formData, role: UserRole.STUDENT})} className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${formData.role === UserRole.STUDENT ? 'bg-space-700 text-white' : 'text-muted'}`}>طالب</button>
                                    <button type="button" onClick={() => setFormData({...formData, role: UserRole.SUB_ADMIN})} className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${formData.role === UserRole.SUB_ADMIN ? 'bg-space-700 text-white' : 'text-muted'}`}>مشرف</button>
                                </div>
                            )}

                            <div>
                                <label className="text-sm text-muted block mb-1">الاسم</label>
                                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none" />
                            </div>
                            <div>
                                <label className="text-sm text-muted block mb-1">رقم الهاتف/اسم المستخدم</label>
                                <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none dir-ltr text-right" />
                            </div>
                            <div>
                                <label className="text-sm text-muted block mb-1">{modalMode === 'EDIT' ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور'}</label>
                                <input type="text" required={modalMode === 'ADD'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none" />
                            </div>

                            {formData.role === UserRole.STUDENT && (
                                <div>
                                    <label className="text-sm text-muted block mb-1">القسم الدراسي</label>
                                    <select required value={formData.sectionId} onChange={e => setFormData({...formData, sectionId: e.target.value})} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none">
                                        <option value="">اختر القسم</option>
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
                                                {key === 'canUpload' && 'رفع الملفات'}
                                                {key === 'canDelete' && 'حذف المحتوى'}
                                                {key === 'canAddStudent' && 'إضافة طلاب'}
                                                {key === 'canEditStudentPass' && 'تعديل الطلاب'}
                                                {key === 'canViewStats' && 'عرض الإحصائيات'}
                                                {key === 'canAccessSettings' && 'الوصول للإعدادات'}
                                                {key === 'canManageSubAdmins' && 'إدارة المشرفين'}
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
    const { sections, subjects, files, addSection, updateSection, deleteSection, addSubject, updateSubject, deleteSubject, addFile, updateFile, deleteFile, showToast } = useStore();
    const [activeTab, setActiveTab] = useState<'SECTIONS' | 'SUBJECTS' | 'FILES'>('SECTIONS');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [filterSubject, setFilterSubject] = useState('');

    // Shared Form State
    const [title, setTitle] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [fileType, setFileType] = useState<FileType>(FileType.PDF);
    const [contentUrl, setContentUrl] = useState('');
    const [preventDownload, setPreventDownload] = useState(false);

    const resetForm = () => {
        setTitle('');
        setSectionId(sections[0]?.id || '');
        setSubjectId(subjects[0]?.id || '');
        setFileType(FileType.PDF);
        setContentUrl('');
        setPreventDownload(false);
        setEditingItem(null);
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
            // Section only has title
        } else if (activeTab === 'SUBJECTS') {
            setSectionId(item.sectionId);
        } else if (activeTab === 'FILES') {
            setSubjectId(item.subjectId);
            setFileType(item.type);
            setContentUrl(item.contentUrl);
            setPreventDownload(item.preventDownload);
        }
        setShowModal(true);
    };

    const handleDelete = (id: string) => {
        if (!confirm('هل أنت متأكد من الحذف؟ سيتم حذف جميع البيانات المرتبطة.')) return;
        if (activeTab === 'SECTIONS') deleteSection(id);
        if (activeTab === 'SUBJECTS') deleteSubject(id);
        if (activeTab === 'FILES') deleteFile(id);
        showToast('تم الحذف بنجاح');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === 'SECTIONS') {
            if (editingItem) updateSection(editingItem.id, title);
            else addSection(title);
        } else if (activeTab === 'SUBJECTS') {
            if (editingItem) updateSubject(editingItem.id, title); // Note: Section change not implemented in updateSubject for simplicity or strictness
            else addSubject(title, sectionId);
        } else if (activeTab === 'FILES') {
            if (editingItem) updateFile(editingItem.id, { title, type: fileType, contentUrl, preventDownload, subjectId });
            else addFile({
                id: Math.random().toString(36).substr(2, 9),
                title, type: fileType, contentUrl, subjectId, preventDownload,
                createdAt: new Date().toISOString(), views: 0, comments: []
            });
        }
        setShowModal(false);
        showToast(editingItem ? 'تم التعديل' : 'تمت الإضافة');
    };

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-main">إدارة المحتوى</h1>
                <button onClick={openAddModal} className="bg-space-accent text-space-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2">
                    <Plus size={20} /> إضافة جديد
                </button>
            </div>

            <div className="flex gap-2 bg-space-800 p-2 rounded-xl border border-space-700 w-fit">
                <TabButton active={activeTab === 'SECTIONS'} onClick={() => setActiveTab('SECTIONS')} label="الأقسام" icon={Layers} />
                <TabButton active={activeTab === 'SUBJECTS'} onClick={() => setActiveTab('SUBJECTS')} label="المواد" icon={Database} />
                <TabButton active={activeTab === 'FILES'} onClick={() => setActiveTab('FILES')} label="الملفات" icon={FileText} />
            </div>

            <div className="bg-space-800 rounded-xl border border-space-700 overflow-hidden shadow-lg min-h-[400px]">
                {/* Sections List */}
                {activeTab === 'SECTIONS' && (
                    <div className="divide-y divide-space-700">
                        {sections.map(s => (
                            <div key={s.id} className="p-4 flex items-center justify-between hover:bg-space-700/30">
                                <div className="flex items-center gap-3">
                                    <Layers className="text-space-accent" />
                                    <span className="font-bold text-main">{s.title}</span>
                                    <span className="text-xs text-muted bg-space-900 px-2 py-1 rounded">
                                        {subjects.filter(sub => sub.sectionId === s.id).length} مواد
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(s)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Subjects List */}
                {activeTab === 'SUBJECTS' && (
                    <div className="divide-y divide-space-700">
                        {subjects.map(s => (
                            <div key={s.id} className="p-4 flex items-center justify-between hover:bg-space-700/30">
                                <div>
                                    <h4 className="font-bold text-main mb-1">{s.title}</h4>
                                    <span className="text-xs text-muted flex items-center gap-1">
                                        <Layers size={12} /> {sections.find(sec => sec.id === s.sectionId)?.title}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(s)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Files List */}
                {activeTab === 'FILES' && (
                    <>
                        <div className="p-4 border-b border-space-700 bg-space-800/50">
                             <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="bg-space-900 border border-space-700 text-main rounded px-3 py-1 text-sm outline-none w-full md:w-auto">
                                 <option value="">كل المواد</option>
                                 {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                             </select>
                        </div>
                        <div className="divide-y divide-space-700">
                            {files.filter(f => !filterSubject || f.subjectId === filterSubject).map(f => (
                                <div key={f.id} className="p-4 flex items-center justify-between hover:bg-space-700/30">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-space-900 rounded text-space-accent">
                                            {f.type === FileType.PDF ? <FileText size={20}/> : f.type === FileType.VIDEO ? <FileVideo size={20}/> : f.type === FileType.AUDIO ? <FileAudio size={20}/> : f.type === FileType.IMAGE ? <ImageIcon size={20}/> : <Type size={20}/>}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-main text-sm md:text-base">{f.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted mt-1">
                                                <span>{subjects.find(s => s.id === f.subjectId)?.title}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Eye size={10}/> {f.views}</span>
                                                {f.preventDownload && <span className="text-red-400 flex items-center gap-0.5"><Lock size={10}/> محمي</span>}
                                                {f.isSuspended && <span className="text-orange-400 flex items-center gap-0.5"><Ban size={10}/> معطل</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateFile(f.id, { isSuspended: !f.isSuspended })} className={`p-2 rounded ${f.isSuspended ? 'text-green-400 hover:bg-green-400/10' : 'text-orange-400 hover:bg-orange-400/10'}`} title={f.isSuspended ? "إظهار" : "إخفاء"}>
                                            {f.isSuspended ? <CheckCircle size={16} /> : <Ban size={16} />}
                                        </button>
                                        <button onClick={() => openEditModal(f)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(f.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                            {files.filter(f => !filterSubject || f.subjectId === filterSubject).length === 0 && <div className="p-8 text-center text-muted">لا توجد ملفات</div>}
                        </div>
                    </>
                )}
            </div>

            {/* Content Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-space-800 rounded-2xl border border-space-700 w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-space-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-main">{editingItem ? 'تعديل' : 'إضافة'} {activeTab === 'SECTIONS' ? 'قسم' : activeTab === 'SUBJECTS' ? 'مادة' : 'ملف'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-muted hover:text-white"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm text-muted block mb-1">العنوان</label>
                                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none" />
                            </div>

                            {activeTab === 'SUBJECTS' && (
                                <div>
                                    <label className="text-sm text-muted block mb-1">القسم التابع له</label>
                                    <select required value={sectionId} onChange={e => setSectionId(e.target.value)} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none">
                                        <option value="">اختر القسم</option>
                                        {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                    </select>
                                </div>
                            )}

                            {activeTab === 'FILES' && (
                                <>
                                    <div>
                                        <label className="text-sm text-muted block mb-1">المادة</label>
                                        <select required value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none">
                                            <option value="">اختر المادة</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted block mb-1">نوع الملف</label>
                                        <select value={fileType} onChange={e => setFileType(e.target.value as FileType)} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none">
                                            <option value={FileType.PDF}>PDF</option>
                                            <option value={FileType.VIDEO}>فيديو</option>
                                            <option value={FileType.AUDIO}>صوت</option>
                                            <option value={FileType.IMAGE}>صورة</option>
                                            <option value={FileType.TEXT}>نص</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted block mb-1">رابط المحتوى (URL)</label>
                                        <input required value={contentUrl} onChange={e => setContentUrl(e.target.value)} className="w-full bg-space-900 border border-space-700 rounded p-2 text-main focus:border-space-accent outline-none dir-ltr" placeholder="https://..." />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="prevDl" checked={preventDownload} onChange={e => setPreventDownload(e.target.checked)} className="accent-space-accent" />
                                        <label htmlFor="prevDl" className="text-sm text-muted cursor-pointer">منع التحميل</label>
                                    </div>
                                </>
                            )}
                            
                            <button type="submit" className="w-full bg-space-accent text-space-900 font-bold py-3 rounded-lg hover:bg-yellow-400 mt-4">حفظ</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Admin Codes ---

export const AdminCodes: React.FC = () => {
    const { verificationCodes, generateVerificationCodes, deleteVerificationCode, deleteAllVerificationCodes, deleteUnusedVerificationCodes, deleteUsedVerificationCodes, showToast } = useStore();
    const [numToGen, setNumToGen] = useState(50);
    const [filter, setFilter] = useState<'ALL'|'USED'|'UNUSED'>('ALL');

    const filteredCodes = verificationCodes.filter(c => {
        if (filter === 'USED') return c.isUsed;
        if (filter === 'UNUSED') return !c.isUsed;
        return true;
    });

    const handleGenerate = () => {
        generateVerificationCodes(numToGen);
        showToast(`تم توليد ${numToGen} كود`);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-main">أكواد التحقق</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-space-800 p-6 rounded-xl border border-space-700 shadow-lg">
                    <h3 className="font-bold text-lg mb-4 text-main flex items-center gap-2"><Plus size={20} className="text-green-400"/> توليد أكواد جديدة</h3>
                    <div className="flex gap-2">
                        <input type="number" value={numToGen} onChange={e => setNumToGen(parseInt(e.target.value)||0)} className="bg-space-900 border border-space-700 rounded p-2 text-main w-24 text-center" min="1" max="500" />
                        <button onClick={handleGenerate} className="flex-1 bg-green-600 text-white font-bold rounded hover:bg-green-500 transition-colors">توليد الآن</button>
                    </div>
                </div>

                <div className="bg-space-800 p-6 rounded-xl border border-space-700 shadow-lg">
                    <h3 className="font-bold text-lg mb-4 text-main flex items-center gap-2"><Trash2 size={20} className="text-red-400"/> تنظيف البيانات</h3>
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={deleteUnusedVerificationCodes} className="flex-1 bg-space-700 text-white p-2 rounded hover:bg-red-500/50 text-xs">حذف غير المستخدم</button>
                        <button onClick={deleteUsedVerificationCodes} className="flex-1 bg-space-700 text-white p-2 rounded hover:bg-red-500/50 text-xs">حذف المستخدم</button>
                        <button onClick={() => { if(confirm('حذف الكل؟')) deleteAllVerificationCodes(); }} className="flex-1 bg-red-500/20 text-red-400 p-2 rounded hover:bg-red-500 hover:text-white text-xs border border-red-500/50">حذف الكل</button>
                    </div>
                </div>
            </div>

            <div className="bg-space-800 rounded-xl border border-space-700 shadow-lg overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 border-b border-space-700 flex justify-between items-center bg-space-800">
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-muted">الإجمالي: {verificationCodes.length}</div>
                        <div className="h-4 w-px bg-space-700 mx-2"></div>
                        <TabButton active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="الكل" />
                        <TabButton active={filter === 'UNUSED'} onClick={() => setFilter('UNUSED')} label="متاح" />
                        <TabButton active={filter === 'USED'} onClick={() => setFilter('USED')} label="مستخدم" />
                    </div>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-space-900 text-muted sticky top-0">
                            <tr>
                                <th className="p-3">الكود</th>
                                <th className="p-3">الحالة</th>
                                <th className="p-3">تاريخ الإنشاء</th>
                                <th className="p-3">استخدم بواسطة</th>
                                <th className="p-3">تاريخ الاستخدام</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-space-700">
                            {filteredCodes.map(c => (
                                <tr key={c.id} className="hover:bg-space-700/30">
                                    <td className="p-3 font-mono font-bold text-lg text-space-accent tracking-widest">{c.code}</td>
                                    <td className="p-3">
                                        {c.isUsed ? <span className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded">مستخدم</span> : <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded">متاح</span>}
                                    </td>
                                    <td className="p-3 text-muted text-xs dir-ltr">{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td className="p-3 text-muted text-xs">{c.usedBy || '-'}</td>
                                    <td className="p-3 text-muted text-xs dir-ltr">{c.usedAt ? new Date(c.usedAt).toLocaleString() : '-'}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => deleteVerificationCode(c.id)} className="text-red-400 hover:bg-red-400/10 p-1.5 rounded"><Trash2 size={14}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCodes.length === 0 && <div className="p-10 text-center text-muted">لا توجد أكواد</div>}
                </div>
            </div>
        </div>
    );
};

// --- Admin Settings ---

export const AdminSettings: React.FC = () => {
    const { globalPasswordLength, setGlobalPasswordLength, phoneNumberLength, setPhoneNumberLength, systemMessage, updateSystemMessage, forceFullDataUpdateAll, showToast } = useStore();
    const [msgContent, setMsgContent] = useState(systemMessage.content);
    const [isActive, setIsActive] = useState(systemMessage.isActive);
    const [showAtLogin, setShowAtLogin] = useState(systemMessage.showAtLogin);

    const handleSaveMsg = () => {
        updateSystemMessage({ content: msgContent, isActive, showAtLogin });
        showToast('تم تحديث رسالة النظام');
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-main">إعدادات النظام</h1>

            <div className="bg-space-800 p-6 rounded-xl border border-space-700 shadow-lg space-y-6">
                <h3 className="text-xl font-bold text-space-accent flex items-center gap-2"><SettingsIcon size={24}/> التكوين العام</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-muted mb-2">طول كلمة المرور (للتوليد التلقائي)</label>
                        <select 
                            value={globalPasswordLength}
                            onChange={(e) => { setGlobalPasswordLength(parseInt(e.target.value)); showToast('تم الحفظ'); }}
                            className="w-full bg-space-900 border border-space-700 rounded p-3 text-main outline-none focus:border-space-accent"
                        >
                            {[4, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n} خانات</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-muted mb-2">طول رقم الهاتف (للتحقق)</label>
                        <input 
                            type="number"
                            value={phoneNumberLength || ''}
                            onChange={(e) => setPhoneNumberLength(parseInt(e.target.value))}
                            onBlur={() => showToast('تم الحفظ')}
                            className="w-full bg-space-900 border border-space-700 rounded p-3 text-main outline-none focus:border-space-accent"
                            placeholder="مثلا: 11"
                        />
                        <p className="text-xs text-muted mt-1">اتركه فارغاً لتعطيل التحقق من الطول.</p>
                    </div>
                </div>
            </div>

            <div className="bg-space-800 p-6 rounded-xl border border-space-700 shadow-lg space-y-4">
                <h3 className="text-xl font-bold text-space-accent flex items-center gap-2"><MessageSquare size={24}/> رسالة النظام</h3>
                <p className="text-sm text-muted">ستظهر هذه الرسالة للطلاب عند تسجيل الدخول أو في لوحة التحكم.</p>
                
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
                    <label className="flex items-center gap-2 text-main cursor-pointer p-2 bg-space-900 rounded border border-space-700 hover:border-space-accent transition-colors">
                        <input type="checkbox" checked={showAtLogin} onChange={e => setShowAtLogin(e.target.checked)} className="accent-space-accent w-5 h-5"/>
                        إظهار نافذة منبثقة عند الدخول
                    </label>
                </div>

                <button onClick={handleSaveMsg} className="bg-space-accent text-space-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors">حفظ إعدادات الرسالة</button>
            </div>

            <div className="bg-red-500/5 p-6 rounded-xl border border-red-500/30 shadow-lg space-y-4">
                <h3 className="text-xl font-bold text-red-500 flex items-center gap-2"><AlertTriangle size={24}/> منطقة الخطر</h3>
                
                <div className="flex items-center justify-between bg-space-900 p-4 rounded-lg border border-red-500/20">
                    <div>
                        <h4 className="font-bold text-main">طلب تحديث بيانات إجباري</h4>
                        <p className="text-xs text-muted">سيتم إجبار جميع الطلاب على تحديث بياناتهم (الاسم، الهاتف، القسم) عند تسجيل الدخول القادم.</p>
                    </div>
                    <button onClick={() => { if(confirm('هل أنت متأكد؟')) { forceFullDataUpdateAll(); showToast('تم تنفيذ الأمر'); } }} className="bg-red-500 text-white px-4 py-2 rounded font-bold hover:bg-red-600">
                        تفعيل الآن
                    </button>
                </div>
            </div>
        </div>
    );
};
