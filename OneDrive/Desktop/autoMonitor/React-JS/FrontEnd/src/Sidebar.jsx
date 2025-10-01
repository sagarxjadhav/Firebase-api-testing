import React from 'react'
import 
{BsGrid1X2Fill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, 
  BsListCheck, BsMenuButtonWideFill}
 from 'react-icons/bs'
import { useNavigate } from "react-router-dom";


function Sidebar({openSidebarToggle, OpenSidebar}) {
      const navigate = useNavigate();
    
  return (
    <aside id="sidebar" className={openSidebarToggle ? "sidebar-responsive": ""}>
        <div className='sidebar-title'>
            <div className='sidebar-brand'>
                Auto Monitor
            </div>
            <span className='icon close_icon' onClick={OpenSidebar}>X</span>
        </div>

        <ul className='sidebar-list'>
            <li className='sidebar-list-item' onClick={() => navigate("/")}>
                    <BsGrid1X2Fill className='icon'/> Dashboard
            </li>
            <li className='sidebar-list-item'  onClick={() => navigate("/table")}>
                    <BsFillArchiveFill className='icon'/> Data
            </li>
            <li className='sidebar-list-item'>
                <a href="">
                    <BsFillGrid3X3GapFill className='icon'/> Bike/Car
                </a>
            </li>
            <li className='sidebar-list-item'>
                <a href="">
                    <BsPeopleFill className='icon'/> Users Data
                </a>
            </li>
            <li className='sidebar-list-item'>
                <a href="">
                    <BsListCheck className='icon'/> Repeated Customers
                </a>
            </li>
            <li className='sidebar-list-item'>
                <a href="">
                    <BsMenuButtonWideFill className='icon'/> Reports
                </a>
            </li>
          
        </ul>
    </aside>
  )
}

export default Sidebar