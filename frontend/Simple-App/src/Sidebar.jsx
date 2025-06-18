import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import SearchBar from "./SearchBar";
import { Home, Search, User, Settings as SettingsIcon, LogOut, LogIn } from 'lucide-react';

function Sidebar() {

    const { user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState(false);

    const logout = async () => {
        try {
            await fetch('http://localhost:3000/auth/logout', {
                method: "POST",
                credentials: "include"
            });

            window.location.reload();
        } catch (error) {
            console.log(error)
        }
    }

    return(

        <>
            <div className="w-60 h-full bg-slate-900 border-r border-slate-800 p-6 flex flex-col items-end">
                <div className="mb-8 w-full">
                    <h1 className="text-2xl font-bold text-white mb-2">MoodFlow</h1>
                    <p className="text-gray-400 text-sm">Share your daily vibe</p>
                </div>
                <nav className="space-y-2 w-full">
                    <div 
                        onClick={() => navigate('/')} 
                        className="flex items-center space-x-3 p-3 rounded-xl text-white hover:bg-slate-800 cursor-pointer transition-all duration-200 group w-full"
                    >
                        <Home className="w-6 h-6" />
                        <span className="font-medium group-hover:text-gray-300">Home</span>
                    </div>
                    <div 
                        onClick={() => setQuery(!query)}
                        className="flex items-center space-x-3 p-3 rounded-xl text-white hover:bg-slate-800 cursor-pointer transition-all duration-200 group w-full"
                    >
                        <Search className="w-6 h-6" />
                        <span className="font-medium group-hover:text-gray-300">Search</span>
                    </div>
                    {query && (
                        <div className="p-3 bg-slate-800 rounded-xl w-full">
                            <SearchBar />
                        </div>
                    )}
                    {user ? (
                        <>
                            <div 
                                onClick={() => navigate(`/${user.username}`)}
                                className="flex items-center space-x-3 p-3 rounded-xl text-white hover:bg-slate-800 cursor-pointer transition-all duration-200 group w-full"
                            >
                                <User className="w-6 h-6" />
                                <span className="font-medium group-hover:text-gray-300">Profile</span>
                            </div>
                            <div 
                                onClick={() => navigate('/Settings')}
                                className="flex items-center space-x-3 p-3 rounded-xl text-white hover:bg-slate-800 cursor-pointer transition-all duration-200 group w-full"
                            >
                                <SettingsIcon className="w-6 h-6" />
                                <span className="font-medium group-hover:text-gray-300">Settings</span>
                            </div>
                            <div 
                                onClick={logout}
                                className="flex items-center space-x-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 cursor-pointer transition-all duration-200 group w-full"
                            >
                                <LogOut className="w-6 h-6" />
                                <span className="font-medium group-hover:text-red-300">Logout</span>
                            </div>
                        </>
                    ) : (
                        <div 
                            onClick={() => navigate('/login')}
                            className="flex items-center space-x-3 p-3 rounded-xl text-white hover:bg-slate-800 cursor-pointer transition-all duration-200 group w-full"
                        >
                            <LogIn className="w-6 h-6" />
                            <span className="font-medium group-hover:text-gray-300">Login</span>
                        </div>
                    )}
                </nav>
            </div>
        </>
    )
}

export default Sidebar;