
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../services/store';
import { UserRole, ChatMessage, User } from '../types';
import { MessageCircle, X, Send, Paperclip, Bot, Smile, MoreVertical, Trash2, Lock, Unlock, Eye, EyeOff, User as UserIcon, Minimize2, Maximize2, ChevronLeft, ChevronRight, Ban, Plus, Sparkles, Edit2, Phone, Calendar, Info, Check, Image as ImageIcon, Mic, Video } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const GlobalChat: React.FC = () => {
    const { currentUser, chatMessages, sendChatMessage, editChatMessage, deleteChatMessage, reactToMessage, toggleChatLock, chatSettings, clearChat, users, toggleChatBan, updateForbiddenWords, showToast, files, markChatMessagesAsViewed } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [message, setMessage] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
    const [messageMenuId, setMessageMenuId] = useState<string | null>(null); // For message specific menu
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isPickerExpanded, setIsPickerExpanded] = useState(false);
    
    // AI State
    const [isAiMode, setIsAiMode] = useState(false);
    const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
    const [aiIsTyping, setAiIsTyping] = useState(false);
    
    // Unread Counter State
    const [unreadCount, setUnreadCount] = useState(0);
    const prevMessagesLen = useRef(chatMessages.length);
    
    // Editing State
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    
    // User Profile Modal State
    const [viewingChatUser, setViewingChatUser] = useState<User | null>(null);
    
    // Message Viewers Modal
    const [viewersModalMsgId, setViewersModalMsgId] = useState<string | null>(null);
    
    // Admin toggles & settings
    const [forceHideNames, setForceHideNames] = useState(false); 
    const [showWordFilterModal, setShowWordFilterModal] = useState(false);
    const [forbiddenWordsInput, setForbiddenWordsInput] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isDev = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUB_ADMIN;
    const isBanned = currentUser && chatSettings.bannedUsers.includes(currentUser.id);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, aiMessages, isOpen, isMaximized, isAiMode]);

    // Handle Unread Count & Marking Views
    useEffect(() => {
        if (chatMessages.length > prevMessagesLen.current) {
            const lastMsg = chatMessages[chatMessages.length - 1];
            if (!isOpen && lastMsg?.userId !== currentUser.id) {
                setUnreadCount(prev => prev + 1);
            }
        }
        prevMessagesLen.current = chatMessages.length;
    }, [chatMessages, isOpen, currentUser.id]);

    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
            markChatMessagesAsViewed();
        }
    }, [isOpen]);

    useEffect(() => {
        if (showWordFilterModal) {
            setForbiddenWordsInput(chatSettings.forbiddenWords.join('\n'));
        }
    }, [showWordFilterModal, chatSettings.forbiddenWords]);

    // AI Greeting Effect
    useEffect(() => {
        if (isAiMode && aiMessages.length === 0) {
            const greeting: ChatMessage = {
                id: 'ai-init',
                userId: 'ai-bot',
                userName: 'المساعد الذكي',
                userRole: UserRole.ADMIN,
                content: `مرحباً يا ${currentUser?.name} 👋\nأي الأخبار وازاي اقدر اساعدك النهاردة؟`,
                type: 'TEXT',
                timestamp: new Date().toISOString(),
                reactions: {},
                isAnonymous: false
            };
            setAiMessages([greeting]);
        }
    }, [isAiMode, currentUser?.name]);

    if (!currentUser) return null;

    const handleAiResponse = async (userMsg: string, history: ChatMessage[] = []) => {
        setAiIsTyping(true);
        try {
            const filesContext = files.map(f => `- ${f.title} (${f.type})`).join('\n');
            const systemPrompt = `
                You are a helpful and friendly AI assistant for a student platform named "المذاكرة" (Al-Mathakara).
                Your name is "المساعد الذكي".
                The user's name is "${currentUser.name}".
                Here is a list of educational files currently available on the platform:
                ${filesContext}
                Answer strictly in Arabic (Egyptian dialect preferred).
                Be concise and helpful.
            `;

            // Build history context
            const historyParts = history.map(msg => ({
                role: msg.userId === 'ai-bot' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            // Add current user message
            const contents = [
                ...historyParts,
                { role: 'user', parts: [{ text: systemPrompt + "\n\nUser Question: " + userMsg }] }
            ];

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Using Flash model for speed as requested
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: contents
            });

            const aiText = response.text || "عذراً، حدث خطأ في الاتصال.";

            const aiMsg: ChatMessage = {
                id: Math.random().toString(),
                userId: 'ai-bot',
                userName: 'المساعد الذكي',
                userRole: UserRole.ADMIN,
                content: aiText,
                type: 'TEXT',
                timestamp: new Date().toISOString(),
                reactions: {},
                isAnonymous: false
            };
            setAiMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error(error);
            const errorMsg: ChatMessage = {
                id: Math.random().toString(),
                userId: 'ai-bot',
                userName: 'المساعد الذكي',
                userRole: UserRole.ADMIN,
                content: "عذراً، أواجه مشكلة تقنية حالياً. يرجى المحاولة لاحقاً.",
                type: 'TEXT',
                timestamp: new Date().toISOString(),
                reactions: {},
                isAnonymous: false
            };
            setAiMessages(prev => [...prev, errorMsg]);
        } finally {
            setAiIsTyping(false);
        }
    };

    const handleSend = () => {
        if (!message.trim()) return;

        if (isAiMode) {
            const userMsg: ChatMessage = {
                id: Math.random().toString(),
                userId: currentUser.id,
                userName: currentUser.name,
                userRole: currentUser.role,
                content: message,
                type: 'TEXT',
                timestamp: new Date().toISOString(),
                reactions: {},
                isAnonymous: false
            };
            
            // Current history excluding the initial prompt for logic simplicity
            const currentHistory = aiMessages.filter(m => m.id !== 'ai-init');
            
            setAiMessages(prev => [...prev, userMsg]);
            const msgToSend = message;
            setMessage('');
            handleAiResponse(msgToSend, currentHistory);
        } else {
            sendChatMessage(message, 'TEXT', isAnonymous);
            setMessage('');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isAiMode) return;
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                let type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT' = 'TEXT';
                if (file.type.startsWith('image/')) type = 'IMAGE';
                else if (file.type.startsWith('video/')) type = 'VIDEO';
                else if (file.type.startsWith('audio/')) type = 'AUDIO';
                
                sendChatMessage(event.target.result as string, type, isAnonymous);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAvatarClick = (msg: ChatMessage) => {
        if (msg.userId === 'ai-bot') return;
        const isHidden = msg.isAnonymous && !isDev && msg.userId !== currentUser.id;
        if (isHidden) return;

        const user = users.find(u => u.id === msg.userId);
        if (user) {
            setViewingChatUser(user);
        }
    };

    const startEditing = (msg: ChatMessage) => {
        setEditingMessageId(msg.id);
        setEditContent(msg.content);
        setMessageMenuId(null); 
    };

    const cancelEditing = () => {
        setEditingMessageId(null);
        setEditContent('');
    };

    const saveEdit = (msgId: string) => {
        if (editContent.trim()) {
            if (isAiMode) {
                // Logic for AI Mode: Edit User Message -> Delete subsequent AI response -> Regenerate
                const msgIndex = aiMessages.findIndex(m => m.id === msgId);
                if (msgIndex !== -1) {
                    const newMessages = [...aiMessages];
                    newMessages[msgIndex].content = editContent;
                    newMessages[msgIndex].isEdited = true;
                    
                    // Remove the *next* message if it is from AI
                    if (newMessages[msgIndex + 1] && newMessages[msgIndex + 1].userId === 'ai-bot') {
                        newMessages.splice(msgIndex + 1, 1);
                    }
                    
                    setAiMessages(newMessages);
                    setEditingMessageId(null);
                    setEditContent('');
                    
                    // Trigger AI generation again with history up to this point
                    const historyBefore = newMessages.slice(0, msgIndex).filter(m => m.id !== 'ai-init');
                    handleAiResponse(editContent, historyBefore);
                }
            } else {
                editChatMessage(msgId, editContent);
                setEditingMessageId(null);
                setEditContent('');
            }
        }
    };
    
    const handleDeleteMessage = (msgId: string) => {
        if (isAiMode) {
            const msgIndex = aiMessages.findIndex(m => m.id === msgId);
            if (msgIndex !== -1) {
                const newMessages = [...aiMessages];
                // Check if next message is AI, if so delete it too
                if (newMessages[msgIndex + 1] && newMessages[msgIndex + 1].userId === 'ai-bot') {
                    newMessages.splice(msgIndex, 2); // Delete user msg + ai response
                } else {
                    newMessages.splice(msgIndex, 1); // Just delete user msg
                }
                setAiMessages(newMessages);
            }
        } else {
            deleteChatMessage(msgId);
        }
    };

    const handleReaction = (msgId: string, emoji: string) => {
        if (isAiMode) {
            setAiMessages(prev => prev.map(msg => {
                if (msg.id !== msgId) return msg;
                const newReactions = { ...msg.reactions };
                const alreadyReacted = newReactions[emoji]?.includes(currentUser.id);
                
                Object.keys(newReactions).forEach(key => {
                    newReactions[key] = newReactions[key].filter(uid => uid !== currentUser.id);
                    if (newReactions[key].length === 0) delete newReactions[key];
                });

                if (!alreadyReacted) {
                    if (!newReactions[emoji]) newReactions[emoji] = [];
                    newReactions[emoji].push(currentUser.id);
                }
                return { ...msg, reactions: newReactions };
            }));
        } else {
            reactToMessage(msgId, emoji);
        }
    };

    const saveForbiddenWords = () => {
        const words = forbiddenWordsInput.split('\n').map(w => w.trim()).filter(w => w);
        updateForbiddenWords(words);
        setShowWordFilterModal(false);
        showToast('تم تحديث قائمة الكلمات المحظورة');
    };

    const handleBanUser = (userId: string) => {
        toggleChatBan(userId);
        setViewingChatUser(prev => prev ? { ...prev } : null);
    };

    const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👋', '🔥'];

    const currentMessages = isAiMode ? aiMessages : chatMessages;

    // Viewers Logic
    const getViewersForMessage = (msg: ChatMessage) => {
        if (!msg.viewedBy) return [];
        return users.filter(u => msg.viewedBy?.includes(u.id));
    };

    // Helper to get last few messages for preview (that are NOT from current user)
    const getPreviewMessages = () => {
        return chatMessages
            .filter(m => m.userId !== currentUser.id)
            .slice(-3); // Get last 3
    };

    // Docked State
    if (isHidden) {
        return (
            <button 
                onClick={() => setIsHidden(false)}
                className="fixed bottom-20 left-0 z-[100] bg-space-800 text-space-accent p-2 rounded-r-xl shadow-lg border-y border-r border-space-700 hover:pl-4 transition-all flex items-center gap-2"
                title="إظهار المحادثة"
            >
                <div className="relative">
                    <MessageCircle size={20} />
                    {unreadCount > 0 && !isAiMode && (
                        <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-space-800 shadow-md">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                    )}
                </div>
                <ChevronRight size={16} />
            </button>
        );
    }

    if (!isOpen) {
        const previews = getPreviewMessages();
        return (
            <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-4 group">
                
                {/* Message Previews Floating Stack */}
                {unreadCount > 0 && previews.length > 0 && (
                    <div className="flex flex-col gap-2 mb-2 w-64 items-start animate-fade-in-up">
                        {previews.map((msg, idx) => {
                            const isLast = idx === previews.length - 1;
                            const displayName = (msg.isAnonymous && !isDev) ? 'مجهول' : msg.userName;
                            return (
                                <div 
                                    key={msg.id} 
                                    onClick={() => setIsOpen(true)}
                                    className={`bg-space-800/90 backdrop-blur-md border border-space-700 p-3 rounded-xl rounded-bl-none shadow-xl cursor-pointer hover:bg-space-700 transition-colors w-full relative ${isLast ? 'scale-100' : 'scale-95 opacity-80'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold ${msg.userRole === UserRole.ADMIN ? 'text-red-400' : 'text-space-accent'}`}>{displayName}</span>
                                        <span className="text-[9px] text-muted">{new Date(msg.timestamp).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div className="text-xs text-white truncate">
                                        {msg.type === 'TEXT' && msg.content}
                                        {msg.type === 'IMAGE' && <span className="flex items-center gap-1 text-blue-400"><ImageIcon size={12}/> صورة</span>}
                                        {msg.type === 'AUDIO' && <span className="flex items-center gap-1 text-purple-400"><Mic size={12}/> تسجيل صوتي</span>}
                                        {msg.type === 'VIDEO' && <span className="flex items-center gap-1 text-green-400"><Video size={12}/> فيديو</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsHidden(true)}
                        className="bg-space-800 text-muted p-2 rounded-full shadow-lg border border-space-700 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="إخفاء جانبي"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="bg-space-accent text-space-900 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform animate-float relative"
                    >
                        <MessageCircle size={28} />
                        {unreadCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold h-6 min-w-[24px] px-1 rounded-full flex items-center justify-center border-2 border-space-900 shadow-sm animate-bounce z-50 font-sans">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    if (!isMaximized && !isOpen) return null;

    const containerClasses = isMaximized 
        ? "fixed inset-0 z-[100] bg-space-900 flex flex-col animate-fade-in"
        : "fixed bottom-6 left-6 z-[100] bg-space-800 border border-space-700 rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col h-[500px] overflow-hidden animate-fade-in-up";

    return (
        <div className={containerClasses}>
            {/* Header */}
            <div className="bg-space-900 p-3 border-b border-space-700 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${isAiMode ? 'bg-blue-500' : 'bg-green-500'} rounded-full animate-pulse`}></div>
                    <span className="font-bold text-main">{isAiMode ? 'المساعد الذكي' : 'محادثة جماعية'}</span>
                    {!isAiMode && chatSettings.isLocked && <Lock size={14} className="text-red-400" />}
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsAiMode(!isAiMode)} 
                        className={`p-1.5 rounded transition-colors ${isAiMode ? 'bg-blue-500/20 text-blue-400' : 'text-muted hover:text-white hover:bg-space-700'}`}
                        title={isAiMode ? "العودة للشات الجماعي" : "المساعد الذكي"}
                    >
                        {isAiMode ? <MessageCircle size={18} /> : <Bot size={18} />}
                    </button>

                    {isDev && !isAiMode && (
                        <div className="relative">
                            <button onClick={() => setShowOptions(!showOptions)} className="p-1 hover:bg-space-700 rounded text-muted">
                                <MoreVertical size={16} />
                            </button>
                            {showOptions && (
                                <div className="absolute top-8 left-0 bg-space-800 border border-space-700 rounded-lg shadow-xl w-48 p-2 z-50">
                                    <button onClick={toggleChatLock} className="flex items-center gap-2 w-full p-2 hover:bg-space-700 rounded text-xs text-main">
                                        {chatSettings.isLocked ? <Unlock size={14}/> : <Lock size={14}/>} {chatSettings.isLocked ? 'فتح المحادثة' : 'قفل المحادثة'}
                                    </button>
                                    <button onClick={() => setForceHideNames(!forceHideNames)} className="flex items-center gap-2 w-full p-2 hover:bg-space-700 rounded text-xs text-main">
                                        {forceHideNames ? <Eye size={14}/> : <EyeOff size={14}/>} {forceHideNames ? 'إظهار الأسماء' : 'إخفاء الأسماء'}
                                    </button>
                                    <button onClick={() => { setShowWordFilterModal(true); setShowOptions(false); }} className="flex items-center gap-2 w-full p-2 hover:bg-space-700 rounded text-xs text-main">
                                        <Ban size={14}/> الكلمات المحظورة
                                    </button>
                                    <button onClick={() => { clearChat(); setShowOptions(false); }} className="flex items-center gap-2 w-full p-2 hover:bg-red-500/20 text-red-400 rounded text-xs">
                                        <Trash2 size={14}/> مسح المحادثة
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <button onClick={() => setIsHidden(true)} className="text-muted hover:text-white" title="إخفاء جانبي"><ChevronLeft size={16} /></button>
                    <button onClick={() => setIsMaximized(!isMaximized)} className="text-muted hover:text-white">
                        {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="text-muted hover:text-white"><X size={16} /></button>
                </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-black/20 flex flex-col" onClick={() => { setActiveMessageId(null); setMessageMenuId(null); }}>
                <div className="flex-1" />
                {currentMessages.map(msg => {
                    const isMe = msg.userId === currentUser.id;
                    const isBot = msg.userId === 'ai-bot';
                    const showName = isBot || isDev || (!msg.isAnonymous && !forceHideNames) || isMe;
                    const sender = isBot ? { avatarUrl: null, name: 'المساعد الذكي' } : users.find(u => u.id === msg.userId);
                    const canViewProfile = !isBot && (!msg.isAnonymous || isDev || isMe);
                    const isEditing = editingMessageId === msg.id;
                    const isMedia = msg.type !== 'TEXT';
                    
                    // Show menu if it's my message (edit/delete) OR if I'm dev (delete/viewers)
                    // HIDE menu completely for AI messages
                    const showMenuButton = !isBot && (isMe || isDev);

                    const activeReactions = Object.entries(msg.reactions).filter(([_, users]) => (users as string[]).length > 0);
                    const visibleReactions = activeReactions.slice(0, 4);
                    const displayedEmojis = isPickerExpanded ? emojis : emojis.slice(0, 4);

                    return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row' : 'flex-row-reverse'} items-end w-full mb-4 group/row`}>
                            
                            <div 
                                onClick={() => handleAvatarClick(msg)}
                                className={`shrink-0 w-8 h-8 rounded-full border border-space-700 overflow-hidden ${canViewProfile ? 'cursor-pointer hover:border-space-accent hover:scale-105' : 'cursor-default opacity-80'} transition-all flex items-center justify-center bg-space-800`}
                            >
                                {isBot ? (
                                    <Bot size={18} className="text-blue-400" />
                                ) : (canViewProfile && sender?.avatarUrl) ? (
                                    <img src={sender.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={16} className="text-muted" />
                                )}
                            </div>

                            <div className={`flex flex-col ${isMe ? 'items-start' : 'items-end'} max-w-[80%] relative`}>
                                {showName && (
                                    <span className="text-[10px] text-muted mb-1 px-1">{msg.userName}</span>
                                )}

                                <div className="relative group">
                                    <div 
                                        className={`relative text-sm transition-transform ${
                                            isMedia 
                                                ? 'bg-transparent p-0 border-none shadow-none'
                                                : `p-3 rounded-2xl shadow-md ${isMe ? 'bg-space-accent text-space-900 rounded-tr-none' : isBot ? 'bg-space-800 border border-blue-500/30 text-main rounded-tl-none' : 'bg-space-700 text-main rounded-tl-none'}`
                                        }`}
                                    >
                                        {isEditing ? (
                                            <div className="flex flex-col gap-2 min-w-[200px] bg-space-800 p-2 rounded-lg">
                                                <input 
                                                    value={editContent}
                                                    onChange={e => setEditContent(e.target.value)}
                                                    className="w-full bg-black/20 rounded p-1 text-sm outline-none border border-transparent focus:border-white/20 text-white"
                                                    autoFocus
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') saveEdit(msg.id);
                                                        if (e.key === 'Escape') cancelEditing();
                                                    }}
                                                />
                                                <div className="flex justify-end gap-2 text-[10px]">
                                                    <button onClick={() => saveEdit(msg.id)} className="text-green-400 font-bold hover:underline">حفظ</button>
                                                    <button onClick={cancelEditing} className="text-red-400 font-bold hover:underline">إلغاء</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {msg.type === 'TEXT' && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                                                {msg.type === 'IMAGE' && <img src={msg.content} alt="shared" className="rounded-xl max-h-60 object-cover shadow-lg hover:scale-[1.02] transition-transform cursor-pointer" />}
                                                {msg.type === 'VIDEO' && <video src={msg.content} controls className="rounded-xl max-h-60 w-full shadow-lg" />}
                                                {msg.type === 'AUDIO' && <div className="shadow-lg rounded-full overflow-hidden"><audio src={msg.content} controls className="w-full min-w-[250px] bg-space-800" /></div>}
                                                {msg.isEdited && <span className={`text-[9px] opacity-60 block text-left mt-1 italic ${isMedia ? 'text-white drop-shadow-md' : ''}`}>(معدل)</span>}
                                            </>
                                        )}
                                        
                                        {/* Reactions - Enabled for BOT too */}
                                        {activeReactions.length > 0 && (
                                            <div className={`absolute -bottom-5 left-1/2 transform -translate-x-1/2 flex items-center gap-1 rounded-full px-1.5 py-0.5 shadow-lg z-10 min-w-max ${isMedia ? 'bg-black/70 backdrop-blur-sm border border-white/10' : 'bg-space-800'}`}>
                                                {visibleReactions.map(([emoji, users]) => {
                                                    const isReactedByMe = (users as string[]).includes(currentUser.id);
                                                    return (
                                                        <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReaction(msg.id, emoji); }} className={`flex items-center gap-0.5 px-1 rounded-full transition-all animate-fade-in ${isReactedByMe ? 'bg-space-accent/20 text-space-accent' : 'hover:bg-space-700 text-muted'}`}>
                                                            <span className="text-[12px] leading-none">{emoji}</span>
                                                            <span className="text-[10px] font-bold">{(users as string[]).length}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Interactions - Show Smile even for Bot */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setActiveMessageId(activeMessageId === msg.id ? null : msg.id); setIsPickerExpanded(false); setMessageMenuId(null); }}
                                            className={`absolute top-1/2 transform -translate-y-1/2 ${isMe ? '-left-8' : '-right-8'} text-slate-400 hover:text-yellow-400 transition-colors opacity-0 group-hover:opacity-100 p-2 z-30`}
                                        >
                                            <Smile size={16} />
                                        </button>
                                    </div>

                                    {/* Combined Actions Menu Button - HIDE FOR BOT */}
                                    {showMenuButton && (
                                        <div className={`absolute top-1/2 transform -translate-y-1/2 ${isMe ? '-left-14' : '-right-14'} z-20 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setMessageMenuId(messageMenuId === msg.id ? null : msg.id); setActiveMessageId(null); }}
                                                className="p-1.5 bg-space-800 rounded-full text-muted hover:text-white shadow-sm border border-space-700"
                                            >
                                                <MoreVertical size={14} />
                                            </button>
                                            
                                            {/* Dropdown Menu - UPDATED: Show ABOVE */}
                                            {messageMenuId === msg.id && (
                                                <div className="absolute bottom-full mb-2 bg-space-800 border border-space-700 rounded-lg shadow-xl py-1 min-w-[120px] z-50 overflow-hidden animate-fade-in">
                                                    {/* Hide Viewers for AI Mode entirely */}
                                                    {isDev && !isAiMode && (
                                                        <button 
                                                            onClick={() => { setViewersModalMsgId(msg.id); setMessageMenuId(null); }}
                                                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-main hover:bg-space-700"
                                                        >
                                                            <Eye size={14} className="text-blue-400"/> المشاهدات
                                                        </button>
                                                    )}
                                                    {isMe && msg.type === 'TEXT' && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); startEditing(msg); }} 
                                                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-main hover:bg-space-700"
                                                        >
                                                            <Edit2 size={14} className="text-green-400"/> تعديل
                                                        </button>
                                                    )}
                                                    {(isDev || isMe) && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }} 
                                                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                                                        >
                                                            <Trash2 size={14}/> حذف
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Emoji Picker - UPDATED: Show ABOVE */}
                                    {activeMessageId === msg.id && (
                                        <div className={`absolute bottom-full mb-2 ${isMe ? 'right-0' : 'left-0'} bg-space-800 border border-space-700 rounded-full p-1.5 flex flex-col md:flex-row gap-1 z-50 shadow-2xl animate-fade-in w-max`}>
                                            <div className="flex gap-1">
                                                {displayedEmojis.map(e => (
                                                    <button key={e} onClick={(ev) => { ev.stopPropagation(); handleReaction(msg.id, e); setActiveMessageId(null); }} className="hover:scale-125 transition-transform p-1 text-sm leading-none">{e}</button>
                                                ))}
                                            </div>
                                            {!isPickerExpanded && (
                                                <button onClick={(ev) => { ev.stopPropagation(); setIsPickerExpanded(true); }} className="hover:scale-125 transition-transform p-1 text-sm leading-none flex items-center justify-center text-muted hover:text-white"><Plus size={14} /></button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {aiIsTyping && (
                    <div className="flex gap-3 flex-row-reverse items-end w-full mb-4">
                         <div className="shrink-0 w-8 h-8 rounded-full bg-space-800 flex items-center justify-center border border-space-700">
                             <Bot size={18} className="text-blue-400" />
                         </div>
                         <div className="bg-space-800 border border-blue-500/30 p-3 rounded-2xl rounded-tl-none">
                             <div className="flex gap-1">
                                 <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                 <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                                 <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                             </div>
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area ... */}
            {(!chatSettings.isLocked || isDev || isAiMode) && !isBanned ? (
                <div className="bg-space-900 p-2 border-t border-space-700 shrink-0">
                    {!isDev && !isAiMode && (
                        <div className="flex items-center gap-2 mb-2 px-2">
                            <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="accent-space-accent w-3 h-3"/>
                            <span className="text-[10px] text-muted">إخفاء هويتي</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        {!isAiMode && (
                            <button onClick={() => fileInputRef.current?.click()} className="text-muted hover:text-space-accent p-2 hover:bg-space-800 rounded-full transition-colors">
                                <Paperclip size={20}/>
                            </button>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*,audio/*" onChange={handleFileUpload} />
                        
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                value={message} 
                                onChange={e => setMessage(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder={isAiMode ? "اسأل المساعد الذكي..." : "اكتب رسالة..."}
                                className={`w-full bg-space-800 border ${isAiMode ? 'border-blue-500/30 focus:border-blue-500' : 'border-space-700 focus:border-space-accent'} rounded-full px-4 py-2 text-sm text-main outline-none`}
                            />
                        </div>
                        
                        <button 
                            onClick={handleSend} 
                            disabled={!message.trim()}
                            className={`p-2 rounded-full transition-colors ${message.trim() ? (isAiMode ? 'bg-blue-500 text-white' : 'bg-yellow-400 text-space-900') : 'bg-space-700 text-muted'}`}
                        >
                            {isAiMode ? <Sparkles size={18} /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-space-900 p-4 text-center text-xs text-red-400 border-t border-space-700 font-bold shrink-0">
                    {isBanned ? 'تم حظرك من المحادثة الجماعية' : 'المحادثة مغلقة من قبل الإدارة'}
                </div>
            )}

            {/* ... Modals (Viewers, Profile, Word Filter) ... */}
            {viewersModalMsgId && !isAiMode && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-space-800 border border-space-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[80%]">
                        <div className="p-4 border-b border-space-700 flex justify-between items-center bg-space-900">
                            <h3 className="font-bold text-main flex items-center gap-2"><Eye size={18} className="text-blue-400"/> تمت المشاهدة بواسطة</h3>
                            <button onClick={() => setViewersModalMsgId(null)}><X size={18} className="text-muted hover:text-white"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                            {getViewersForMessage(chatMessages.find(m => m.id === viewersModalMsgId)!).length > 0 ? (
                                getViewersForMessage(chatMessages.find(m => m.id === viewersModalMsgId)!).map(viewer => (
                                    <div key={viewer.id} className="flex items-center gap-3 p-3 hover:bg-space-700/50 rounded-lg transition-colors border-b border-space-700/30 last:border-0">
                                        {viewer.avatarUrl ? (
                                            <img src={viewer.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-space-600" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-space-900 flex items-center justify-center text-space-accent text-xs font-bold border border-space-600">
                                                <UserIcon size={14} />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-main">{viewer.name}</span>
                                            <span className="text-[10px] text-muted">{viewer.role === UserRole.STUDENT ? 'طالب' : 'مطور'}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted text-sm py-8">لم يشاهد أحد هذه الرسالة بعد</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* User Profile Modal & Forbidden Words Modal ... (Kept existing) */}
             {viewingChatUser && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-space-800 border border-space-700 rounded-2xl w-64 shadow-2xl overflow-hidden relative">
                        <button 
                            onClick={() => setViewingChatUser(null)}
                            className="absolute top-2 right-2 text-muted hover:text-white bg-space-900/50 rounded-full p-1"
                        >
                            <X size={16} />
                        </button>
                        <div className="flex flex-col items-center pt-6 pb-4 bg-gradient-to-b from-space-700 to-space-800">
                            {viewingChatUser.avatarUrl ? (
                                <img src={viewingChatUser.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-space-accent shadow-lg mb-2" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-space-900 flex items-center justify-center border-2 border-space-accent text-space-accent mb-2">
                                    <UserIcon size={32} />
                                </div>
                            )}
                            <h3 className="font-bold text-main text-lg">{viewingChatUser.name}</h3>
                            <span className="text-xs text-muted">
                                {viewingChatUser.role === UserRole.ADMIN ? 'مطور رئيسي' : 
                                 viewingChatUser.role === UserRole.SUB_ADMIN ? 'مطور فرعي' : 'طالب'}
                            </span>
                            {isDev && viewingChatUser.id !== currentUser.id && (
                                <button 
                                    onClick={() => handleBanUser(viewingChatUser.id)}
                                    className={`mt-2 flex items-center gap-1 px-3 py-1 rounded text-xs font-bold ${chatSettings.bannedUsers.includes(viewingChatUser.id) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                                >
                                    <Ban size={12} /> {chatSettings.bannedUsers.includes(viewingChatUser.id) ? 'إلغاء الحظر' : 'حظر من الشات'}
                                </button>
                            )}
                        </div>
                        <div className="p-4 space-y-3">
                            {(currentUser.role === UserRole.ADMIN || (currentUser.role === UserRole.SUB_ADMIN && viewingChatUser.role === UserRole.STUDENT)) && (
                                 <div className="flex items-center gap-3 text-sm">
                                    <Phone size={16} className="text-space-accent" />
                                    <span className="text-main font-mono">{viewingChatUser.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <UserIcon size={16} className="text-space-accent" />
                                <span className="text-main">{viewingChatUser.gender === 'MALE' ? 'ذكر' : viewingChatUser.gender === 'FEMALE' ? 'أنثى' : 'غير محدد'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar size={16} className="text-space-accent" />
                                <span className="text-main">{viewingChatUser.birthDate || 'غير محدد'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Info size={16} className="text-space-accent" />
                                <span className="text-main text-xs">انضم: {new Date(viewingChatUser.createdAt).toLocaleDateString('ar-EG')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showWordFilterModal && (
                 <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-space-800 border border-space-700 rounded-2xl w-full max-w-sm shadow-2xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-main flex items-center gap-2"><Ban size={18} className="text-red-400"/> الكلمات المحظورة</h3>
                            <button onClick={() => setShowWordFilterModal(false)}><X size={18} className="text-muted"/></button>
                        </div>
                        <p className="text-xs text-muted mb-2">أدخل الكلمات التي تريد حظرها في الشات، كل كلمة في سطر.</p>
                        <textarea 
                            value={forbiddenWordsInput}
                            onChange={e => setForbiddenWordsInput(e.target.value)}
                            className="w-full h-32 bg-space-900 border border-space-700 rounded p-2 text-main text-sm outline-none resize-none mb-4"
                            placeholder="كلمة1&#10;كلمة2"
                        />
                        <button onClick={saveForbiddenWords} className="w-full bg-space-accent text-space-900 font-bold py-2 rounded hover:bg-yellow-400">حفظ</button>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default GlobalChat;
