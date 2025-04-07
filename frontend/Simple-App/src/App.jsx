import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './Login'
import SignIn from './SignIn'
import Profile from './Profile';
import Home from './Home';
import Settings from './Settings';
import { AuthProvider } from './AuthProvider';

function App() {
  
  return (

    <AuthProvider>
      <Router>
            <Routes>
              
                <Route path="/" element={<Home />} />
                  <Route path="/:profile" element={<Profile />} >
                </Route>

                <Route path="/Login" element={<Login />} />
                <Route path="/SignIn" element={<SignIn />} />
                <Route path="/Settings" element={<Settings />} />
            </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
