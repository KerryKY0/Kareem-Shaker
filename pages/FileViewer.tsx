
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../services/store';
import Watermark from '../components/Watermark';
import { FileType, UserRole } from '../types';
import { ChevronLeft, AlertTriangle, ZoomIn, ZoomOut, Download, MessageSquare, Send, Maximize, Minimize, Trash2, Edit, X, RotateCw } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

// تثبيت نسخة الـ Worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.3.136/build/pdf.worker.min.js`;

const FileViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { files, currentUser, logFileView, addComment, updateComment, deleteComment } = useStore();
  const file = files.find(f => f.id === id);
  const [scale, setScale] = useState(1.0); 
  const [rotation, setRotation] = useState(0); // New: Rotation State
  const [newComment, setNewComment] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfData, setPdfData] = useState<any>(null); 
  const [isBuffering, setIsBuffering] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Edit State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (file && currentUser) {
      logFileView(file.id, currentUser.id);
    }
  }, [file, currentUser, logFileView]);

  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
      // Auto-fit scale based on screen width for PDF initial load
      if (window.innerWidth < 768) setScale(0.6);
      else setScale(1.0);
  }, []);

  useEffect(() => {
    const loadPdfData = async () => {
        if (!file || file.type !== FileType.PDF) {
            setIsBuffering(false);
            return;
        }
        try {
            setIsBuffering(true);
            const response = await fetch(file.contentUrl);
            if (!response.ok) throw new Error('فشل تحميل الملف');
            const arrayBuffer = await response.arrayBuffer();
            setPdfData({ data: arrayBuffer });
        } catch (err: any) {
            console.error("PDF Load Error:", err);
            setErrorMsg('تعذر جلب ملف PDF.');
        } finally {
            setIsBuffering(false);
        }
    };
    loadPdfData();
  }, [file]);

  if (!file) return <div className="text-center p-10">الملف غير موجود</div>;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.1));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360); // New: Rotate Handler
  
  const canDownload = !file.preventDownload;

  const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
          containerRef.current?.requestFullscreen();
      } else {
          document.exitFullscreen();
      }
  };

  const handleSendComment = () => {
      if(newComment.trim()) {
          addComment(file.id, newComment);
          setNewComment('');
      }
  };

  const startEditing = (commentId: string, content: string) => {
      setEditingCommentId(commentId);
      setEditContent(content);
  };

  const saveEdit = () => {
      if (editingCommentId && editContent.trim()) {
          updateComment(file.id, editingCommentId, editContent);
          setEditingCommentId(null);
          setEditContent('');
      }
  };

  const confirmDelete = () => {
      if (deleteConfirmId) {
          deleteComment(file.id, deleteConfirmId);
          setDeleteConfirmId(null);
      }
  };

  const isDev = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUB_ADMIN;

  const handleBack = () => {
      if (isDev) {
          navigate('/admin/content', { state: { defaultTab: 'FILES' } });
      } else {
          navigate(-1);
      }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto space-y-4 md:space-y-6 pb-4 pt-2 md:pt-0" dir="rtl">
      <button 
        onClick={handleBack} 
        className="inline-flex items-center text-slate-400 hover:text-white mb-2 md:mb-4 w-fit transition-colors"
      >
        <ChevronLeft className="rotate-180 ml-2" size={16} />
        {isDev ? 'عودة للملفات' : 'عودة للمادة'}
      </button>

      <div 
        ref={containerRef}
        className={`bg-space-800 border border-space-700 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl relative select-none flex flex-col ${isFullscreen ? 'h-screen border-none rounded-none' : 'min-h-[85vh] h-auto'}`} 
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="p-3 md:p-4 border-b border-space-700 flex justify-between items-center bg-space-800 z-20 shadow-sm shrink-0 relative">
          <div className="flex items-center gap-3 overflow-hidden">
              <h1 className="text-base md:text-xl font-bold text-white truncate">{file.title}</h1>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
             <div className="flex items-center gap-1 bg-space-900 rounded-lg p-1 border border-space-700 hidden sm:flex">
                 <button onClick={handleZoomOut} className="p-1 hover:bg-space-700 rounded text-white" title="تصغير"><ZoomOut size={18}/></button>
                 <span className="text-xs text-muted w-10 text-center font-mono">{Math.round(scale * 100)}%</span>
                 <button onClick={handleZoomIn} className="p-1 hover:bg-space-700 rounded text-white" title="تكبير"><ZoomIn size={18}/></button>
             </div>
             
             {/* زر التدوير الجديد */}
             {file.type === FileType.PDF && (
                 <button onClick={handleRotate} className="p-2 bg-space-900 rounded-lg text-white hover:text-space-accent border border-space-700 transition-colors" title="تدوير">
                     <RotateCw size={18} />
                 </button>
             )}
             
             <button onClick={toggleFullscreen} className="p-2 bg-space-900 rounded-lg text-white hover:text-space-accent border border-space-700 transition-colors" title="ملء الشاشة">
                 {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
             </button>

             {canDownload && (
                 <a href={file.contentUrl} download={file.title} className="p-2 bg-space-900 rounded-lg text-white hover:text-space-accent border border-space-700 transition-colors">
                    <Download size={18} />
                 </a>
             )}
          </div>
        </div>

        <div className="relative flex-1 bg-black/20 overflow-auto custom-scrollbar">
            <div className={`min-h-full flex items-start justify-center p-2 md:p-4 ${file.type !== FileType.PDF ? 'items-center' : ''}`}>
               {file.type === FileType.TEXT && (
                  <div className="p-6 md:p-8 text-slate-300 leading-loose text-base md:text-lg whitespace-pre-wrap font-serif w-full max-w-3xl bg-space-900 rounded shadow-lg min-h-[500px]">
                      <p>{file.contentUrl}</p> 
                  </div>
               )}

               {file.type === FileType.PDF && (
                  <>
                     {isBuffering ? (
                        <div className="flex flex-col items-center justify-center h-full w-full mt-20">
                             <div className="w-12 h-12 border-4 border-space-700 border-t-space-accent rounded-full animate-spin mb-4"></div>
                             <p className="text-muted">جاري تحميل البيانات...</p>
                        </div>
                     ) : errorMsg ? (
                        <div className="text-center p-12 text-red-400"><p className="text-xl font-bold">{errorMsg}</p></div>
                     ) : (
                        <Document
                            file={pdfData}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={<p className="text-center text-muted mt-20">جاري المعالجة...</p>}
                            className="flex flex-col gap-4 items-center w-full"
                        >
                            {Array.from(new Array(numPages), (el, index) => (
                                <Page 
                                    key={`page_${index + 1}`} 
                                    pageNumber={index + 1} 
                                    scale={scale}
                                    rotate={rotation} // Pass rotation prop
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="shadow-2xl mb-4 max-w-full"
                                />
                            ))}
                        </Document>
                     )}
                  </>
               )}

               {file.type === FileType.VIDEO && (
                  <div className="w-full flex items-center justify-center pt-10">
                      <video 
                        controls 
                        controlsList={file.preventDownload ? "nodownload" : undefined}
                        className="max-w-full shadow-2xl rounded-lg"
                        src={file.contentUrl}
                        style={{ maxHeight: isFullscreen ? '90vh' : '70vh' }}
                      >
                        متصفحك لا يدعم تشغيل الفيديو.
                      </video>
                  </div>
               )}

               {file.type === FileType.AUDIO && (
                  <div className="p-8 md:p-12 flex flex-col items-center justify-center w-full bg-space-900 mt-20 rounded-xl max-w-2xl">
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-space-700 rounded-full mb-6 md:mb-8 flex items-center justify-center animate-pulse">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-space-accent rounded-full opacity-50"></div>
                      </div>
                      <audio controls controlsList={file.preventDownload ? "nodownload" : undefined} className="w-full" src={file.contentUrl}>
                        متصفحك لا يدعم تشغيل الملفات الصوتية.
                      </audio>
                  </div>
               )}
               
               {file.type === FileType.IMAGE && (
                  <div className="w-full flex items-center justify-center pt-10">
                      <img src={file.contentUrl} alt={file.title} className="max-w-full shadow-2xl rounded-lg" style={{ maxHeight: isFullscreen ? '90vh' : '80vh' }} />
                  </div>
               )}
            </div>

            <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden mix-blend-overlay fixed-watermark">
                <Watermark />
            </div>
        </div>
      </div>

      {/* Comment Section - Cleaned up background */}
      <div className="p-4 md:p-6 mb-20">
          <h3 className="font-bold text-lg md:text-xl text-main mb-4 flex items-center gap-2">
              <MessageSquare size={20} /> التعليقات ({file.comments?.length || 0})
          </h3>
          <div className="space-y-3 mb-4 max-h-48 md:max-h-60 overflow-y-auto custom-scrollbar text-right">
              {file.comments && file.comments.length > 0 ? (
                  file.comments.map(c => {
                      const isOwner = currentUser?.id === c.userId;
                      const canManage = isDev || isOwner;
                      return (
                          <div key={c.id} className="bg-space-900/50 p-3 rounded-lg border border-space-700/50 group relative">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-space-accent text-xs md:text-sm">{c.userName}</span>
                                  <div className="flex items-center gap-2">
                                     <span className="text-[10px] text-muted">{new Date(c.createdAt).toLocaleString('ar-EG')}</span>
                                     {c.updatedAt && <span className="text-[10px] text-muted italic">(معدل)</span>}
                                  </div>
                              </div>
                              {editingCommentId === c.id ? (
                                  <div className="flex gap-2 mt-2">
                                      <input 
                                          value={editContent}
                                          onChange={e => setEditContent(e.target.value)}
                                          className="flex-1 bg-space-800 border border-space-700 rounded p-1 text-sm text-main"
                                      />
                                      <button onClick={saveEdit} className="text-green-400 hover:text-green-300"><Send size={16}/></button>
                                      <button onClick={() => setEditingCommentId(null)} className="text-red-400 hover:text-red-300"><X size={16}/></button>
                                  </div>
                              ) : (
                                  <p className="text-slate-300 text-xs md:text-sm">{c.content}</p>
                              )}
                              
                              {canManage && !editingCommentId && (
                                  <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => startEditing(c.id, c.content)} className="p-1 bg-space-800 rounded text-blue-400 hover:bg-space-700"><Edit size={12}/></button>
                                      <button onClick={() => setDeleteConfirmId(c.id)} className="p-1 bg-space-800 rounded text-red-400 hover:bg-space-700"><Trash2 size={12}/></button>
                                  </div>
                              )}
                          </div>
                      );
                  })
              ) : <p className="text-muted text-xs md:text-sm text-center py-4">لا توجد تعليقات بعد.</p>}
          </div>
          
          <div className="flex gap-2 items-center">
              <input 
                  type="text" 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="اكتب تعليقك هنا..."
                  className="flex-1 bg-space-800 border border-space-700 rounded-lg px-3 py-2 text-main outline-none focus:border-space-accent text-right text-sm h-10 shadow-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
              />
              <button onClick={handleSendComment} disabled={!newComment.trim()} className="bg-space-accent text-space-900 p-2 rounded-lg hover:bg-yellow-400 disabled:opacity-50 h-10 w-10 flex items-center justify-center shadow-md"><Send size={18} /></button>
          </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-space-800 rounded-2xl border border-red-500 w-full max-w-sm shadow-2xl p-6 text-center">
                  <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">حذف التعليق</h3>
                  <p className="text-slate-300 text-sm mb-6">هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.</p>
                  <div className="flex gap-3 justify-center">
                      <button onClick={confirmDelete} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-500">نعم، حذف</button>
                      <button onClick={() => setDeleteConfirmId(null)} className="bg-space-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-space-600">إلغاء</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default FileViewer;
