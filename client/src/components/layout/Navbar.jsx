import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import hexaware from '../../assets/hexaware.png'
import { Menu, Settings, MoreVertical, X, Pencil, User, Bell, BookOpen, Check, TrashIcon, Palette, Info, LogOut, ChevronDown, ShieldCheck } from 'lucide-react'
import api from '../../services/api'
import { getSocket } from '../../services/socket'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function Navbar({ onMenuClick, onEditProfile, onLogout, onExitAdmin, isAdminRoute, sidebarCollapsed }) {
    const { user } = useAuth()
    const { isLight, toggleTheme } = useTheme()
    const [menuOpen, setMenuOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false)
    const [signInDropdownOpen, setSignInDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)
    const notificationRef = useRef(null)
    const settingsRef = useRef(null)
    const signInRef = useRef(null)
    const navigate = useNavigate()
    const [DeleteNotification,setDeleteNotification] = useState(false);
    const [DeleteAllNotification,setAllDeleteNotification] = useState(false);
    
    const [notifications, setNotifications] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user || (user.role !== 'student' && user.role !== 'staff')) return;
        try {
            const { data } = await api.get('/api/notifications');
            if (data.success) {
                setNotifications(data.data);
                setDeleteNotification(true);
                setAllDeleteNotification(true);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    // Socket & initial fetch
    useEffect(() => {
        if (user && (user.role === 'student' || user.role === 'staff')) {
            fetchNotifications();
            
            const token = localStorage.getItem('token');
            const socket = getSocket(token);
            
            socket.emit('join', user._id);
            socket.emit('joinDepartmentRoom', { department: user.department, semester: user.semester });
            
            socket.on('new_notification', (newNotif) => {
                toast.success(newNotif.message, { icon: '🔔' });
                const dbNotif = {
                    _id: newNotif.id,
                    type: newNotif.type,
                    title: newNotif.title,
                    message: newNotif.message,
                    createdAt: newNotif.createdAt,
                    isRead: false
                };
                setNotifications(prev => [dbNotif, ...prev]);
            });
            
            return () => {
                socket.off('new_notification');
            }
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const deleteNotification = async (id) =>{
        try{
            const {data} = await api.delete(`/api/notifications/delete/${id}`);
            if(data.success){
                setNotifications(prev => prev.filter(n => n._id !== id));
                toast.success(data.message);
            }
        }
        catch(error){
            console.error('Failed to delete notification', error);
        }
    }

    const deleteAllNotification = async () =>{
        try{
            const {data} = await api.delete('/api/notifications/delete-all');
            if(data.success){
                setNotifications([]);
                setAllDeleteNotification(false);
                toast.success(data.message);
            }
        }
        catch(error){
            console.error('Failed to delete all notifications', error);
        }
    }

    

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false)
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setSettingsDropdownOpen(false)
            }
            if (signInRef.current && !signInRef.current.contains(event.target)) {
                setSignInDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return null
        if (avatarPath.startsWith('http')) return avatarPath
        const base = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
            : ''
        return `${base}${avatarPath}`
    }

    const initials = isAdminRoute ? 'AD' : user?.name
        ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U'

    const settingsPath = user?.role === 'student' ? '/student/settings' : '/settings'

    return (
        <nav className="sticky top-0 z-50 w-full bg-ink-950 border-b border-ink-800 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3">

                <div className="flex items-center gap-3">
                    {/* Mobile sidebar hamburger button */}
                    {onMenuClick && (
                        <button className="md:hidden btn-ghost p-2" onClick={onMenuClick} aria-label="Open sidebar">
                            <Menu size={24} />
                        </button>
                    )}

                    {/* College logo */}
                    <Link to="/" className="shrink-0 flex items-center">
                        <div className={!isLight ? "bg-white p-1.5 rounded-lg" : ""}>
                            <img
                                src={hexaware}
                                alt="Hexaware Logo"
                                className="h-10 sm:h-12 lg:h-14 w-auto object-contain transition-all duration-300"
                            />
                        </div>
                    </Link>
                </div>

                {/* Right Side: Profile & Actions */}
                <div className="flex items-center gap-4">
                    {user || isAdminRoute ? (
                        <div className="relative flex items-center gap-3" ref={dropdownRef}>
                            {/* Notification Button */}
                            {(user?.role === 'student' || user?.role === 'staff') && (
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative w-10 h-10 rounded-xl flex items-center justify-center border border-ink-800 hover:bg-ink-800 transition-all duration-200 text-ink-400"
                                        title="Notifications"
                                    >
                                        <Bell size={20} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-lime-400 text-ink-950 text-xs font-bold rounded-full flex items-center justify-center border-2 border-ink-950">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-ink-900 border border-ink-800 rounded-xl shadow-2xl py-2 z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                            <div className="flex justify-between items-center px-4 py-2 border-b border-ink-800 mb-1">
                                                <h3 className="text-sm font-600 text-ink-100">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button onClick={markAllAsRead} className="text-xs text-lime-400 hover:text-lime-300 flex items-center gap-1">
                                                        <Check size={14} /> Mark all read
                                                    </button>
                                                )}
                                                {DeleteAllNotification && notifications.length > 0 && (
                                                     <button onClick={deleteAllNotification} className="text-xs text-lime-400 hover:text-lime-300 flex items-center gap-1">
                                                         <TrashIcon size={14} />Delete All Notifications
                                                     </button>
                                                 )}
                                            </div>
                                            
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-6 text-center text-ink-400 text-sm">
                                                    No notifications yet
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {notifications.map(notification => {
                                                        let IconComponent = BookOpen;
                                                        let colorClass = 'text-lime-400 bg-lime-400/10';

                                                        if (notification.type === 'test_upload') {
                                                            IconComponent = Bell;
                                                            colorClass = 'text-amber-400 bg-amber-400/10';
                                                        } else if (notification.type === 'test_submission') {
                                                            IconComponent = Check;
                                                            colorClass = 'text-sky-400 bg-sky-400/10';
                                                        }

                                                        return (
                                                            <div 
                                                                key={notification._id} 
                                                                className={clsx(
                                                                    "px-4 py-3 hover:bg-ink-800 transition-colors cursor-pointer",
                                                                    !notification.isRead && "bg-ink-800/50"
                                                                )}
                                                                onClick={() => {
                                                                    if (!notification.isRead) markAsRead(notification._id);
                                                                    setShowNotifications(false);
                                                                    
                                                                    if (notification.type === 'material_upload') {
                                                                        navigate('/student/materials');
                                                                    } else if (notification.type === 'test_upload') {
                                                                        navigate('/student/tests');
                                                                    } else if (notification.type === 'test_submission') {
                                                                        navigate('/staff/results');
                                                                    }
                                                                }}
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className="shrink-0 mt-1">
                                                                        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center", colorClass)}>
                                                                            <IconComponent size={16} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-500 text-ink-100">{notification.title}</p>
                                                                        <p className="text-xs text-ink-300 mt-0.5 line-clamp-2">{notification.message}</p>
                                                                        <p className="text-[10px] text-ink-500 mt-1">
                                                                            {new Date(notification.createdAt).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                    {DeleteNotification && (
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                deleteNotification(notification._id);
                                                                            }} 
                                                                            className="text-xs text-lime-400 hover:text-lime-300 flex items-center gap-1 shrink-0"
                                                                        >
                                                                            <TrashIcon size={14} />Delete
                                                                        </button>
                                                                    )}
                                                                    {!notification.isRead && (
                                                                        <div className="shrink-0">
                                                                            <div className="w-2 h-2 bg-lime-400 rounded-full mt-2"></div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Profile Trigger */}
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 focus:outline-none"
                            >
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center border overflow-hidden transition-all duration-200 hover:ring-2 hover:ring-lime-400/50",
                                    isAdminRoute ? "bg-sky-400/10 border-sky-400/20" : "bg-lime-400/10 border-lime-400/20"
                                )}>
                                    {user?.avatar ? (
                                        <img 
                                            src={getAvatarUrl(user.avatar)} 
                                            alt={user.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className={clsx(
                                            "font-display font-600 text-xs",
                                            isAdminRoute ? "text-sky-400" : "text-lime-300"
                                        )}>{initials}</span>
                                    )}
                                </div>
                            </button>

                            {/* Settings Button */}
                            <div className="relative" ref={settingsRef}>
                                <button
                                    onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-ink-800 hover:bg-ink-800 transition-all duration-200 text-ink-400"
                                    title="Settings"
                                >
                                    <Settings size={20} />
                                </button>
                                
                                {settingsDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#111111] dark:bg-ink-950 border border-ink-800 rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right flex flex-col gap-1">
                                        <button 
                                            onClick={() => { setSettingsDropdownOpen(false); navigate(settingsPath, { state: { tab: 'profile' }}) }}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium text-ink-300 hover:text-white hover:bg-[#2A2A2A] transition-colors w-full"
                                        >
                                            <User size={18} />
                                            <span>Profile Details</span>
                                        </button>
                                        <button 
                                            onClick={() => { setSettingsDropdownOpen(false); navigate(settingsPath, { state: { tab: 'theme' }}) }}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium text-ink-300 hover:text-white hover:bg-[#2A2A2A] transition-colors w-full"
                                        >
                                            <Palette size={18} />
                                            <span>Change Theme</span>
                                        </button>
                                        <button 
                                            onClick={() => { setSettingsDropdownOpen(false); navigate(settingsPath, { state: { tab: 'about' }}) }}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium text-ink-300 hover:text-white hover:bg-[#2A2A2A] transition-colors w-full"
                                        >
                                            <Info size={18} />
                                            <span>About Platform</span>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setSettingsDropdownOpen(false);
                                                if (isAdminRoute && onExitAdmin) {
                                                    onExitAdmin()
                                                } else if (onLogout) {
                                                    onLogout()
                                                }
                                            }}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium text-red-400 hover:text-red-300 hover:bg-[#2A2A2A] transition-colors w-full border-t border-ink-800/50 mt-1 pt-2"
                                        >
                                            <LogOut size={18} />
                                            <span>Logout</span>
                                        </button>
                                        
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-ink-900 border border-ink-800 rounded-xl shadow-2xl py-2 z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <div className="px-4 py-2 border-b border-ink-800 mb-1">
                                        <p className="text-sm font-600 text-ink-100 truncate">{user?.name || 'Admin'}</p>
                                        <p className="text-xs text-ink-400 truncate capitalize">{user?.role || 'Administrator'}</p>
                                    </div>
                                    
                                    {!isAdminRoute && (
                                        <button 
                                            onClick={() => {
                                                onEditProfile()
                                                setDropdownOpen(false)
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-ink-300 hover:bg-ink-800 hover:text-ink-100 transition-colors"
                                        >
                                            <Pencil size={16} />
                                            <span>Edit Profile</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2">
                            <Link to="/admin-login" className="btn-ghost text-sm py-1.5 text-yellow-600 hover:text-sky-300">Admin</Link>
                            
                            <div className="relative" ref={signInRef}>
                                <button
                                    onClick={() => setSignInDropdownOpen(!signInDropdownOpen)}
                                    className="btn-ghost text-sm py-1.5 flex items-center gap-1 text-ink-300 hover:text-ink-100"
                                >
                                    <span>Sign In</span>
                                    <ChevronDown size={14} className={clsx("transition-transform duration-200", signInDropdownOpen && "rotate-180")} />
                                </button>
                                {signInDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-ink-900 border border-ink-800 rounded-xl shadow-2xl py-2 z-[100] animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                                        <Link
                                            to="/login"
                                            onClick={() => setSignInDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-300 hover:bg-ink-800/60 hover:text-ink-100 transition-colors"
                                        >
                                            <User size={16} className="text-lime-300" />
                                            <span>Student / Faculty</span>
                                        </Link>
                                        <Link
                                            to="/principal-login"
                                            onClick={() => setSignInDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-300 hover:bg-ink-800/60 hover:text-ink-100 transition-colors border-t border-ink-800/40"
                                        >
                                            <ShieldCheck size={16} className="text-amber-400" />
                                            <span>Principal Login</span>
                                        </Link>
                                        <Link
                                            to="/office-login"
                                            onClick={() => setSignInDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-300 hover:bg-ink-800/60 hover:text-ink-100 transition-colors border-t border-ink-800/40"
                                        >
                                            <BookOpen size={16} className="text-sky-400" />
                                            <span>Office Staff Login</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <Link to="/register" className="btn-primary py-1.5 text-sm px-4">Register</Link>
                        </div>
                    )}

                    {/* Mobile menu toggle for non-logged-in users */}
                    {!user && !isAdminRoute && (
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-ink-400 hover:bg-ink-800 hover:text-ink-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X size={24} /> : <MoreVertical size={24} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile dropdown for non-logged-in users */}
            {menuOpen && !user && !isAdminRoute && (
                <div className="md:hidden overflow-hidden bg-ink-900 border-t border-ink-800 p-4 space-y-4">
                    <div className="flex flex-col gap-2">
                        <Link to="/admin-login" onClick={() => setMenuOpen(false)} className="btn-ghost justify-center text-yellow-600">Admin</Link>
                        <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-950/20">
                            <button
                                onClick={() => setSignInDropdownOpen(!signInDropdownOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-ink-200 hover:bg-ink-800 transition-colors"
                            >
                                <span>Sign In Options</span>
                                <ChevronDown size={16} className={clsx("transition-transform duration-200", signInDropdownOpen && "rotate-180")} />
                            </button>
                            {signInDropdownOpen && (
                                <div className="divide-y divide-ink-800/40 bg-ink-900/40">
                                    <Link
                                        to="/login"
                                        onClick={() => { setMenuOpen(false); setSignInDropdownOpen(false); }}
                                        className="flex items-center gap-3 px-6 py-2.5 text-sm text-ink-300 hover:text-ink-100"
                                    >
                                        <User size={14} className="text-lime-300" />
                                        <span>Student / Faculty</span>
                                    </Link>
                                    <Link
                                        to="/principal-login"
                                        onClick={() => { setMenuOpen(false); setSignInDropdownOpen(false); }}
                                        className="flex items-center gap-3 px-6 py-2.5 text-sm text-ink-300 hover:text-ink-100"
                                    >
                                        <ShieldCheck size={14} className="text-amber-400" />
                                        <span>Principal Login</span>
                                    </Link>
                                    <Link
                                        to="/office-login"
                                        onClick={() => { setMenuOpen(false); setSignInDropdownOpen(false); }}
                                        className="flex items-center gap-3 px-6 py-2.5 text-sm text-ink-300 hover:text-ink-100"
                                    >
                                        <BookOpen size={14} className="text-sky-400" />
                                        <span>Office Staff Login</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                        <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary justify-center">Register</Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
