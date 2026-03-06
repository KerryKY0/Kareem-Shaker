
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../services/store';
import { Rocket, Phone, Lock, User as UserIcon, Wand2, Shield, Crown, UserCog, Layers, Key, X, ExternalLink } from 'lucide-react';
import { APP_NAME } from '../constants';

export const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(phone, password);
      if (rememberMe) {
          console.log("Remember me enabled");
      }
      
      if (user.role === 'STUDENT') {
        navigate('/student');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-900 flex items-center justify-center p-4 relative overflow-hidden">
       <div className="absolute -left-20 top-20 w-64 h-64 bg-space-accent/10 rounded-full blur-3xl"></div>
       
       <div className="bg-space-800 p-8 rounded-2xl border border-space-700 shadow-2xl w-full max-w-md relative z-10">
         <div className="flex justify-center mb-6">
           <div className="w-16 h-16 bg-space-700 rounded-full flex items-center justify-center">
             <Rocket className="text-space-accent" size={32} />
           </div>
         </div>
         <h2 className="text-2xl font-bold text-center text-white mb-8">تسجيل دخول الطالب</h2>

         {error && (
           <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
             {error}
           </div>
         )}

         <form onSubmit={handleLogin} className="space-y-4">
           <div className="space-y-2">
             <label className="text-slate-400 text-sm">رقم الهاتف</label>
             <div className="relative">
               <input 
                 type="text" 
                 value={phone}
                 onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                 className="w-full bg-space-900 border border-space-700 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:border-space-accent transition-colors text-left dir-ltr"
                 placeholder="01xxxxxxxxx"
                 required
               />
               <Phone className="absolute left-3 top-3.5 text-slate-500" size={18} />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-slate-400 text-sm">كلمة المرور</label>
             <div className="relative">
               <input 
                 type="password" 
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 className="w-full bg-space-900 border border-space-700 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:border-space-accent transition-colors text-left dir-ltr tracking-widest"
                 required
               />
               <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
             </div>
           </div>
           
           <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="remember" 
                    checked={rememberMe} 
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-space-accent cursor-pointer" 
                />
                <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer select-none">حفظ تسجيل الدخول</label>
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-space-accent text-space-900 font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
           >
             {loading ? 'جاري التحقق...' : 'دخول'}
           </button>
         </form>

         <div className="mt-6 text-center">
           <Link to="/register" className="text-space-accent hover:underline text-sm block mb-2">
             ليس لديك حساب؟ إنشاء حساب جديد
           </Link>
           <Link to="/developer-login" className="text-slate-500 hover:text-white text-xs mt-4 inline-block">
              تسجيل دخول المطورين
           </Link>
         </div>
       </div>
    </div>
  );
};

export const DeveloperLogin: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginTab, setLoginTab] = useState<'MAIN' | 'SUB'>('MAIN');
  const { login } = useStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(phone, password);
      if (user.role === 'STUDENT') {
        throw new Error("غير مسموح للطلاب بالدخول من هنا");
      }
      if (loginTab === 'MAIN' && user.role !== 'ADMIN') {
         throw new Error("هذا الحساب ليس للمطور الرئيسي");
      }
      if (loginTab === 'SUB' && user.role !== 'SUB_ADMIN') {
        throw new Error("هذا الحساب ليس للمطور الفرعي");
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-900 flex items-center justify-center p-4 relative overflow-hidden">
       <div className="bg-space-800 p-8 rounded-2xl border border-space-700 shadow-2xl w-full max-w-md relative z-10 border-t-4 border-t-red-500">
         <div className="flex justify-center mb-6">
            <Shield className="text-red-500" size={48} />
         </div>
         <h2 className="text-2xl font-bold text-center text-white mb-2">تسجيل دخول المطورين</h2>
         <p className="text-center text-slate-400 text-sm mb-8">الوصول المحدود للمشرفين فقط</p>

         <div className="flex mb-6 bg-space-900 p-1 rounded-lg">
             <button 
                onClick={() => setLoginTab('MAIN')}
                className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors ${loginTab === 'MAIN' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-space-800'}`}
             >
                 <Crown size={16} /> المطور الرئيسي
             </button>
             <button 
                onClick={() => setLoginTab('SUB')}
                className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors ${loginTab === 'SUB' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-space-800'}`}
             >
                 <UserCog size={16} /> المطور الفرعي
             </button>
         </div>

         {error && (
           <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
             {error}
           </div>
         )}

         <form onSubmit={handleLogin} className="space-y-4">
           <div className="space-y-2">
             <label className="text-slate-400 text-sm">رقم الهاتف أو اسم المستخدم</label>
             <div className="relative">
               <input 
                 type="text" 
                 value={phone}
                 onChange={e => setPhone(e.target.value)}
                 className="w-full bg-space-900 border border-space-700 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors text-left dir-ltr"
                 required
               />
               <Phone className="absolute left-3 top-3.5 text-slate-500" size={18} />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-slate-400 text-sm">كلمة المرور</label>
             <div className="relative">
               <input 
                 type="password" 
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 className="w-full bg-space-900 border border-space-700 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors text-left dir-ltr"
                 required
               />
               <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
             </div>
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 mt-4"
           >
             {loading ? 'جاري التحقق...' : (loginTab === 'MAIN' ? 'دخول المطور الرئيسي' : 'دخول المطور الفرعي')}
           </button>
         </form>

         <div className="mt-6 text-center">
           <Link to="/login" className="text-slate-400 hover:text-white text-sm">
             عودة لتسجيل دخول الطلاب
           </Link>
         </div>
       </div>
    </div>
  );
};

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', sectionId: '', verificationCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const { registerStudent, globalPasswordLength, passwordPrefix, enablePrefixInAuto, phoneNumberLength, sections, checkPhoneAvailability, codeGetUrl, generateAlphanumericPasswords } = useStore();
  const navigate = useNavigate();

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Strict Triple Name Check
    const nameParts = formData.name.trim().split(/\s+/);
    if (nameParts.length < 3) {
      setError("يجب كتابة الاسم الثلاثي كاملاً (3 كلمات على الأقل)");
      return;
    }

    // Name should not contain special chars/symbols or numbers (Allowing letters and spaces only)
    if (!/^[\p{L}\s]+$/u.test(formData.name)) {
        setError("الاسم يجب أن يحتوي على أحرف وليس (رموز، علامات، ارقام)");
        return;
    }
    
    if (phoneNumberLength && formData.phone.length !== phoneNumberLength) {
        setError(`رقم الهاتف يجب أن يتكون من ${phoneNumberLength} خانة`);
        return;
    }

    if (formData.password.length !== globalPasswordLength) {
      setError(`يرجى إدخال ${globalPasswordLength} رموز او حروف او ارقام في كلمة المرور`);
      return;
    }

    setLoading(true);
    try {
        await checkPhoneAvailability(formData.phone);
        // If valid, show code modal
        setLoading(false);
        setShowCodeModal(true);
    } catch (err: any) {
        setError(err.message);
        setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
      // Basic check - verificationCode holds the raw value with spaces visually? 
      // Actually state holds just value, we add visual space in rendering or controlled input logic.
      // But user requested "separated by space".
      // Let's assume the user types characters and we visually space them or just store them.
      // The store handles space removal.
      if (!formData.verificationCode || formData.verificationCode.length < 3) {
          setError("الكود خاطئ");
          return;
      }

      setLoading(true);
      setError('');
      try {
          await registerStudent(formData.name, formData.phone, formData.password, formData.sectionId, formData.verificationCode);
          navigate('/student', { replace: true });
      } catch (err: any) {
          setError("الكود خاطئ");
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
    pass = pass.substring(0, globalPasswordLength);
    setFormData({...formData, password: pass});
  };

  // Function to add space between characters for the input display logic
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\s/g, ''); // remove all spaces first
      setFormData({...formData, verificationCode: val});
      if(error) setError('');
  };

  // For display in input value, we join characters with space
  const displayCode = formData.verificationCode.split('').join(' ');

  return (
    <div className="min-h-screen bg-space-900 flex items-center justify-center p-4 relative">
       <div className="bg-space-800 p-8 rounded-2xl border border-space-700 shadow-2xl w-full max-w-md z-10">
         <div className="text-center mb-6">
           <h2 className="text-2xl font-bold text-white">إنشاء حساب جديد</h2>
           <p className="text-slate-400 text-sm mt-2">انضم إلى {APP_NAME}</p>
         </div>

         {error && !showCodeModal && (
           <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
             {error}
           </div>
         )}

         <form onSubmit={handleInitialSubmit} className="space-y-4">
             <div className="space-y-2">
                 <label className="text-slate-400 text-sm flex justify-between">
                     <span>الاسم الثلاثي</span>
                     <span className="text-xs text-muted">مطلوب حروف فقط</span>
                 </label>
                 <div className="relative">
                 <input 
                     type="text" 
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full bg-space-900 border border-space-700 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:border-space-accent"
                     placeholder="الاسم ثلاثي"
                     required
                 />
                 <UserIcon className="absolute left-3 top-3.5 text-slate-500" size={18} />
                 </div>
             </div>

             <div className="space-y-2">
                 <label className="text-slate-400 text-sm flex justify-between">
                     <span>رقم الهاتف</span>
                     {phoneNumberLength && <span className="text-xs text-muted">مطلوب {phoneNumberLength} خانة</span>}
                 </label>
                 <div className="relative">
                 <input 
                     type="text" 
                     value={formData.phone}
                     onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                     className="w-full bg-space-900 border border-space-700 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:border-space-accent text-left dir-ltr"
                     placeholder="01xxxxxxxxx"
                     required
                 />
                 <Phone className="absolute left-3 top-3.5 text-slate-500" size={18} />
                 </div>
             </div>
             
             <div className="space-y-2">
                 <label className="text-slate-400 text-sm">القسم</label>
                 <div className="relative">
                     <select 
                        value={formData.sectionId}
                        onChange={e => setFormData({...formData, sectionId: e.target.value})}
                        className="w-full bg-space-900 border border-space-700 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:border-space-accent appearance-none"
                     >
                         <option value="">اختر القسم</option>
                         {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                     </select>
                     <Layers className="absolute left-3 top-3.5 text-slate-500" size={18} />
                 </div>
             </div>

             <div className="space-y-2">
                 <label className="text-slate-400 text-sm flex justify-between">
                    <span>كلمة المرور</span>
                    <span className="text-space-accent text-xs">مطلوب {globalPasswordLength} خانة</span>
                 </label>
                 <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            className="w-full bg-space-900 border border-space-700 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:border-space-accent text-left dir-ltr tracking-widest"
                            required
                        />
                        <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                    </div>
                    <button onClick={generatePass} className="bg-space-700 hover:bg-space-600 text-space-accent p-3 rounded-lg" title="توليد تلقائي" type="button">
                        <Wand2 size={20} />
                    </button>
                 </div>
             </div>

             <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full bg-space-accent text-space-900 font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                 {loading ? 'جاري المعالجة...' : 'إنشاء حساب'}
             </button>
             
             <div className="mt-6 text-center">
                <Link to="/login" className="text-space-accent hover:underline text-sm">
                    لديك حساب بالفعل؟ تسجيل الدخول
                </Link>
             </div>
         </form>
       </div>

       {/* Code Verification Modal */}
       {showCodeModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
               <div className="bg-space-800 p-8 rounded-2xl border-2 border-green-500 shadow-2xl w-full max-w-sm relative">
                   <button onClick={() => { setShowCodeModal(false); setError(''); }} className="absolute top-4 left-4 text-slate-400 hover:text-white"><X size={20}/></button>
                   <div className="text-center mb-6">
                       <Key size={48} className="text-green-500 mx-auto mb-4" />
                       <h3 className="text-2xl font-bold text-green-500 mb-2">أدخل كود التحقق</h3>
                       <p className="text-slate-400 text-sm">أدخل الكود لإتمام التسجيل</p>
                       
                       {/* Error Message inside Modal */}
                       {error && (
                           <div className="mt-4 bg-red-500/20 text-red-500 px-3 py-2 rounded-lg text-sm font-bold animate-pulse">
                               الكود خاطئ
                           </div>
                       )}
                   </div>
                   
                   <input 
                       type="text" 
                       value={displayCode}
                       onChange={handleCodeChange}
                       className={`w-full bg-space-900 border ${error ? 'border-red-500' : 'border-green-500/50'} rounded-xl p-4 text-white text-center text-2xl font-bold focus:outline-none ${error ? 'focus:border-red-500' : 'focus:border-green-500'} mb-4 placeholder-green-500/30 tracking-widest`}
                       placeholder="C O D E"
                       autoFocus
                   />

                   {codeGetUrl && (
                        <div className="mb-6 text-center">
                            <a href={codeGetUrl} target="_blank" rel="noopener noreferrer" className="text-space-accent text-sm hover:underline block">
                                احصل على كود
                            </a>
                        </div>
                   )}

                   <button 
                       onClick={handleFinalSubmit}
                       disabled={formData.verificationCode.length < 3 || loading}
                       className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
                   >
                       {loading ? 'جاري التحقق...' : 'تأكيد وإنشاء الحساب'}
                   </button>
               </div>
           </div>
       )}
    </div>
  );
};
