import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '@/store/slices/authSlice';
import type { RootState } from '@/store';

import { t } from '@/theme/theme';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import {
    LayoutDashboard, Tag, Receipt, BarChart3,
    X, LogOut, Settings, ChevronRight,
    Wallet, CalendarDays, Menu,
} from 'lucide-react';

export const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Categories', path: '/categories', icon: Tag },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Summary', path: '/summary', icon: BarChart3 },
] as const;

export type NavPath = typeof navItems[number]['path'];

interface SidebarProps {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar({ isOpen, onOpen, onClose }: SidebarProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state: RootState) => state.auth.user);

    const username = user?.username || 'User';
    const userInitial = username.charAt(0).toUpperCase();
    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Jan 2024';

    const activePath = location.pathname;
    const activeLabel = navItems.find(n => n.path === activePath)?.label ?? 'Dashboard';

    const handleNav = (path: NavPath) => {
        navigate(path);
        onClose();
    };

    return (
        <>
            {/* ── MOBILE TOPBAR ─────────────────────────────────────────────────── */}
            <div className={`
        flex md:hidden items-center justify-between
        px-4 h-15.25 shrink-0
        ${t.sidebarBg} border-b ${t.border}
        fixed top-0 left-0 right-0 z-40
      `}>
                <Button variant="ghost" size="icon" className={`${t.btnGhost} h-8 w-8`} onClick={onOpen}>
                    <Menu className="w-5 h-5" />
                </Button>
                <span className={`text-sm font-semibold ${t.textPrimary}`}>{activeLabel}</span>
                <div className="w-8" />
            </div>

            {/* ── MOBILE OVERLAY ────────────────────────────────────────────────── */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        flex flex-col w-64 h-full
        ${t.sidebarBg} border-r ${t.border}
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>

                <div className={`flex md:hidden items-center justify-between px-5 h-15.25 border-b ${t.border} shrink-0`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.logoIconBg}`}>
                            <Wallet className={`w-4 h-4 ${t.logoIconText}`} />
                        </div>
                        <span className={`font-semibold text-sm tracking-tight ${t.textPrimary}`}>
                            Finance Manager
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" className={`${t.btnGhost} h-7 w-7`} onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {navItems.map(({ label, path, icon: Icon }) => {
                        const isActive = activePath === path;
                        return (
                            <button
                                key={path}
                                onClick={() => handleNav(path)}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                  transition-all duration-150
                  ${isActive ? t.navActive : t.navInactive}
                `}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {label}
                                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                            </button>
                        );
                    })}
                </nav>

                <Separator className={t.sep} />

                {/* Profile card */}
                <div className="p-3 shrink-0">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left hover:bg-blue-50">
                                <Avatar className={`h-8 w-8 ring-2 ${t.avatarRing}`}>
                                    <AvatarImage src={user?.avatarUrl} alt={username} />
                                    <AvatarFallback className={`text-xs font-semibold ${t.avatarFallback}`}>
                                        {userInitial}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${t.textPrimary}`}>{username}</p>
                                    <p className={`text-xs truncate ${t.textMuted}`}>{user?.email || 'user@email.com'}</p>
                                </div>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent side="top" align="start" className={`w-56 p-1.5 ${t.popoverBg}`}>
                            <div className="flex items-center gap-3 px-2 py-2 mb-1">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className={`text-xs ${t.avatarFallback}`}>{userInitial}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate">{username}</p>
                                    <p className={`text-xs truncate ${t.textMuted}`}>{user?.email}</p>
                                </div>
                            </div>
                            <Separator className={`${t.popoverSep} mb-1`} />
                            <div className={`flex items-center gap-2 px-2 py-2 text-xs ${t.textMuted}`}>
                                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                                <span>Joined {joinedDate}</span>
                            </div>
                            <Separator className={`${t.popoverSep} my-1`} />
                            <Button variant="ghost" size="sm" className={`w-full justify-start gap-2 h-8 text-xs ${t.popoverItem}`}>
                                <Settings className="w-3.5 h-3.5" /> Settings
                            </Button>
                            <Separator className={`${t.popoverSep} my-1`} />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => dispatch(logout())}
                                className={`w-full justify-start gap-2 h-8 text-xs ${t.btnDanger}`}
                            >
                                <LogOut className="w-3.5 h-3.5" /> Sign out
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            </aside>
        </>
    );
}