import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./AuthProvider";

function Login(){

    const [username, setUserame] = useState()
    const [password, setPassword] = useState()
    
    const [message, setMessage] = useState("")
    const navigate = useNavigate();

    const { setUser } = useAuth();


    //login
    const login = async (e) => {
        e.preventDefault();

        try {
                const response = await fetch("http://localhost:3000/auth/login", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify({ username, password }) 
                });

                const data = await response.json();

                if(data.success){
                    const userRes = await fetch("http://localhost:3000/auth/me", {credentials: "include"})
                    const userData = await userRes.json();

                    setUser(userData.user)

                    navigate('/');
                }
                else{
                    setMessage(data.message);  
                }

        } catch (error) {
            setMessage("Error Connecting to Server")
            console.log(error)
        }
    };

    return(
        <>
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                            <p className="text-gray-400">Sign in to your MoodFlow account</p>
                        </div>

                        <form onSubmit={login} className="space-y-6">
                            <div>
                                <label htmlFor="Username" className="block text-sm font-medium text-gray-300 mb-2">
                                    Username
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Enter your username" 
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    value={username}
                                    maxLength={20}
                                    minLength={3}
                                    onChange={(e) => {setUserame(e.target.value)}}></input>
                            </div>

                            <div>
                                <label htmlFor="Password" className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <input 
                                    type="password" 
                                    placeholder="Enter your password" 
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    value={password}
                                    maxLength={64}
                                    minLength={0}
                                    onChange={(e) => {setPassword(e.target.value)}}></input>
                            </div>

                            <div>
                                <button 
                                    type="submit" 
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Log In
                                </button>
                            </div>

                            <div className="text-center">
                                <button 
                                    onClick={() => navigate("/SignIn")} 
                                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                                >
                                    Don't have an account? Sign in
                                </button>
                            </div>
                        </form>

                        {message && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <h3 className="text-red-400 text-center">{message}</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login