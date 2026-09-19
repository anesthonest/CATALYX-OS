import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ShieldAlert, Sparkles, X, ChevronDown, CheckCircle } from 'lucide-react';
import { dbService } from '../firebase';
import { SmartNotification } from '../types';

interface SmartNotificationsProps {
  userId: string;
}

export const SmartNotifications: React.FC<SmartNotificationsProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Simulate periodic checks or alarms
    const timer = setTimeout(() => {
      triggerHeuristicStreaksWarning();
    }, 4000);
    return () => clearTimeout(timer);
  }, [userId]);

  const loadNotifications = async () => {
    const list = await dbService.getNotifications(userId);
    setNotifications(list);
  };

  const triggerHeuristicStreaksWarning = async () => {
    const tasks = await dbService.getTasks(userId);
    const uncompletedTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);
    
    // Check if user has many uncompleted tasks and low streak
    if (uncompletedTasks.length > 2) {
      const activeList = await dbService.getNotifications(userId);
      if (!activeList.some(n => n.type === 'streak_risk')) {
        const title = 'STREAK RISK MULTIPLIER WARNING';
        const message = `Commander, you have ${uncompletedTasks.length} pending backlog items. Complete one now to safeguard your active streak!`;
        const updated = await dbService.addNotification(userId, title, message, 'streak_risk');
        setNotifications(updated);
      }
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const updated = await dbService.markNotificationAsRead(userId, id);
    setNotifications(updated);
  };

  const handleClear = async () => {
    await dbService.clearNotifications(userId);
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative font-sans" id="smart-notifications">
      {/* Selector bell indicator */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 relative cursor-pointer"
        title="Command Notifications"
      >
        <Bell className="w-4 h-4 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-pink text-[9px] text-white flex items-center justify-center font-black animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Sliding Dialog Panel dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-3 w-80 glass-panel p-4 rounded-2xl z-50 shadow-2xl ring-1 ring-brand-purple/20 space-y-3"
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-brand-purple" />
                Notification Hub
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-[9px] font-mono text-gray-500 hover:text-red-400 cursor-pointer uppercase"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {/* Scrollable notifications list */}
            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id)}
                  className={`p-3 rounded-xl border flex gap-3 transition-colors text-xs cursor-pointer ${
                    n.read 
                      ? 'bg-black/10 border-white/5 opacity-55' 
                      : n.type === 'streak_risk'
                      ? 'bg-red-500/10 border-red-500/25 text-red-100 hover:bg-red-500/15'
                      : 'bg-brand-purple/10 border-brand-purple/25 text-slate-100 hover:bg-brand-purple/15'
                  }`}
                >
                  <div className="mt-0.5">
                    {n.type === 'streak_risk' ? (
                      <ShieldAlert className="w-4 h-4 text-red-400 fill-red-400/10 shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-brand-cyan fill-brand-cyan/10 shrink-0" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-semibold block tracking-tight leading-tight uppercase font-mono text-[10px]">
                      {n.title}
                    </h5>
                    <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                      {n.message}
                    </p>
                    <span className="text-[9px] text-gray-600 block mt-1 font-mono">
                      {new Date(n.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <p className="text-xs text-gray-500 italic text-center py-4">All operational tracks stable. No notifications queued.</p>
              )}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] uppercase font-mono text-gray-400 flex items-center justify-center gap-1 cursor-pointer"
            >
              <ChevronDown className="w-3 h-3" />
              Close Hub Panel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
