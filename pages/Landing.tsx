
import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Star, ChevronLeft, Shield, FileText, Video, BookOpen, PenTool, Sun, Moon } from 'lucide-react';
import { useStore } from '../services/store';

const Landing: React.FC = () => {
  const { toggleTheme, theme } = useStore();

  return (
    <div className="min-h-screen bg-space-900 flex flex-col items-center justify-center relative overflow-hidden text-center p-4 md:p-6">
      
      {/* Theme Toggle (Top Left) */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
          <button 
            onClick={toggleTheme}
            className="p-2 md:p-3 bg-space-800 rounded-full border border-space-700 text-main hover:bg-space-700 transition-colors"
            title="تغيير النمط"
          >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400 md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
          </button>
      </div>

      {/* Developer Portal Link (Desktop: Bottom Left) */}
      <div className="hidden md:block absolute bottom-6 left-6 z-20">
          <Link 
            to="/developer-login" 
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
          >
              <Shield size={16} /> 
              <span>بوابة المطورين</span>
          </Link>
      </div>

      {/* Background Stars Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[5%] text-main animate-twinkle delay-100"><Star size={24} fill="currentColor" /></div>
        <div className="absolute bottom-[10%] left-[5%] text-muted animate-twinkle delay-300"><Star size={12} fill="currentColor" /></div>
        <div className="absolute bottom-[5%] right-[10%] text-space-accent animate-twinkle delay-500"><Star size={14} fill="currentColor" /></div>
        
        <div className="absolute top-[5%] right-[5%] w-32 h-32 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[5%] left-[5%] w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center w-full">
        <div className="flex justify-center mb-6 md:mb-8 animate-float">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-space-accent to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/30">
             <Rocket size={48} className="text-white md:w-16 md:h-16" />
          </div>
        </div>

        <h1 className="text-4xl md:text-7xl font-bold text-main mb-4 md:mb-6 tracking-tight">
          منصة <span className="text-space-accent">المذاكرة</span>
        </h1>
        
        <p className="text-base md:text-xl text-muted mb-8 leading-relaxed max-w-2xl px-2">
          منصتك التعليمية الشاملة. نوفر لك كل ما تحتاجه للتفوق. كل ذلك في بيئة تعليمية آمنة وممتعة.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10 text-muted text-xs md:text-sm w-full px-2">
            <div className="flex flex-col items-center gap-2">
                <div className="p-2 md:p-3 bg-space-800 rounded-lg text-red-400"><FileText size={20} className="md:w-6 md:h-6" /></div>
                <span>ملفات PDF وشيتات</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="p-2 md:p-3 bg-space-800 rounded-lg text-blue-400"><Video size={20} className="md:w-6 md:h-6" /></div>
                <span>محاضرات فيديو</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="p-2 md:p-3 bg-space-800 rounded-lg text-green-400"><BookOpen size={20} className="md:w-6 md:h-6" /></div>
                <span>ملخصات ومراجعات</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="p-2 md:p-3 bg-space-800 rounded-lg text-purple-400"><PenTool size={20} className="md:w-6 md:h-6" /></div>
                <span>بنك أسئلة واختبارات</span>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center w-full max-w-md mb-8 px-2">
          <Link 
            to="/login"
            className="flex-1 px-6 py-3 md:px-8 md:py-4 bg-space-accent text-space-900 font-bold rounded-full text-base md:text-lg hover:bg-yellow-400 transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            تسجيل الدخول <ChevronLeft size={18} className="md:w-5 md:h-5" />
          </Link>
          <Link 
            to="/register"
            className="flex-1 px-6 py-3 md:px-8 md:py-4 bg-space-800 text-main font-bold rounded-full text-base md:text-lg border border-space-700 hover:bg-space-700 transition-transform hover:scale-105 flex items-center justify-center"
          >
            إنشاء حساب جديد
          </Link>
        </div>

        {/* Developer Portal Link (Mobile Only: In Flow) */}
        <Link 
            to="/developer-login" 
            className="flex md:hidden items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm mb-8"
        >
            <Shield size={16} /> 
            <span>بوابة المطورين</span>
        </Link>
      </div>

      <div className="absolute bottom-4 w-full px-6 text-center text-muted text-xs md:text-sm pointer-events-none">
        <span>جميع الحقوق محفوظة © 2026 منصة المذاكرة</span>
      </div>
    </div>
  );
};

export default Landing;
