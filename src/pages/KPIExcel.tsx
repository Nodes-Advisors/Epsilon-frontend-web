// import { useEffect, useState } from 'react'
// import axios from 'axios'
// import Table from './Table'
// // import './app.css'

// interface IDataItem {
//   sender: string;
//   isInvestorEmail: boolean;
//   project: string;

//   deal_name: string;
//   account_holder: string;
//   status_1: string;
//   status_2: string;
// }

// function GPTdata() {
//   const [query, setQuery] = useState<string>('')
//   const [data, setData] = useState<IDataItem[]>([])
//   const [filteredData, setFilteredData] = useState<IDataItem[]>([])
//   const [accountHolders, setAccountHolders] = useState<string[]>([])
//   const [fundStatus, setFundStatus] = useState<string[]>([])
//   const [deals, setDeals] = useState<string[]>([])

//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await axios.get(`http://localhost:5001?q=${query}`)
//       setData(res.data)
//       setFilteredData(res.data)
  
//       // Extract unique deals
//       const uniqueDeals = Array.from(new Set(res.data.map((item: IDataItem) => item.deal_name)))
//       setDeals(uniqueDeals as string[])

//       // Extract unique account_holder
//       const uniqueAccountHolders = Array.from(new Set(res.data.map((item: IDataItem) => item.account_holder)))
//       setAccountHolders(uniqueAccountHolders as string[])
  
//       // Extract unique fund status
//       const uniqueStatus1 = Array.from(new Set(res.data.map((item: IDataItem) => item.status_1)))
//       setFundStatus(uniqueStatus1 as string[])
//       const uniqueStatus2 = Array.from(new Set(res.data.map((item: IDataItem) => item.status_2)))
//       setFundStatus(uniqueStatus2 as string[])
//     }
//     if (query.length === 0 || query.length > 2) fetchData()
//   }, [query])

//   // const filterBySender = (sender: string) => {
//   //   const filteredSender = data.filter((item: IDataItem) => item.sender === sender)
//   //   setFilteredData(filteredSender)
//   // }

//   // const filterByInvestorEmail = (investors: string) => {
//   //   const filteredInvestor = data.filter((item: IDataItem) => item.isInvestorEmail.toString() === investors)
//   //   setFilteredData(filteredInvestor)
//   // }

//   // const filterByDeal = (deals: string) => {
//   //   const filteredDeal = data.filter((item: IDataItem) => item.project === deals)
//   //   setFilteredData(filteredDeal)
//   // }

//   return (
//     <div className="app">


//     </div>
//   )
// }

// export default GPTdata





import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ReactDOM from 'react-dom'

// Define the structure of the data
interface PortfolioData {
  portfolio: string
  totalCount: number
}

const PortfolioTable: React.FC = () => {
  const [data, setData] = useState<PortfolioData[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Fetch the data from the backend
    const fetchData = async () => {
      try {
        const response = await axios.get<PortfolioData[]>('http://localhost:3000/portfolio-counts')
        setData(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      {loading ? (
        <p>Loading data...</p >
      ) : (
        <table>
          <thead>
            <tr>
              <th>Portfolio</th>
              <th>Total Outreach</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.portfolio}</td>
                <td>{item.totalCount}</td>
              </tr>
            ))}
            <tr>
              <td>Grand Total</td>
              <td>{data.reduce((acc, item) => acc + item.totalCount, 0)}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  )
}

export default PortfolioTable

// Assuming you have a root element in your HTML to render the React component
const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.render(<PortfolioTable />, rootElement)
}