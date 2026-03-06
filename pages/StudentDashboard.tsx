
import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { Link, useParams } from 'react-router-dom';
import { Folder, FileVideo, FileAudio, FileText, ChevronLeft, Lock, MessageSquare, X, Bell, Filter, Image as ImageIcon, Type } from 'lucide-react';
import { FileType } from '../types';

export const StudentDashboard: React.FC = () => {
  const { sections, subjects, currentUser, systemMessage, notifications, markNotificationsRead } = useStore();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (systemMessage.isActive) {
        setShowMessage(true);
    }
  }, [systemMessage]);

  if (!currentUser) return null;
  
  const myNotifications = notifications.filter(n => n.userId === currentUser.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  const handleOpenNotifications = () => {
      setShowNotifications(!showNotifications);
      if (!showNotifications && unreadCount > 0) {
          markNotificationsRead(currentUser.id);
      }
  };

  const renderTextWithLinks = (text: string) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = text.split(urlRegex);
      return parts.map((part, index) => {
          if (part.match(urlRegex)) {
              return (
                  <a 
                    key={index} 
                    href={part} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-space-accent underline hover:text-yellow-300 break-all dir-ltr inline-block mx-1"
                  >
                      {part}
                  </a>
              );
          }
          return part;
      });
  };

  return (
    <div className="space-y-6 md:space-y-8 relative">
      {showMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-space-800 border-2 border-space-accent rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                  <button onClick={() => setShowMessage(false)} className="absolute top-4 left-4 text-slate-400 hover:text-white">
                      <X size={20} />
                  </button>
                  <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-space-900 rounded-full flex items-center justify-center border border-space-accent">
                          <MessageSquare className="text-space-accent" size={32} />
                      </div>
                  </div>
                  <h3 className="text-xl font-bold text-center text-main mb-4">تنبيه من الإدارة</h3>
                  <div className="bg-space-900 p-4 rounded-lg text-main text-center leading-relaxed whitespace-pre-wrap">
                      {renderTextWithLinks(systemMessage.content)}
                  </div>
                  <button 
                    onClick={() => setShowMessage(false)}
                    className="w-full bg-space-accent text-space-900 font-bold py-3 rounded-lg mt-6 hover:bg-yellow-400"
                  >
                      فهمت
                  </button>
              </div>
          </div>
      )}

      <header className="flex justify-between items-start md:items-center mb-6 md:mb-8">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-main mb-1 md:mb-2">مرحباً، {currentUser.name} 👋</h1>
            <p className="text-xs md:text-sm text-muted">تابع محاضراتك وكل جديد من هنا.</p>
        </div>
        
        <div className="relative">
            <button 
                onClick={handleOpenNotifications} 
                className="relative p-2 md:p-3 bg-space-800 rounded-full border border-space-700 hover:border-space-accent transition-colors"
            >
                <Bell size={20} className="text-space-accent md:w-6 md:h-6" />
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] md:text-xs font-bold">
                        {unreadCount}
                    </div>
                )}
            </button>

            {showNotifications && (
                <div className="absolute top-12 md:top-14 left-0 w-72 md:w-80 bg-space-800 border border-space-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                    <div className="p-3 bg-space-900 border-b border-space-700 font-bold text-main flex justify-between items-center">
                        <span>الإشعارات</span>
                        <button onClick={() => setShowNotifications(false)}><X size={16}/></button>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {myNotifications.length > 0 ? (
                            myNotifications.map(n => (
                                <div key={n.id} className={`p-4 border-b border-space-700 hover:bg-space-700/30 ${!n.isRead ? 'bg-space-700/10' : ''}`}>
                                    <p className="text-sm text-main mb-1 whitespace-pre-wrap">{renderTextWithLinks(n.message)}</p>
                                    <span className="text-xs text-muted">{new Date(n.createdAt).toLocaleString('ar-EG')}</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-muted text-sm">لا توجد إشعارات جديدة</div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </header>

      {!selectedSection ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className="bg-space-800 border border-space-700 p-5 md:p-8 rounded-2xl hover:bg-space-700 hover:border-space-accent transition-all duration-300 group text-right relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-20 h-20 md:w-24 md:h-24 bg-space-accent/5 rounded-br-full -translate-x-4 -translate-y-4 group-hover:bg-space-accent/10 transition-colors"></div>
              <Folder className="text-space-accent mb-3 md:mb-4 w-10 h-10 md:w-12 md:h-12 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg md:text-xl font-bold text-main">{section.title}</h3>
              <p className="text-muted text-xs md:text-sm mt-1 md:mt-2">
                {subjects.filter(s => s.sectionId === section.id).length} مادة دراسية
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          <button 
            onClick={() => setSelectedSection(null)}
            className="flex items-center text-space-accent hover:text-main transition-colors text-sm md:text-base"
          >
            <ChevronLeft className="rotate-180 ml-2" size={18} />
            العودة للأقسام
          </button>

          <h2 className="text-xl md:text-2xl font-bold text-main border-b border-space-700 pb-4">
             {sections.find(s => s.id === selectedSection)?.title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {subjects.filter(s => s.sectionId === selectedSection).map(subject => (
              <Link
                key={subject.id}
                to={`/student/subject/${subject.id}`}
                className="bg-space-800/50 p-5 md:p-6 rounded-xl border border-space-700 hover:bg-space-800 transition-all flex items-center justify-between group"
              >
                <div>
                   <h3 className="font-bold text-base md:text-lg text-main group-hover:text-space-accent transition-colors">{subject.title}</h3>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-space-900 rounded-full flex items-center justify-center group-hover:bg-space-700 transition-colors">
                  <ChevronLeft className="text-muted" size={18} />
                </div>
              </Link>
            ))}
            {subjects.filter(s => s.sectionId === selectedSection).length === 0 && (
                <p className="text-muted col-span-full py-10 text-center text-sm">لا توجد مواد في هذا القسم حتى الآن.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const SubjectFiles: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { subjects, files } = useStore();
    const [filter, setFilter] = useState<'ALL' | FileType>('ALL');
    const subject = subjects.find(s => s.id === id);
    
    // Sort: PDF, TEXT, IMAGE, VIDEO, AUDIO
    const subjectFiles = files
        .filter(f => !f.isSuspended)
        .filter(f => f.subjectId === id)
        .filter(f => filter === 'ALL' || f.type === filter)
        .sort((a, b) => {
            const order = { [FileType.PDF]: 1, [FileType.TEXT]: 2, [FileType.IMAGE]: 3, [FileType.VIDEO]: 4, [FileType.AUDIO]: 5 };
            return (order[a.type] || 99) - (order[b.type] || 99);
        });

    if (!subject) return <div>المادة غير موجودة</div>;

    const getIcon = (type: FileType) => {
        switch (type) {
            case FileType.PDF: return <FileText className="text-red-400" size={18} />;
            case FileType.VIDEO: return <FileVideo className="text-blue-400" size={18} />;
            case FileType.AUDIO: return <FileAudio className="text-purple-400" size={18} />;
            case FileType.TEXT: return <Type className="text-green-400" size={18} />;
            case FileType.IMAGE: return <ImageIcon className="text-orange-400" size={18} />;
        }
    };

    const FilterBtn = ({ type, label }: {type: 'ALL' | FileType, label: string}) => (
        <button 
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm transition-colors whitespace-nowrap ${filter === type ? 'bg-space-accent text-space-900 font-bold' : 'bg-space-800 text-muted hover:bg-space-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/student" className="p-2 bg-space-800 rounded-full hover:bg-space-700 text-main">
                        <ChevronLeft className="rotate-180" size={20} />
                    </Link>
                    <h1 className="text-xl md:text-2xl font-bold text-main truncate">{subject.title}</h1>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    <Filter size={16} className="text-muted ml-2 shrink-0" />
                    <FilterBtn type="ALL" label="الكل" />
                    <FilterBtn type={FileType.PDF} label="PDF" />
                    <FilterBtn type={FileType.TEXT} label="نصوص" />
                    <FilterBtn type={FileType.IMAGE} label="صور" />
                    <FilterBtn type={FileType.VIDEO} label="فيديو" />
                    <FilterBtn type={FileType.AUDIO} label="صوتيات" />
                </div>
            </div>

            <div className="bg-space-800 rounded-2xl overflow-hidden border border-space-700">
                {subjectFiles.length > 0 ? (
                    <div className="divide-y divide-space-700">
                        {subjectFiles.map(file => (
                            <Link 
                                key={file.id} 
                                to={`/student/file/${file.id}`}
                                className="p-4 flex items-center justify-between hover:bg-space-700/50 transition-colors group"
                            >
                                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                    <div className="p-2 md:p-3 bg-space-900 rounded-lg shrink-0">
                                        {getIcon(file.type)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-main text-sm md:text-base group-hover:text-space-accent transition-colors truncate">{file.title}</h4>
                                        <p className="text-[10px] md:text-xs text-muted mt-1 truncate">
                                            {file.type === FileType.PDF ? 'وثيقة PDF' : file.type === FileType.IMAGE ? 'صورة' : file.type === FileType.TEXT ? 'نص مقروء' : 'اضغط للمشاهدة'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {file.preventDownload && (
                                        <span title="التحميل غير متاح" className="flex items-center">
                                            <Lock size={14} className="text-red-400" />
                                        </span>
                                    )}
                                    <ChevronLeft size={18} className="text-muted" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-muted text-sm">
                        لا توجد ملفات متاحة لهذه المادة حالياً.
                    </div>
                )}
            </div>
        </div>
    );
};
