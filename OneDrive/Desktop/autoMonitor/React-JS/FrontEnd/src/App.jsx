import { useState } from 'react'
import './App.css'
import Header from './Header'
import Sidebar from './Sidebar'
import Home from './Home'
import { BrowserRouter as Router, Route, Routes,} from "react-router-dom";
import AddEmployee from "./components/Employee/AddEmployee"
import Signup from './components/Auth/Signup'
import Login from './components/Auth/Login'
import EmployeeTable from './components/Employee/EmployeeTable'
import EditEmployee from './components/Employee/EditEmployee'

function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false)

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle)
  }

  return (
    <Router>
      <div className='grid-container'>
      <Header OpenSidebar={OpenSidebar}/>
      <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/table" element={<EmployeeTable />} />
        <Route path="/add" element={<AddEmployee />} />
        <Route path="/edit/:id" element={<EditEmployee />} />
        

    
      </Routes>
    </div>
    </Router>
  )
}

export default App
