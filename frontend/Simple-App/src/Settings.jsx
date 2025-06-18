import { useAuth } from "./AuthProvider";
import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Sun, Moon, Palette, Sunrise, CloudSun } from 'lucide-react';



function Settings() {

    const { user } = useAuth();
    const { setUser } = useAuth();

    const [username, setUsername] = useState("")
    const [message, setMessage] =useState("")
    const [theme, setTheme] = useState('dark');

    const fileInputRef = useRef(null);

    const update_nickname = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/posts/username-change", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({ username }) 
            });

            const data = await response.json();

            if (data.success) {
                const userRes = await fetch("http://localhost:3000/auth/me", { credentials: "include"})
                const userData = await userRes.json();

                setUser(userData.user);
            }
            else {
                console.log("Error changing username.")
            }

            setMessage(data.message);


        } catch (error) {
            console.log(error);
        }

    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch("http://localhost:3000/posts/upload-profile", {
                method: "POST",
                credentials:"include",
                body: formData
            })

            const data = await res.json();

            if (data.success) {
                const userRes = await fetch("http://localhost:3000/auth/me", { credentials: "include"})
                const userData = await userRes.json();

                setUser(userData.user);
                console.log("Upload successful:", data.imagePath, userData.user);

            }
        } catch (error) {
            console.log(error);
        }
    }

    // Theme persistence and application
    useEffect(() => {
        // On mount, load theme from localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, []);

    const handleThemeChange = (theme) => {
        setTheme(theme);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    return(
        <div className="min-h-screen flex flex-row bg-black pt-12">
            <div className="sticky top-0 left-0 h-screen z-40 flex-shrink-0"><Sidebar /></div>
            <div className="w-full max-w-xl mx-auto card flex flex-col items-center ml-8">
                <div className="w-full flex flex-col items-center">
                    {user ? (
                        <>
                            <div className="flex flex-col items-center mb-8 w-full">
                                <div className="mb-4">
                                    <img src={`http://localhost:3000/${user.profile_image}`} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-slate-800 shadow-lg" />
                                </div>
                                <div className="mb-2">
                                    <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                                </div>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleImageUpload}
                            />
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="mb-6 bg-slate-800 text-white px-6 py-2 rounded-lg shadow hover:bg-slate-700 transition-all"
                            >Upload profile image</button>
                            <form onSubmit={update_nickname} className="w-full flex flex-col items-center mb-8">
                                <input 
                                    placeholder="Change username."
                                    onChange={(e) => setUsername(e.target.value)}
                                    maxLength={20}
                                    minLength={3}
                                    className="mb-2 w-full max-w-xs"
                                />
                                <button className="w-full max-w-xs bg-purple-700 text-white py-2 rounded-lg shadow hover:bg-purple-800 transition-all">Ok</button>
                            </form>
                            <div className="my-6 w-full">
                                <h2 className="font-bold mb-2 text-white">Theme</h2>
                                <div className="flex space-x-4 justify-center">
                                    <button onClick={() => handleThemeChange('dark')} className={`p-2 rounded-full border-2 ${theme === 'dark' ? 'border-purple-500' : 'border-slate-700'} bg-black`}><Moon className="w-6 h-6 text-white" /></button>
                                    <button onClick={() => handleThemeChange('light')} className={`p-2 rounded-full border-2 ${theme === 'light' ? 'border-yellow-400' : 'border-slate-700'} bg-slate-100`}><Sun className="w-6 h-6 text-slate-900" /></button>
                                    <button onClick={() => handleThemeChange('yellow')} className={`p-2 rounded-full border-2 ${theme === 'yellow' ? 'border-yellow-400' : 'border-slate-700'} bg-gradient-to-br from-yellow-300 to-pink-400`}><Sunrise className="w-6 h-6 text-yellow-700" /></button>
                                    <button onClick={() => handleThemeChange('bluegreen')} className={`p-2 rounded-full border-2 ${theme === 'bluegreen' ? 'border-cyan-400' : 'border-slate-700'} bg-gradient-to-br from-cyan-400 to-blue-700`}><CloudSun className="w-6 h-6 text-cyan-100" /></button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <h1 className="text-2xl font-bold text-white">Not authorized.</h1>
                    )}
                    <div className="mt-4 text-center text-purple-400 font-medium">{message}</div>
                </div>
            </div>
        </div>
    )
}

export default Settings;