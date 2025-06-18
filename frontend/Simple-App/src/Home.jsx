import { useState } from "react";
import { useAuth } from "./AuthProvider";
import Posts from "./Posts";
import Sidebar from "./Sidebar";

function Home (){

    const { user } = useAuth();

    const [filter, setFilter] = useState("All posts");

    return(
        <> 
            <div className="min-h-screen bg-black flex flex-row">
                <div className="sticky top-0 left-0 h-screen z-40 flex-shrink-0"><Sidebar /></div>
                <main className="ml-63 w-full">
                    <div className="max-w-2xl mx-auto px-4 py-6">
                        <div className="flex flex-col items-center mb-8">
                            <img src={`http://localhost:3000/${user.profile_image}`} alt="Profile" className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-700 mb-4" />
                            <h1 className="text-2xl font-bold text-white mb-2">{user.username}</h1>
                        </div>
                        <div className="flex justify-center w-full mb-4">
                            <div className="inline-flex rounded-xl bg-slate-800 p-1 shadow-lg">
                                <button
                                    onClick={() => setFilter('All posts')}
                                    className={`px-6 py-2 rounded-xl font-medium focus:outline-none transition-colors duration-200 ${filter === 'All posts' ? 'bg-purple-700 text-white' : 'text-gray-400 hover:bg-slate-700'}`}
                                >
                                    All Posts
                                </button>
                                <button
                                    onClick={() => setFilter('Following')}
                                    className={`px-6 py-2 rounded-xl font-medium focus:outline-none transition-colors duration-200 ${filter === 'Following' ? 'bg-purple-700 text-white' : 'text-gray-400 hover:bg-slate-700'}`}
                                >
                                    Following
                                </button>
                            </div>
                        </div>
                        <Posts filter={filter} profile={null} />
                    </div>
                </main>
            </div>
        </>
    );
}

export default Home