import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './Login'
import SignIn from './SignIn'
import Profile from './Profile';
import Home from './Home';

function App() {
  
  return (
    <Router>
            <Routes>
              
                <Route path="/" element={<Home />} />
                  <Route path="/:profile" element={<Profile />} >
                </Route>

                <Route path="/Login" element={<Login />} />
                <Route path="/SignIn" element={<SignIn />} />
            </Routes>
    </Router>
  )
}

export default App
