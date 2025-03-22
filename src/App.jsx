import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './Login'
import SignIn from './SignIn'
import Account from './Account';

function App() {
  
  return (
    <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/Account" element={<Account />} />
                <Route path="/SignIn" element={<SignIn />} />
            </Routes>
    </Router>
  )
}

export default App
