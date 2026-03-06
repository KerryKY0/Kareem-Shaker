
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useStore } from './services/store';
import { UserRole } from './types';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import { Login, Register, DeveloperLogin } from './pages/Auth';
import { StudentDashboard, SubjectFiles } from './pages/StudentDashboard';
import FileViewer from './pages/FileViewer';
import { AdminDashboard, AdminUsers, AdminSettings, AdminCodes } from './pages/AdminDashboard';
import { AdminContent } from './pages/AdminContent';
import ActivityLog from './pages/ActivityLog';
import { Settings, User as UserIcon, Lock, Camera, Edit2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const Toast: React.FC = () => {
    const { toastMessage } = useStore();
    
    if (!toastMessage) return null;

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-up">
            <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
                <CheckCircle2 size={20} />
                <span className="font-bold">{toastMessage}</span>
            </div>
        </div>
    );
};

const PermissionDeniedPopup: React.FC = () => {
    const { permissionError } = useStore();

    if (!permissionError) return null;

    return (
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-[100] animate-bounce-short">
            <div className="bg-space-900 text-white px-5 py-2 rounded-full shadow-2xl flex items-center gap-3 border border-red-500/50">
                <XCircle size={18} className="text-red-500" />
                <span className="text-sm font-bold">ليس لديك صلاحية بذلك</span>
            </div>
        </div>
    );
};

const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { currentUser } = useStore();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const UserProfile = () => {
    const { currentUser, changePassword, updateUser, sections, showToast } = useStore();
    const [tab, setTab] = useState<'INFO' | 'SECURITY'>('INFO');
    const [newPass, setNewPass] = useState('');
    
    // Editable Fields
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.phone || '',
        gender: currentUser?.gender || '',
        birthDate: currentUser?.birthDate || '',
        sectionId: currentUser?.sectionId || ''
    });
    const [verificationCode, setVerificationCode] = useState('');
    
    // Determine if phone is changed to require code
    const isPhoneChanged = editData.phone !== currentUser?.phone;

    const handleChangePass = () => {
        if(newPass) {
            changePassword(newPass);
            setNewPass('');
            showToast('تم تغيير كلمة المرور بنجاح');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && currentUser) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateUser(currentUser.id, { avatarUrl: base64String });
                showToast('تم تحديث الصورة الشخصية');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        if (!currentUser) return;
        
        try {
            if (isPhoneChanged && verificationCode.length !== 4) {
                alert('يجب إدخال كود التحقق لتغيير رقم الهاتف');
                return;
            }

            updateUser(currentUser.id, {
                name: editData.name,
                phone: editData.phone,
                gender: editData.gender as 'MALE' | 'FEMALE' | undefined,
                birthDate: editData.birthDate,
                sectionId: editData.sectionId
            }, isPhoneChanged ? verificationCode : undefined);

            setIsEditing(false);
            setVerificationCode('');
            showToast('تم حفظ التعديلات');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const toggleEdit = () => {
        if (isEditing) {
            // Cancel edits
            setEditData({
                name: currentUser?.name || '',
                phone: currentUser?.phone || '',
                gender: currentUser?.gender || '',
                birthDate: currentUser?.birthDate || '',
                sectionId: currentUser?.sectionId || ''
            });
            setVerificationCode('');
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex bg-space-800 rounded-lg p-1 mb-6 border border-space-700">
                <button 
                    onClick={() => setTab('INFO')} 
                    className={`flex-1 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${tab === 'INFO' ? 'bg-space-700 text-white font-bold' : 'text-slate-400'}`}
                >
                    <UserIcon size={18} /> بياناتي
                </button>
                <button 
                    onClick={() => setTab('SECURITY')} 
                    className={`flex-1 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${tab === 'SECURITY' ? 'bg-space-700 text-white font-bold' : 'text-slate-400'}`}
                >
                    <Lock size={18} /> كلمة المرور
                </button>
            </div>

            <div className="bg-space-800 p-8 rounded-2xl border border-space-700 relative">
                {tab === 'INFO' ? (
                    <div className="space-y-6 animate-fade-in">
                        <div className="absolute top-8 left-8">
                             <button onClick={toggleEdit} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${isEditing ? 'bg-red-500/10 text-red-400' : 'bg-space-accent text-space-900'}`}>
                                 {isEditing ? 'إلغاء' : <><Edit2 size={16} /> تعديل</>}
                             </button>
                        </div>

                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative group cursor-pointer">
                                {currentUser?.avatarUrl ? (
                                    <img src={currentUser.avatarUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-space-700" />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-space-900 flex items-center justify-center border-4 border-space-700 text-space-accent">
                                        <UserIcon size={40} />
                                    </div>
                                )}
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={32} className="text-white" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>
                            <span className="text-xs text-muted mt-2">اضغط لتغيير الصورة</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-space-900 p-4 rounded-lg">
                                <label className="text-xs text-slate-500 block mb-1">الاسم</label>
                                {isEditing ? (
                                    <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-space-800 border border-space-700 rounded p-2 text-main" />
                                ) : (
                                    <div className="font-bold text-main">{currentUser?.name}</div>
                                )}
                            </div>
                            
                            <div className="bg-space-900 p-4 rounded-lg">
                                <label className="text-xs text-slate-500 block mb-1">
                                    {currentUser?.role === UserRole.STUDENT ? 'رقم الهاتف' : 'اسم المستخدم/الهاتف'}
                                </label>
                                {isEditing ? (
                                    <input value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full bg-space-800 border border-space-700 rounded p-2 text-main dir-ltr text-right" />
                                ) : (
                                    <div className="font-bold dir-ltr text-right text-main">{currentUser?.phone}</div>
                                )}
                            </div>

                            <div className="bg-space-900 p-4 rounded-lg">
                                <label className="text-xs text-slate-500 block mb-1">الجنس</label>
                                {isEditing ? (
                                    <select value={editData.gender} onChange={e => setEditData({...editData, gender: e.target.value})} className="w-full bg-space-800 border border-space-700 rounded p-2 text-main">
                                        <option value="">غير محدد</option>
                                        <option value="MALE">ذكر</option>
                                        <option value="FEMALE">أنثى</option>
                                    </select>
                                ) : (
                                    <div className="font-bold text-main">{currentUser?.gender === 'MALE' ? 'ذكر' : currentUser?.gender === 'FEMALE' ? 'أنثى' : 'غير محدد'}</div>
                                )}
                            </div>

                            <div className="bg-space-900 p-4 rounded-lg">
                                <label className="text-xs text-slate-500 block mb-1">تاريخ الميلاد</label>
                                {isEditing ? (
                                    <input type="date" value={editData.birthDate} onChange={e => setEditData({...editData, birthDate: e.target.value})} className="w-full bg-space-800 border border-space-700 rounded p-2 text-main" />
                                ) : (
                                    <div className="font-bold text-main">{currentUser?.birthDate || 'غير محدد'}</div>
                                )}
                            </div>
                            
                            {currentUser?.role === UserRole.STUDENT && (
                                <div className="bg-space-900 p-4 rounded-lg md:col-span-2">
                                    <label className="text-xs text-slate-500 block mb-1">القسم الدراسي</label>
                                    {isEditing ? (
                                        <select value={editData.sectionId} onChange={e => setEditData({...editData, sectionId: e.target.value})} className="w-full bg-space-800 border border-space-700 rounded p-2 text-main">
                                            <option value="">اختر القسم</option>
                                            {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                        </select>
                                    ) : (
                                        <div className="font-bold text-main">{sections.find(s => s.id === currentUser?.sectionId)?.title || 'غير محدد'}</div>
                                    )}
                                </div>
                            )}

                            <div className="bg-space-900 p-4 rounded-lg">
                                <label className="text-xs text-slate-500 block mb-1">تاريخ الانضمام</label>
                                <div className="font-bold text-main">{new Date(currentUser?.createdAt || '').toLocaleDateString('ar-EG')}</div>
                            </div>
                        </div>

                        {/* Verification Code Input when Phone Changes */}
                        {isEditing && isPhoneChanged && (
                            <div className="bg-space-900 p-4 rounded-lg border border-yellow-500/50 animate-fade-in-up">
                                <label className="text-xs text-yellow-500 block mb-2 font-bold">مطلوب كود تحقق لتغيير رقم الهاتف</label>
                                <input 
                                    type="text" 
                                    value={verificationCode} 
                                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                                    className="w-full bg-space-800 border border-space-700 rounded p-2 text-main text-center font-bold tracking-widest" 
                                    placeholder="****"
                                    maxLength={4}
                                />
                                <p className="text-[10px] text-muted mt-1">يجب الحصول على كود جديد من الإدارة</p>
                            </div>
                        )}

                        {isEditing && (
                            <button onClick={handleSaveChanges} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-500 transition-colors">
                                حفظ التغييرات
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="font-bold text-lg mb-4 text-main">تغيير كلمة المرور</h3>
                        <div className="bg-space-900 p-4 rounded-lg border border-space-700">
                            <label className="text-sm text-slate-400 block mb-2">كلمة المرور الجديدة</label>
                            <input 
                                type="text" 
                                value={newPass} 
                                onChange={e => setNewPass(e.target.value)} 
                                className="w-full bg-space-800 border border-space-700 rounded p-3 text-main dir-ltr text-right"
                                placeholder="أدخل كلمة المرور الجديدة"
                            />
                        </div>
                        <button 
                            onClick={handleChangePass}
                            disabled={!newPass}
                            className="w-full bg-space-accent text-space-900 font-bold py-3 rounded-lg hover:bg-yellow-400 disabled:opacity-50"
                        >
                            حفظ التغيير
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/developer-login" element={<DeveloperLogin />} />
      <Route path="/register" element={<Register />} />
      
      {/* Student Routes */}
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
          <Layout>
            <Routes>
                <Route path="" element={<StudentDashboard />} />
                <Route path="subject/:id" element={<SubjectFiles />} />
                <Route path="file/:id" element={<FileViewer />} />
                <Route path="profile" element={<UserProfile />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin/Sub-Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUB_ADMIN]}>
          <Layout>
             <Routes>
                 <Route path="dashboard" element={<AdminDashboard />} />
                 <Route path="users" element={<AdminUsers />} />
                 <Route path="content" element={<AdminContent />} />
                 <Route path="file/:id" element={<FileViewer />} />
                 <Route path="codes" element={<AdminCodes />} />
                 <Route path="settings" element={<AdminSettings />} />
                 <Route path="activity" element={<ActivityLog />} />
                 <Route path="profile" element={<UserProfile />} />
             </Routes>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
        <Toast />
        <PermissionDeniedPopup />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
