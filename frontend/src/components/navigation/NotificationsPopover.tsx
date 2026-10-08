'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications';
import { useAuthStore } from '@/store/auth-store';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
    enabled: !!token,
    refetchInterval: 30000,
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 space-y-2">
                  <Bell className="h-8 w-8 mx-auto text-zinc-300 dark:text-zinc-700" />
                  <p className="text-xs">No notifications right now.</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.is_read) markOneMutation.mutate(n.id);
                    }}
                    className={`p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors ${
                      !n.is_read ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        {!n.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                        )}
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatDate(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                      {n.message}
                    </p>
                    {n.link_url && (
                      <Link
                        href={n.link_url}
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-1.5 inline-block font-medium"
                      >
                        View details →
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
