
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Section, Subject, EducationalFile, Log, ViewRecord, FileType, Permission, SystemMessage, Notification, Comment, VerificationCode, ChatMessage, ChatSettings } from '../types';
import { INITIAL_SECTIONS, INITIAL_SUBJECTS } from '../constants';

interface AppContextType {
  users: User[];
  currentUser: User | null;
  sections: Section[];
  subjects: Subject[];
  files: EducationalFile[];
  logs: Log[];
  viewRecords: ViewRecord[];
  verificationCodes: VerificationCode[];
  globalPasswordLength: number;
  phoneNumberLength: number;
  theme: 'light' | 'dark';
  passwordPrefix: string;
  enablePrefixInAuto: boolean; // For Passwords
  enablePrefixInCodes: boolean; // For Codes
  generateAlphanumericPasswords: boolean; // New Setting
  systemMessage: SystemMessage;
  notifications: Notification[];
  toastMessage: string | null;
  permissionError: boolean; // New: Permission Error State
  otpApiToken: string;
  zoomLevel: number;
  timeFormat: '12' | '24';
  codeGetUrl: string;
  codePrefix: string; 
  
  // Chat
  chatMessages: ChatMessage[];
  chatSettings: ChatSettings;
  sendChatMessage: (content: string, type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO', isAnonymous: boolean) => void;
  editChatMessage: (msgId: string, newContent: string) => void;
  deleteChatMessage: (msgId: string) => void;
  reactToMessage: (msgId: string, emoji: string) => void;
  markChatMessagesAsViewed: () => void; // New
  toggleChatLock: () => void;
  clearChat: () => void;
  toggleChatBan: (userId: string) => void; // New
  updateForbiddenWords: (words: string[]) => void; // New

  login: (phone: string, pass: string) => Promise<User>;
  logout: () => void;
  checkPhoneAvailability: (phone: string) => Promise<boolean>;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtpCode: (phone: string, code: string) => Promise<boolean>;
  
  registerStudent: (name: string, phone: string, pass: string, sectionId: string, code: string, bypassValidation?: boolean) => Promise<void>;
  registerSubAdmin: (name: string, phone: string, pass: string, permissions: Permission) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  importUsers: (users: User[]) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>, code?: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  addFile: (file: EducationalFile) => void;
  updateFile: (id: string, updates: Partial<EducationalFile>) => void;
  deleteFile: (id: string) => void;
  logFileView: (fileId: string, studentId: string) => void;
  
  addComment: (fileId: string, content: string) => void;
  updateComment: (fileId: string, commentId: string, newContent: string) => void;
  deleteComment: (fileId: string, commentId: string) => void;
  
  addSection: (title: string) => void;
  updateSection: (id: string, title: string) => void;
  deleteSection: (id: string) => void;
  
  addSubject: (title: string, sectionId: string) => void;
  updateSubject: (id: string, title: string) => void;
  deleteSubject: (id: string) => void;
  
  setGlobalPasswordLength: (len: number) => void;
  setPhoneNumberLength: (len: number) => void;
  toggleTheme: () => void;
  setPasswordPrefix: (prefix: string) => void;
  setEnablePrefixInAuto: (enable: boolean) => void;
  setEnablePrefixInCodes: (enable: boolean) => void;
  setGenerateAlphanumericPasswords: (enable: boolean) => void; // New Setter
  updateSystemMessage: (msg: SystemMessage) => void;
  changePassword: (newPass: string) => void;
  sendNotification: (userId: string, message: string) => void;
  broadcastNotification: (message: string) => void;
  markNotificationsRead: (userId: string) => void;
  completeUserProfile: (data: Partial<User>, password?: string, code?: string) => Promise<void>;
  forceFullDataUpdateAll: () => void;
  toggleForceUpdateUser: (userId: string) => void;
  setOtpApiToken: (token: string) => void;
  showToast: (msg: string) => void;
  triggerPermissionError: () => void; // New: Trigger the error popup
  setZoomLevel: (level: number) => void;
  
  generateVerificationCodes: (count: number, length: number, isAlphanumeric: boolean) => void;
  validateAndUseCode: (code: string, userId?: string, actionType?: string) => boolean;
  deleteVerificationCode: (id: string) => void;
  deleteAllVerificationCodes: () => void;
  deleteUnusedVerificationCodes: () => void;
  deleteUsedVerificationCodes: () => void;
  
  exportCodesToCSV: () => void;
  exportUsersToCSV: (role: UserRole) => void;
  setTimeFormat: (format: '12' | '24') => void;
  setCodeGetUrl: (url: string) => void;
  setCodePrefix: (prefix: string) => void; 
  formatTime: (dateStr: string) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([
      { id: 'admin', name: 'المطور الرئيسي', phone: 'admin', password: 'admin', role: UserRole.ADMIN, createdAt: new Date().toISOString(), lastLogin: null, isSuspended: false }
  ]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [files, setFiles] = useState<EducationalFile[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [viewRecords, setViewRecords] = useState<ViewRecord[]>([]);
  const [verificationCodes, setVerificationCodes] = useState<VerificationCode[]>([]);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSettings, setChatSettings] = useState<ChatSettings>({ 
      isLocked: false, 
      hideUserNames: false,
      bannedUsers: [],
      forbiddenWords: []
  });

  const [globalPasswordLength, setGlobalPasswordLength] = useState(6);
  const [phoneNumberLength, setPhoneNumberLength] = useState(11);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    }
    return 'dark';
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [passwordPrefix, setPasswordPrefix] = useState('');
  const [enablePrefixInAuto, setEnablePrefixInAuto] = useState(false);
  const [enablePrefixInCodes, setEnablePrefixInCodes] = useState(false);
  const [generateAlphanumericPasswords, setGenerateAlphanumericPasswords] = useState(false); // New State
  const [systemMessage, setSystemMessage] = useState<SystemMessage>({ content: '', isActive: false, showAtLogin: false });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [otpApiToken, setOtpApiToken] = useState('');
  const [timeFormat, setTimeFormat] = useState<'12' | '24'>('12');
  const [codeGetUrl, setCodeGetUrl] = useState('');
  const [codePrefix, setCodePrefix] = useState(''); 

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${zoomLevel * 100}%`;
  }, [zoomLevel]);

  const addLog = (userId: string, userName: string, action: string) => {
    let finalUserName = userName;
    
    // Determine strict name based on role
    const user = users.find(u => u.id === userId);
    if (user) {
        if (user.role === UserRole.ADMIN) {
            finalUserName = 'المطور الرئيسي';
        } else if (user.role === UserRole.SUB_ADMIN) {
            finalUserName = user.name;
        } else {
            finalUserName = user.name;
        }
    } else if (userName === 'النظام' || userId === 'sys') {
        finalUserName = 'مسؤول النظام';
    }

    setLogs(prev => [{ id: Math.random().toString(), userId, userName: finalUserName, action, timestamp: new Date().toISOString() }, ...prev]);
  };

  const formatTime = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: timeFormat === '12',
          day: 'numeric',
          month: 'numeric',
          year: 'numeric'
      });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const triggerPermissionError = () => {
    setPermissionError(true);
    setTimeout(() => setPermissionError(false), 3000);
  };

  const login = async (phone: string, pass: string) => {
    const user = users.find(u => u.phone === phone && u.password === pass);
    if (!user) throw new Error("بيانات الدخول غير صحيحة");
    
    if (user.isSuspended) throw new Error("تم تعطيل هذا الحساب من قبل الإدارة");

    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    addLog(user.id, user.name, "تسجيل دخول");
    return updatedUser;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const checkPhoneAvailability = async (phone: string) => {
      if (users.some(u => u.phone === phone)) throw new Error("رقم الهاتف مسجل بالفعل");
      return true;
  };

  // Chat Functions
  const sendChatMessage = (content: string, type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO', isAnonymous: boolean) => {
      if (!currentUser) return;
      if (chatSettings.isLocked && currentUser.role === UserRole.STUDENT) return;
      if (chatSettings.bannedUsers.includes(currentUser.id)) return; // User is banned

      // Filter Forbidden Words
      let finalContent = content;
      if (type === 'TEXT') {
          chatSettings.forbiddenWords.forEach(word => {
             const regex = new RegExp(word, 'gi');
             finalContent = finalContent.replace(regex, '****');
          });
      }

      const newMessage: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          content: finalContent,
          type,
          timestamp: new Date().toISOString(),
          reactions: {},
          isAnonymous,
          isEdited: false,
          viewedBy: [currentUser.id] // Sender has viewed it
      };
      setChatMessages(prev => [...prev, newMessage]);
  };

  const editChatMessage = (msgId: string, newContent: string) => {
      // Filter forbidden words on edit as well
      let finalContent = newContent;
      chatSettings.forbiddenWords.forEach(word => {
          const regex = new RegExp(word, 'gi');
          finalContent = finalContent.replace(regex, '****');
      });

      setChatMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: finalContent, isEdited: true } : m));
  };

  const deleteChatMessage = (msgId: string) => {
      setChatMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const reactToMessage = (msgId: string, emoji: string) => {
      if (!currentUser) return;
      if (chatSettings.bannedUsers.includes(currentUser.id)) return;

      setChatMessages(prev => prev.map(msg => {
          if (msg.id !== msgId) return msg;
          
          const newReactions = { ...msg.reactions };
          const alreadyReactedWithThis = newReactions[emoji]?.includes(currentUser.id);
          
          Object.keys(newReactions).forEach(key => {
              newReactions[key] = newReactions[key].filter(uid => uid !== currentUser.id);
              if (newReactions[key].length === 0) delete newReactions[key];
          });

          if (!alreadyReactedWithThis) {
              if (!newReactions[emoji]) newReactions[emoji] = [];
              newReactions[emoji].push(currentUser.id);
          }
          
          return { ...msg, reactions: newReactions };
      }));
  };

  const markChatMessagesAsViewed = () => {
      if (!currentUser) return;
      setChatMessages(prev => prev.map(msg => {
          if (!msg.viewedBy?.includes(currentUser.id)) {
              return { ...msg, viewedBy: [...(msg.viewedBy || []), currentUser.id] };
          }
          return msg;
      }));
  };

  const toggleChatLock = () => {
      setChatSettings(prev => ({ ...prev, isLocked: !prev.isLocked }));
  };

  const clearChat = () => {
      setChatMessages([]);
  };

  const toggleChatBan = (userId: string) => {
      setChatSettings(prev => {
          const isBanned = prev.bannedUsers.includes(userId);
          return {
              ...prev,
              bannedUsers: isBanned 
                  ? prev.bannedUsers.filter(id => id !== userId)
                  : [...prev.bannedUsers, userId]
          };
      });
  };

  const updateForbiddenWords = (words: string[]) => {
      setChatSettings(prev => ({ ...prev, forbiddenWords: words }));
  };

  const generateVerificationCodes = (count: number, length: number, isAlphanumeric: boolean) => {
      const chars = isAlphanumeric 
        ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' 
        : '0123456789';
        
      const newCodes: VerificationCode[] = Array(count).fill(0).map(() => {
          let randomCode = '';
          for (let i = 0; i < length; i++) {
              randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          
          const finalCode = (enablePrefixInCodes && codePrefix) ? `${codePrefix}${randomCode}` : randomCode;
          return {
            id: Math.random().toString(36).substr(2, 9),
            code: finalCode,
            isUsed: false,
            createdAt: new Date().toISOString()
          };
      });
      setVerificationCodes(prev => [...prev, ...newCodes]);
      addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `توليد ${count} كود تحقق`);
  };

  const validateAndUseCode = (code: string, userId?: string, actionType: string = 'استخدام عام') => {
      const cleanCode = code.replace(/\s/g, '');
      const target = verificationCodes.find(c => c.code === cleanCode && !c.isUsed);
      if (!target) return false;
      setVerificationCodes(prev => prev.map(c => c.id === target.id ? { ...c, isUsed: true, usedBy: userId || 'زائر/جديد', usedAt: new Date().toISOString() } : c));
      
      const userName = userId ? users.find(u => u.id === userId)?.name || 'مستخدم' : 'زائر/جديد';
      addLog(userId || 'sys', userName, `استخدم كود التحقق ${cleanCode} في عملية: ${actionType}`);
      return true;
  };

  const deleteVerificationCode = (id: string) => {
      setVerificationCodes(prev => prev.filter(c => c.id !== id));
  };

  const deleteAllVerificationCodes = () => {
      setVerificationCodes([]);
      addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', 'حذف جميع أكواد التحقق');
  };

  const deleteUnusedVerificationCodes = () => {
      setVerificationCodes(prev => prev.filter(c => c.isUsed));
      addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', 'حذف جميع أكواد التحقق المتاحة');
  };

  const deleteUsedVerificationCodes = () => {
      setVerificationCodes(prev => prev.filter(c => !c.isUsed));
      addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', 'حذف سجل الأكواد المستخدمة');
  };

  const exportCodesToCSV = () => {
      const header = "الكود,الحالة,استخدم بواسطة,تاريخ الاستخدام,تاريخ الإنشاء\n";
      const rows = verificationCodes.map(c => 
          `${c.code},${c.isUsed ? 'مستخدم' : 'متاح'},${c.usedBy || '-'},${c.usedAt || '-'},${c.createdAt}`
      ).join("\n");
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + header + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "verification_codes.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const exportUsersToCSV = (role: UserRole) => {
      const targetUsers = users.filter(u => role === 'STUDENT' ? u.role === UserRole.STUDENT : (u.role === UserRole.ADMIN || u.role === UserRole.SUB_ADMIN));
      const header = "الاسم,الهاتف,كلمة المرور,الدور,القسم,آخر ظهور,الحالة\n";
      const rows = targetUsers.map(u => {
          const sectionName = sections.find(s => s.id === u.sectionId)?.title || 'لا يوجد قسم';
          const status = u.isSuspended ? 'معطل' : 'نشط';
          return `${u.name},${u.phone},${u.password},${u.role},${sectionName},${u.lastLogin || 'أبداً'},${status}`;
      }).join("\n");
      
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + header + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${role}_users.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const registerStudent = async (name: string, phone: string, pass: string, sectionId: string, code: string, bypassValidation: boolean = false) => {
      if (!bypassValidation) {
          if (!validateAndUseCode(code, undefined, 'إنشاء حساب طالب')) throw new Error("كود التحقق غير صحيح أو مستخدم");
      }
      
      const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name, phone, password: pass, role: UserRole.STUDENT, sectionId, createdAt: new Date().toISOString(), lastLogin: null, isSuspended: false
      };
      setUsers(prev => [...prev, newUser]);
      if (!bypassValidation) {
          setCurrentUser(newUser);
          addLog(newUser.id, newUser.name, "إنشاء حساب جديد");
      } else {
          addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `إضافة طالب جديد: ${name}`);
      }
  };

  const registerSubAdmin = async (name: string, phone: string, pass: string, permissions: Permission) => {
       const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name, phone, password: pass, role: UserRole.SUB_ADMIN, permissions, createdAt: new Date().toISOString(), lastLogin: null, isSuspended: false
      };
      setUsers(prev => [...prev, newUser]);
      addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `إضافة مطور فرعي: ${name}`);
  };

  const addUser = async (user: User) => {
       const exists = users.find(u => u.phone === user.phone);
       if(exists) throw new Error(`المستخدم ${user.phone} موجود بالفعل`);
       setUsers(prev => [...prev, user]);
       addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `إضافة مستخدم: ${user.name}`);
  };

  const importUsers = async (newUsers: User[]) => {
      const uniqueUsers = newUsers.filter(nu => !users.some(u => u.phone === nu.phone));
      setUsers(prev => [...prev, ...uniqueUsers]);
      addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `استيراد ${uniqueUsers.length} مستخدم`);
  };

  const updateUser = async (id: string, updates: Partial<User>, code?: string) => {
      if (updates.phone) {
          const exists = users.find(u => u.phone === updates.phone && u.id !== id);
          if (exists) throw new Error("رقم الهاتف مستخدم بالفعل");
          
          if (code !== undefined) {
               if (!validateAndUseCode(code, id, 'تغيير رقم الهاتف')) throw new Error("كود التحقق غير صحيح");
          }
      }
      
      const targetUser = users.find(u => u.id === id);
      const userName = targetUser?.name || 'مستخدم';

      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
      if (currentUser?.id === id) {
          setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
      }
      addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `تحديث بيانات: ${userName}`);
  };

  const deleteUser = async (id: string) => {
      const targetUser = users.find(u => u.id === id);
      const userName = targetUser?.name || 'مستخدم';
      setUsers(prev => prev.filter(u => u.id !== id));
      addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `حذف المستخدم: ${userName}`);
  };
  
  const completeUserProfile = async (data: Partial<User>, password?: string, code?: string) => {
       if (!currentUser) return;
       if (code) {
           if (!validateAndUseCode(code, currentUser.id, 'تحديث بيانات شامل')) {
               throw new Error("الكود خاطئ");
           }
       } else {
           throw new Error("كود التحقق مطلوب");
       }

       const updates = { ...data, requiresDataUpdate: false, forceFullDataUpdate: false };
       if (password) {
           updates.password = password;
       }

       await updateUser(currentUser.id, updates);
  };
  
  const forceFullDataUpdateAll = () => {
      setUsers(prev => prev.map(u => u.role === UserRole.STUDENT ? { ...u, forceFullDataUpdate: true } : u));
      addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', "طلب تحديث بيانات لجميع الطلاب");
  };

  const toggleForceUpdateUser = (userId: string) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, forceFullDataUpdate: !u.forceFullDataUpdate } : u));
      const user = users.find(u => u.id === userId);
      addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `طلب تحديث بيانات للطالب: ${user?.name}`);
  };

  const changePassword = (newPass: string) => {
      if (currentUser) {
          updateUser(currentUser.id, { password: newPass });
          addLog(currentUser.id, currentUser.name, "تغيير كلمة المرور");
      }
  };

  const addFile = (file: EducationalFile) => {
    setFiles(prev => [...prev, { ...file, isSuspended: false }]);
    addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `رفع ملف: ${file.title}`);
  };

  const updateFile = (id: string, updates: Partial<EducationalFile>) => {
    const targetFile = files.find(f => f.id === id);
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `تعديل الملف: ${targetFile?.title || 'ملف'}`);
  };

  const deleteFile = (id: string) => {
    const targetFile = files.find(f => f.id === id);
    setFiles(prev => prev.filter(f => f.id !== id));
    addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `حذف الملف: ${targetFile?.title || 'ملف'}`);
  };

  const logFileView = (fileId: string, studentId: string) => {
    const hasViewed = viewRecords.some(v => v.fileId === fileId && v.studentId === studentId);
    const targetFile = files.find(f => f.id === fileId);
    if (!hasViewed) {
      setViewRecords(prev => [...prev, { fileId, studentId }]);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, views: f.views + 1 } : f));
      addLog(studentId, 'طالب', `مشاهدة الملف: ${targetFile?.title || 'ملف'}`);
    }
  };

  const addComment = (fileId: string, content: string) => {
      if(!currentUser || !content.trim()) return;
      const targetFile = files.find(f => f.id === fileId);
      const newComment: Comment = {
          id: Math.random().toString(36).substr(2, 9),
          userId: currentUser.id,
          userName: currentUser.name,
          content: content,
          createdAt: new Date().toISOString()
      };
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, comments: [...(f.comments || []), newComment] } : f));
      addLog(currentUser.id, currentUser.name, `إضافة تعليق على: ${targetFile?.title || 'ملف'}`);
  };

  const updateComment = (fileId: string, commentId: string, newContent: string) => {
      if (!currentUser) return;
      const targetFile = files.find(f => f.id === fileId);
      setFiles(prev => prev.map(f => {
          if (f.id !== fileId) return f;
          return {
              ...f,
              comments: f.comments.map(c => c.id === commentId ? { ...c, content: newContent, updatedAt: new Date().toISOString() } : c)
          };
      }));
      addLog(currentUser.id, currentUser.name, `تعديل تعليق على: ${targetFile?.title || 'ملف'}`);
  };

  const deleteComment = (fileId: string, commentId: string) => {
      if (!currentUser) return;
      const targetFile = files.find(f => f.id === fileId);
      setFiles(prev => prev.map(f => {
          if (f.id !== fileId) return f;
          return {
              ...f,
              comments: f.comments.filter(c => c.id !== commentId)
          };
      }));
      addLog(currentUser.id, currentUser.name, `حذف تعليق من: ${targetFile?.title || 'ملف'}`);
  };

  const addSection = (title: string) => {
    setSections(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), title }]);
    addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `إضافة قسم جديد: ${title}`);
  };
  
  const updateSection = (id: string, title: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, title } : s));
    addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `تعديل قسم: ${title}`);
  };

  const deleteSection = (id: string) => {
      const sectionId = id;
      const subjectsToDelete = subjects.filter(s => s.sectionId === sectionId);
      const subjectIds = subjectsToDelete.map(s => s.id);
      
      setFiles(prev => prev.filter(f => !subjectIds.includes(f.subjectId)));
      setSubjects(prev => prev.filter(s => s.sectionId !== sectionId));
      setSections(prev => prev.filter(s => s.id !== sectionId));
      setUsers(prev => prev.map(u => u.sectionId === sectionId ? { ...u, sectionId: '' } : u));
      
      if (currentUser?.sectionId === sectionId) {
          setCurrentUser(prev => prev ? { ...prev, sectionId: '' } : null);
      }
      
      addLog(currentUser?.id || 'admin', 'المطور', 'حذف قسم دراسي ومحتوياته وتحديث الطلاب');
  };

  const addSubject = (title: string, sectionId: string) => {
    setSubjects(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), title, sectionId }]);
    addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `إضافة مادة: ${title}`);
  };

  const updateSubject = (id: string, title: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, title } : s));
    addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', `تعديل مادة: ${title}`);
  };

  const deleteSubject = (id: string) => {
      setFiles(prev => prev.filter(f => f.subjectId !== id));
      setSubjects(prev => prev.filter(s => s.id !== id));
      addLog(currentUser?.id || 'admin', 'المطور', 'حذف مادة دراسية ومحتوياتها');
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  const updateSystemMessage = (msg: SystemMessage) => {
      setSystemMessage(prev => ({ ...prev, ...msg }));
      addLog(currentUser?.id || 'sys', currentUser?.name || 'مسؤول', 'تحديث رسالة النظام');
  };
  
  const sendNotification = (userId: string, message: string) => {
      const newNotif: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          userId,
          message,
          isRead: false,
          createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
  };
  
  const broadcastNotification = (message: string) => {
      const newNotifs = users.map(u => ({
          id: Math.random().toString(36).substr(2, 9),
          userId: u.id,
          message,
          isRead: false,
          createdAt: new Date().toISOString()
      }));
      setNotifications(prev => [...newNotifs, ...prev]);
  };
  
  const markNotificationsRead = (userId: string) => {
      setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
  };
  
  return (
    <AppContext.Provider value={{
      users, currentUser, sections, subjects, files, logs, viewRecords, verificationCodes, globalPasswordLength, phoneNumberLength, theme, passwordPrefix, enablePrefixInAuto, enablePrefixInCodes, generateAlphanumericPasswords, systemMessage, notifications, toastMessage, permissionError, otpApiToken, zoomLevel, timeFormat, codeGetUrl, codePrefix, chatMessages, chatSettings, sendChatMessage, editChatMessage, deleteChatMessage, reactToMessage, toggleChatLock, clearChat, toggleChatBan, updateForbiddenWords, markChatMessagesAsViewed,
      login, logout, checkPhoneAvailability, sendOtp: async () => {}, verifyOtpCode: async () => true, registerStudent, registerSubAdmin, addUser, importUsers, updateUser, deleteUser,
      addFile, updateFile, deleteFile, logFileView, addComment, updateComment, deleteComment, addSection, updateSection, deleteSection, addSubject, updateSubject, deleteSubject, setGlobalPasswordLength: (l) => { setGlobalPasswordLength(l); addLog(currentUser?.id||'sys', 'مسؤول', 'تحديث طول كلمة المرور'); }, setPhoneNumberLength: (l) => { setPhoneNumberLength(l); addLog(currentUser?.id||'sys', 'مسؤول', 'تحديث طول الهاتف'); }, toggleTheme,
      setPasswordPrefix: (p) => { setPasswordPrefix(p); addLog(currentUser?.id||'sys', 'مسؤول', 'تحديث بادئة كلمة المرور'); }, setEnablePrefixInAuto: (v) => { setEnablePrefixInAuto(v); addLog(currentUser?.id||'sys', 'مسؤول', `تغيير تفعيل البادئة التلقائية: ${v}`); }, setEnablePrefixInCodes: (v) => { setEnablePrefixInCodes(v); addLog(currentUser?.id||'sys', 'مسؤول', `تغيير تفعيل البادئة في الأكواد: ${v}`); }, setGenerateAlphanumericPasswords: (v) => { setGenerateAlphanumericPasswords(v); addLog(currentUser?.id||'sys', 'مسؤول', `تغيير نوع كلمات المرور (ارقام وحروف): ${v}`); }, updateSystemMessage, changePassword, sendNotification, broadcastNotification, markNotificationsRead, completeUserProfile, forceFullDataUpdateAll, setOtpApiToken,
      showToast, triggerPermissionError, setZoomLevel, generateVerificationCodes, validateAndUseCode, deleteVerificationCode, deleteAllVerificationCodes, deleteUnusedVerificationCodes, deleteUsedVerificationCodes, exportCodesToCSV, exportUsersToCSV, setTimeFormat: (f) => { setTimeFormat(f); addLog(currentUser?.id||'sys', 'مسؤول', 'تغيير تنسيق الوقت'); }, setCodeGetUrl: (u) => { setCodeGetUrl(u); addLog(currentUser?.id||'sys', 'مسؤول', 'تغيير رابط الكود'); }, setCodePrefix: (p) => { setCodePrefix(p); addLog(currentUser?.id||'sys', 'مسؤول', 'تغيير بادئة الكود'); }, formatTime, toggleForceUpdateUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useStore must be used within AppProvider");
  return context;
};
