import { useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar";
import { useAuth } from "./AuthProvider";

function Home (){

    const { user } = useAuth();
    const navigate = useNavigate()

    return(
        <>
            <h1>Home</h1>
            
            <div>
                {user ? (

                    <div>
                        <Sidebar></Sidebar>
                    </div>

                ) : (
                
                <div> 
                    <p>You are not logged in:</p>
                    <button onClick={() => navigate('/Login')}>Log in</button>
                    <button onClick={() => navigate('/SignIn')}>Sign in</button>
                </div>)}

                {/* Render posts here */}
            </div>
        </>
    );
}

export default Home