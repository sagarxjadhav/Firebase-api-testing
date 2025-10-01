import React from 'react'
import 
{ BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill}
 from 'react-icons/bs'
 import 
 { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } 
 from 'recharts';

function Home() {

    const data = [
        {
          name: 'Page A',
          Bike: 3000,
          Car: 2000,
          amt: 1000,
        },
        {
          name: 'Page B',
          Bike: 3000,
          Car: 1398,
          amt: 2210,
        },
        {
          name: 'Page C',
          Bike: 2000,
          Car: 9800,
          amt: 2290,
        },
        {
          name: 'Page D',
          Bike: 2780,
          Car: 3908,
          amt: 2000,
        },
        {
          name: 'Page E',
          Bike: 1890,
          Car: 4800,
          amt: 2181,
        },
        {
          name: 'Page F',
          Bike: 2390,
          Car: 3800,
          amt: 2500,
        },
        {
          name: 'Page G',
          Bike: 3490,
          Car: 4300,
          amt: 2100,
        },
      ];
     

  return (
    <main className='main-container'>
        <div className='main-title'>
            <h3>DASHBOARD</h3>
        </div>

        <div className='main-cards'>
            <div className='card'>
                <div className='card-inner'>
                    <h3>Total Profit</h3>
                    <BsFillArchiveFill className='card_icon'/>
                </div>
                <h1>30000 Rs</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>Repeated Customer</h3>
                    <BsFillGrid3X3GapFill className='card_icon'/>
                </div>
                <h1>12</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>Bike Count</h3>
                    <BsPeopleFill className='card_icon'/>
                </div>
                <h1>33</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>Car Count</h3>
                    <BsFillBellFill className='card_icon'/>
                </div>
                <h1>42</h1>
            </div>
        </div>


      <div className="chartsShow">

      <div className="rowData">
        <div className="timeDuration">
        <select>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>

        </div>
        <div className="graphType">
          <select>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

      </div>


        <div className='charts'>
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Car" fill="blue" />
                <Bar dataKey="Bike" fill="green" />
                </BarChart>
            </ResponsiveContainer>

   
        </div>
        </div>
    </main>
  )
}

export default Home