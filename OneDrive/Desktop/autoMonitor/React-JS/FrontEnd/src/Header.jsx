import React from 'react'
import 
 {BsPersonCircle, BsJustify}
 from 'react-icons/bs'

function Header({OpenSidebar}) {
  return (
    <header className='header'>
        <div className='menu-icon'>
            <BsJustify className='icon' onClick={OpenSidebar}/>
        </div>
        <div id="rightr">
        <div className='header-right'>
            <BsPersonCircle className='icon'/>
        </div>
        </div>
    </header>
  )
}

export default Header