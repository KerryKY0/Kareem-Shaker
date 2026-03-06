
import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { UserRole } from '../types';
import { HashRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { LogOut, Home, Users, FileText, BarChart, Settings, Menu, X, Rocket, ZoomIn, ZoomOut, Eye, Save, AlertTriangle, Sun, Moon, Key, ChevronLeft, ChevronRight, User, Lock, Phone, Wand2 } from 'lucide-react';
import GlobalChat from './GlobalChat';

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarItem = ({ to, icon: Icon, label, active, collapsed, onClick }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${active ? 'bg-space-700 text-space-accent shadow-md shadow-space-accent/5' : 'text-muted hover:bg-space-800 hover:text-main'} ${collapsed ? 'justify-center px-0' : ''}`}
    title={collapsed ? label : ''}
  >
    <Icon size={18} className="shrink-0" />
    {!collapsed && <span className="font-medium whitespace-nowrap overflow-hidden transition-all duration-300 text-sm">{label}</span>}
  </Link>
);

const CompleteProfileForm: React.FC = () => {
    const { completeUserProfile, currentUser, phoneNumberLength, sections, codeGetUrl, globalPasswordLength, passwordPrefix, enablePrefixInAuto, generateAlphanumericPasswords } = useStore();
    const [name, setName] = useState(currentUser?.name || '');
    const [phone, setPhone] = useState(currentUser?.phone === '0' ? '' : currentUser?.phone || '');
    const [sectionId, setSectionId] = useState(currentUser?.sectionId || '');
    // Pre-fill with current password
    const [password, setPassword] = useState(currentUser?.password || '');
    const [verificationCode, setVerificationCode] = useState('');
    
    const [error, setError] = useState('');
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // 1. Name Validation (Letters only, Triple Name)
        if (!/^[\p{L}\s]+$/u.test(name)) {
            setError('الاسم يجب أن يحتوي على أحرف وليس (رموز، علامات، ارقام)');
            return;
        }

        const nameParts = name.trim().split(/\s+/);
        if (nameParts.length < 3) {
            setError('يجب كتابة الاسم الثلاثي كاملاً (3 كلمات على الأقل)');
            return;
        }

        // 2. Phone Validation (Numbers only, Length)
        if (!/^\d+$/.test(phone)) {
            setError('رقم الهاتف يجب أن يحتوي على أرقام فقط');
            return;
        }

        if (phoneNumberLength && phone.length !== phoneNumberLength) {
             setError(`رقم الهاتف يجب أن يتكون من ${phoneNumberLength} خانة`);
             return;
        }

        // 3. Section Validation
        if (!sectionId) {
             setError('يجب اختيار القسم');
             return;
        }

        // 4. Password Validation
        if (!password || password.length !== globalPasswordLength) {
            setError(`كلمة المرور يجب أن تتكون من ${globalPasswordLength} خانة`);
            return;
        }

        // If all good, show verification code modal
        setShowCodeModal(true);
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove existing spaces to get raw value
        const rawValue = e.target.value.replace(/\s/g, '');
        setVerificationCode(rawValue);
    };

    const handleFinalSubmit = async () => {
        if (!verificationCode || verificationCode.length < 3) {
            setError('الكود خاطئ');
            return;
        }

        setLoading(true);
        try {
            // Pass all data including password and code to store
            await completeUserProfile({
                name,
                phone,
                sectionId
            }, password, verificationCode);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const generatePass = (e: React.MouseEvent) => {
        e.preventDefault();
        let pass = '';
        if (enablePrefixInAuto && passwordPrefix) {
            const remaining = Math.max(0, globalPasswordLength - passwordPrefix.length);
            let randomPart = '';
            if (generateAlphanumericPasswords) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                for (let i = 0; i < remaining; i++) {
                    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
                }
            } else {
                randomPart = Math.floor(Math.random() * (10 ** remaining)).toString().padStart(remaining, '0');
            }
            pass = passwordPrefix + randomPart;
        } else {
            if (generateAlphanumericPasswords) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                for (let i = 0; i < globalPasswordLength; i++) {
                    pass += chars.charAt(Math.floor(Math.random() * chars.length));
                }
            } else {
                pass = Math.floor(Math.random() * (10 ** globalPasswordLength)).toString().padStart(globalPasswordLength, '0');
            }
        }
        setPassword(pass.substring(0, globalPasswordLength));
    };

    return (
        <div className="fixed inset-0 z-[100] bg-space-900 flex items-center justify-center p-4">
            <div className="bg-space-800 p-8 rounded-2xl border-2 border-space-accent w-full max-w-md shadow-2xl animate-float overflow-y-auto max-h-[90vh]">
                <div className="flex justify-center mb-6">
                    <AlertTriangle className="text-red-500" size={64} />
                </div>
                <h2 className="text-2xl font-bold text-center text-white mb-2">تحديث البيانات مطلوب</h2>
                <p className="text-center text-slate-400 mb-6">
                    طلبت الإدارة تحديث بياناتك بشكل كامل. يرجى ملء الحقول بدقة.
                </p>

                {error && !showCodeModal && <div className="bg-red-500/10 text-red-400 p-3 rounded text-center text-sm mb-4 border border-red-500/30">{error}</div>}

                <form onSubmit={handleInitialSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-400 block mb-2">الاسم الثلاثي (أحرف فقط)</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-space-900 border border-space-700 rounded-lg p-3 pl-10 text-main focus:border-space-accent outline-none"
                                placeholder="الاسم الثلاثي"
                                required
                            />
                            <User size={18} className="absolute left-3 top-3.5 text-slate-500" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-sm text-slate-400 block mb-2">رقم الهاتف {phoneNumberLength && `(${phoneNumberLength} خانة)`}</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={phone}
                                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} // Enforce numbers visually as well
                                className="w-full bg-space-900 border border-space-700 rounded-lg p-3 pl-10 text-main focus:border-space-accent outline-none dir-ltr text-right"
                                placeholder="01xxxxxxxxx"
                                required
                            />
                            <Phone size={18} className="absolute left-3 top-3.5 text-slate-500" />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 block mb-2">القسم الدراسي</label>
                        <select 
                            value={sectionId}
                            onChange={e => setSectionId(e.target.value)}
                            className="w-full bg-space-900 border border-space-700 rounded-lg p-3 text-main focus:border-space-accent outline-none"
                            required
                        >
                            <option value="">اختر القسم...</option>
                            {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 block mb-2">كلمة المرور ({globalPasswordLength} خانة)</label>
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <input 
                                    type="text" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-space-900 border border-space-700 rounded-lg p-3 pl-10 text-main focus:border-space-accent outline-none"
                                    placeholder="كلمة المرور"
                                    required
                                />
                                <Lock size={18} className="absolute left-3 top-3.5 text-slate-500" />
                            </div>
                            <button onClick={generatePass} className="bg-space-700 hover:bg-space-600 text-space-accent p-3 rounded-lg" title="توليد تلقائي" type="button">
                                <Wand2 size={20} />
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-space-accent text-space-900 font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors mt-4 flex items-center justify-center gap-2"
                    >
                        <Save size={20} /> متابعة
                    </button>
                </form>
            </div>

            {/* Verification Code Modal */}
            {showCodeModal && (
                 <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-space-800 p-8 rounded-2xl border-2 border-green-500 shadow-2xl w-full max-w-sm relative">
                        <button onClick={() => { setShowCodeModal(false); setError(''); }} className="absolute top-4 left-4 text-slate-400 hover:text-white"><X size={20}/></button>
                        <div className="text-center mb-6">
                            <Key size={48} className="text-green-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-green-500 mb-2">كود التحقق</h3>
                            <p className="text-slate-400 text-sm">أدخل كود التحقق لإتمام العملية</p>
                        </div>
                        
                        {error && <div className="bg-red-500/10 text-red-400 p-3 rounded text-center text-sm mb-4 border border-red-500/30">{error}</div>}

                        <div className="space-y-4">
                            <input 
                                type="text" 
                                value={verificationCode.split('').join(' ')} // Visual spacing
                                onChange={handleCodeChange}
                                className="w-full bg-space-900 border border-green-500/50 rounded-xl p-4 text-white text-center text-2xl font-bold focus:outline-none focus:border-green-500 placeholder-green-500/30 tracking-widest"
                                placeholder="C O D E"
                                autoFocus
                            />

                            {codeGetUrl && (
                                <div className="text-center">
                                    <a href={codeGetUrl} target="_blank" rel="noopener noreferrer" className="text-space-accent text-sm hover:underline">
                                        احصل على كود
                                    </a>
                                </div>
                            )}
                            
                            <button 
                                onClick={handleFinalSubmit}
                                disabled={loading || verificationCode.length < 3}
                                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'جاري التحقق...' : 'تأكيد وإنهاء'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout, phoneNumberLength, toggleTheme, theme, zoomLevel, setZoomLevel, triggerPermissionError } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  if (!currentUser) return <>{children}</>;
  
  const shouldCompleteProfile = () => {
      // Show form ONLY if explicitly requested by admin
      if (currentUser.role === UserRole.STUDENT && !!currentUser.forceFullDataUpdate) return true;
      return false;
  };

  if (shouldCompleteProfile()) {
      return <CompleteProfileForm />;
  }

  const isDev = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUB_ADMIN;
  
  // Permissions Check Logic
  const canManageCodes = currentUser.role === UserRole.ADMIN || (currentUser.role === UserRole.SUB_ADMIN && currentUser.permissions?.canManageCodes);
  const canAccessSettings = currentUser.role === UserRole.ADMIN || (currentUser.role === UserRole.SUB_ADMIN && currentUser.permissions?.canAccessSettings);
  const canViewStats = currentUser.role === UserRole.ADMIN || (currentUser.role === UserRole.SUB_ADMIN && currentUser.permissions?.canViewStats);

  const handleRestrictedLink = (e: React.MouseEvent, hasPermission: boolean) => {
      if (!hasPermission) {
          e.preventDefault();
          triggerPermissionError();
          // On mobile, close menu to show the toast clearly
          if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
  };

  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 0.1, 0.8));
  const toggleGrayscale = () => setIsGrayscale(!isGrayscale);

  return (
    <div 
      className={`flex h-[100dvh] bg-space-900 text-main ${isGrayscale ? 'grayscale' : ''}`}
    >
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static top-0 right-0 h-full border-l border-space-700 z-50 transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0 w-64 bg-space-800' : 'translate-x-full lg:translate-x-0'} ${isSidebarCollapsed ? 'lg:w-16 bg-transparent border-none' : 'lg:w-64 bg-space-800'}`}
      >
        <div className={`p-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} h-16 transition-all duration-300`}>
          <div className={`flex items-center gap-2 overflow-hidden whitespace-nowrap w-full ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <div className={`bg-space-accent rounded-full flex items-center justify-center text-space-900 shrink-0 overflow-visible transition-all ${isSidebarCollapsed ? 'w-8 h-8 p-1' : 'w-8 h-8'}`}>
                  <Rocket size={isSidebarCollapsed ? 14 : 18} />
                </div>
                {!isSidebarCollapsed && (
                    <h1 className="text-xl font-bold text-main tracking-wider truncate">المذاكرة</h1>
                )}
          </div>
          
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-muted">
            <X size={20} />
          </button>
        </div>

        <div className="px-3 mb-2">
          <div className={`bg-space-700/50 p-3 rounded-lg border border-space-700 flex flex-col items-center text-center transition-all duration-300 ${isSidebarCollapsed ? 'p-1 bg-transparent border-0' : 'p-3'}`}>
             {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Profile" className={`${isSidebarCollapsed ? 'w-10 h-10' : 'w-14 h-14'} rounded-full object-cover mb-2 border-2 border-space-accent transition-all shrink-0`} />
            ) : (
                <div className={`${isSidebarCollapsed ? 'w-10 h-10' : 'w-14 h-14'} bg-space-800 rounded-full flex items-center justify-center mb-2 text-space-accent border border-space-700 transition-all shrink-0`}>
                    <User size={isSidebarCollapsed ? 18 : 24} />
                </div>
            )}
            {!isSidebarCollapsed && (
                <>
                    <p className="text-[10px] text-muted mb-0.5">مرحباً بك،</p>
                    <p className="font-bold text-space-accent truncate w-full text-sm">{currentUser.name}</p>
                    <p className="text-[10px] text-muted mt-0.5">
                    {currentUser.role === UserRole.ADMIN ? 'المطور الرئيسي' : 
                    currentUser.role === UserRole.SUB_ADMIN ? 'مطور فرعي' : 'طالب'}
                    </p>
                </>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-2 custom-scrollbar">
          {currentUser.role === UserRole.STUDENT && (
            <>
              <SidebarItem to="/student" icon={Home} label="الرئيسية" active={location.pathname === '/student'} collapsed={isSidebarCollapsed} />
              <SidebarItem to="/student/profile" icon={Settings} label="بياناتي" active={location.pathname === '/student/profile'} collapsed={isSidebarCollapsed} />
            </>
          )}

          {isDev && (
            <>
              <SidebarItem 
                to="/admin/dashboard" 
                icon={BarChart} 
                label="لوحة التحكم" 
                active={location.pathname === '/admin/dashboard'} 
                collapsed={isSidebarCollapsed} 
                onClick={(e: React.MouseEvent) => handleRestrictedLink(e, canViewStats)}
              />
              <SidebarItem to="/admin/users" icon={Users} label="المستخدمين" active={location.pathname === '/admin/users'} collapsed={isSidebarCollapsed} />
              <SidebarItem to="/admin/content" icon={FileText} label="إدارة المحتوى" active={location.pathname === '/admin/content'} collapsed={isSidebarCollapsed} />
              
              <SidebarItem 
                to="/admin/codes" 
                icon={Key} 
                label="أكواد التحقق" 
                active={location.pathname === '/admin/codes'} 
                collapsed={isSidebarCollapsed} 
                onClick={(e: React.MouseEvent) => handleRestrictedLink(e, canManageCodes)}
              />
              
              <SidebarItem 
                to="/admin/settings" 
                icon={Settings} 
                label="الإعدادات" 
                active={location.pathname === '/admin/settings'} 
                collapsed={isSidebarCollapsed} 
                onClick={(e: React.MouseEvent) => handleRestrictedLink(e, canAccessSettings)}
              />
              
              <SidebarItem 
                to="/admin/activity" 
                icon={Eye} 
                label="سجل النشاطات" 
                active={location.pathname === '/admin/activity'} 
                collapsed={isSidebarCollapsed} 
                onClick={(e: React.MouseEvent) => handleRestrictedLink(e, canViewStats)}
              />
              
              <SidebarItem to="/admin/profile" icon={User} label="بياناتي" active={location.pathname === '/admin/profile'} collapsed={isSidebarCollapsed} />
            </>
          )}

          {/* Tools / Accessibility for All Users */}
          <div className={`mt-2 pt-2 border-t border-space-700 ${isSidebarCollapsed ? 'flex flex-col items-center gap-1' : ''}`}>
              {!isSidebarCollapsed && <p className="px-2 text-[10px] text-muted mb-1 font-bold">راحة العين</p>}
              <div className={`px-2 flex gap-1 justify-center flex-wrap ${isSidebarCollapsed ? 'px-0 flex-col' : ''}`}>
                  <button onClick={handleZoomIn} className="p-1.5 bg-space-700 rounded hover:bg-space-600 text-main" title="تكبير">
                      <ZoomIn size={16} />
                  </button>
                  <button onClick={handleZoomOut} className="p-1.5 bg-space-700 rounded hover:bg-space-600 text-main" title="تصغير">
                      <ZoomOut size={16} />
                  </button>
                  <button onClick={toggleGrayscale} className={`p-1.5 rounded hover:bg-space-600 text-main ${isGrayscale ? 'bg-space-accent text-space-900' : 'bg-space-700'}`} title="أبيض وأسود">
                      <Eye size={16} />
                  </button>
                  <button onClick={toggleTheme} className="p-1.5 bg-space-700 rounded hover:bg-space-600 text-main" title="تغيير النمط">
                       {theme === 'dark' ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
                  </button>
              </div>
          </div>
        </nav>

        <div className="p-3 border-t border-space-700 flex flex-col gap-1">
          <button 
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className={`hidden lg:flex w-full items-center justify-center gap-2 bg-space-700 text-muted p-2 rounded-lg hover:bg-space-600 transition-colors`}
             title={isSidebarCollapsed ? "توسيع القائمة" : "طي القائمة"}
          >
             {isSidebarCollapsed ? <ChevronLeft size={18}/> : <ChevronRight size={18}/>}
             {!isSidebarCollapsed && <span className="text-sm">طي القائمة</span>}
          </button>

          <button 
            onClick={logout}
            className={`w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 p-2.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors ${isSidebarCollapsed ? 'px-0' : ''}`}
            title="تسجيل الخروج"
          >
            <LogOut size={18} />
            {!isSidebarCollapsed && <span className="text-sm">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center justify-start gap-4 px-6 bg-space-900/90 backdrop-blur-md border-b border-space-800 lg:hidden sticky top-0 z-30 shrink-0">
           <button onClick={() => setIsMobileMenuOpen(true)} className="text-main p-2">
               <Menu size={24} />
           </button>
           <div className="flex items-center gap-2 mr-auto">
              <Rocket className="text-space-accent" size={24} />
              <span className="font-bold text-lg text-main">المذاكرة</span>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8 relative custom-scrollbar">
           <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-10 left-10 w-2 h-2 bg-main rounded-full animate-twinkle opacity-50"></div>
             <div className="absolute top-40 right-20 w-1 h-1 bg-space-accent rounded-full animate-twinkle opacity-30 delay-75"></div>
             <div className="absolute bottom-20 left-1/3 w-1.5 h-1.5 bg-main rounded-full animate-twinkle opacity-40 delay-150"></div>
           </div>
           
           <div className="relative z-10 max-w-6xl mx-auto w-full">
             {children}
           </div>
        </div>
        
        {/* Global Chat Component - Integrated here to be available on all authorized screens */}
        <GlobalChat />
      </main>
    </div>
  );
};

export default Layout;
