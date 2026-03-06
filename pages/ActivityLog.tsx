
import React from 'react';
import { useStore } from '../services/store';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserRole } from '../types';

const ActivityLog: React.FC = () => {
  const { logs, formatTime, currentUser } = useStore();

  if (currentUser?.role === UserRole.SUB_ADMIN && !currentUser.permissions?.canViewStats) {
      return (
        <div className="flex flex-col items-center justify-center p-12 h-full text-center animate-fade-in">
            <AlertTriangle size={48} className="text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold text-yellow-500 mb-2">ليس لديك اذن بذلك</h3>
            <p className="text-muted text-sm">يرجى مراجعة المطور الرئيسي للحصول على الصلاحيات اللازمة.</p>
        </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="p-2 bg-space-800 rounded-full hover:bg-space-700 text-main">
                <ChevronLeft className="rotate-180" />
            </Link>
            <h1 className="text-2xl font-bold text-main">سجل النشاطات الكامل</h1>
        </div>

        <div className="bg-space-800 rounded-xl border border-space-700 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                    <thead className="bg-space-900 text-muted font-bold">
                        <tr>
                            <th className="p-4">المستخدم</th>
                            <th className="p-4">الإجراء</th>
                            <th className="p-4">التوقيت</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-space-700">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-space-700/30">
                                <td className="p-4 font-bold text-space-accent">{log.userName}</td>
                                <td className="p-4 text-main">{log.action}</td>
                                <td className="p-4 text-muted dir-ltr text-right">{formatTime(log.timestamp)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default ActivityLog;
