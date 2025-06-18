import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"

function SignIn(){

    const [username, setUsername] = useState()
    const [password, setPassword] = useState()

    const [success, setSuccess] = useState(false)
    const [message, setMessage] = useState("")


    const navigate = useNavigate()


    const api = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/auth/signin", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ username, password }) 
            });

            const data = await response.json();

            if(data.success){
                setSuccess(true)
                setMessage(data.message)
            }
            else{
                setMessage(data.message);  
                setSuccess(false)
            }

        } catch (error) {
            setMessage("Error Connecting to Server" + error)
        }
    }

    return(
        <>
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Join MoodFlow</h1>
                            <p className="text-gray-400">Create your account and start sharing your daily vibe</p>
                        </div>

                        <form onSubmit={api} className="space-y-6">
                            <div>
                                <label htmlFor="Username" className="block text-sm font-medium text-gray-300 mb-2">
                                    Choose Username
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter a username"
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    value={username}
                                    maxLength={20}
                                    minLength={3}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="Password" className="block text-sm font-medium text-gray-300 mb-2">
                                    Choose Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter a password"
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    value={password}
                                    maxLength={64}
                                    minLength={8}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Sign In
                            </button>
                        </form>

                        {message && (
                            <div className={`mt-6 p-4 rounded-xl text-center ${
                                success 
                                    ? 'bg-green-500/10 border border-green-500/20' 
                                    : 'bg-red-500/10 border border-red-500/20'
                            }`}>
                                <p className={success ? 'text-green-400' : 'text-red-400'}>{message}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mt-6 text-center">
                                <button 
                                    onClick={() => navigate("/")}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Log In here!
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
         </>
    )
}

export default SignIn