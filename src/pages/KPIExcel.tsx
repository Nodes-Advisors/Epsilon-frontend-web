import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ReactDOM from 'react-dom'
import { Bar } from 'react-chartjs-2'
import 'chart.js/auto'

// Define the structure of the data for deals and account holders
interface DealData {
  dealName: string;
  totalOutreach: number;
  newFund: number;
  respondOrNot: number;
}

interface AccountHolderData {
  accountHolder: string;
  totalOutreach: number;
  newFund: number;
  respondOrNot: number;
  newRespond: number;
}

const App: React.FC = () => {
  const [dealData, setDealData] = useState<DealData[]>([])
  const [accountHolderData, setAccountHolderData] = useState<AccountHolderData[]>([])
  const [chartData, setChartData] = useState({})
  const [loading, setLoading] = useState<boolean>(true)

  const tableStyle = {
    width: '45%',
    margin: '0 2.5%',
  }

  const tableContainerStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '20px',
  }

  useEffect(() => {
    // Fetch the data for deals
    const fetchDealData = async () => {
      try {
        const response = await axios.get<DealData[]>('http://localhost:5002/deals')
        setDealData(response.data)
      } catch (error) {
        console.error('Error fetching deal data:', error)
      }
    }

    // Fetch the data for account holders
    const fetchAccountHolderData = async () => {
      try {
        const response = await axios.get<AccountHolderData[]>('http://localhost:5002/account-holders')
        setAccountHolderData(response.data)
      } catch (error) {
        console.error('Error fetching account holder data:', error)
      }
    }

    // Fetch both datasets
    Promise.all([fetchDealData(), fetchAccountHolderData()]).then(() => {
      setLoading(false)
      // You can also set up chart data here if it depends on the fetched data
    })
  }, [])

  useEffect(() => {
    // Assuming the dealData is already populated
    const chartLabels = dealData.map((item) => item.dealName)
    const totalOutreachData = dealData.map((item) => item.totalOutreach)
    const newFundData = dealData.map((item) => item.newFund)
    const respondOrNotData = dealData.map((item) => item.respondOrNot)

    setChartData({
      labels: chartLabels,
      datasets: [
        {
          label: 'Total Outreach',
          data: totalOutreachData,
          backgroundColor: 'rgba(255, 99, 132, 1)', // Brighter color
          barThickness: 'flex', // Adjust bar thickness
        },
        {
          label: 'New Fund',
          data: newFundData,
          backgroundColor: 'rgba(54, 162, 235, 1)', // Brighter color
          barThickness: 'flex', // Adjust bar thickness
        },
        {
          label: 'Respond or Not',
          data: respondOrNotData,
          backgroundColor: 'rgba(255, 206, 86, 1)', // Brighter color
          barThickness: 'flex', // Adjust bar thickness
        },
      ],
    })
  }, [dealData]) // This effect runs when dealData is set

  // Chart options
  const chartOptions = {
    indexAxis: 'y', // For horizontal bar chart
    elements: {
      bar: {
        borderWidth: 1.5,
        // Set minimum bar thickness
        minBarLength: 2,
      },
    },
    responsive: true,
    maintainAspectRatio: false, // Add this to maintain aspect ratio
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'white', // Adjust to white color for visibility on black background
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white', // Adjust to white color for visibility on black background
        },
      },
      y: {
        ticks: {
          color: 'white', // Adjust to white color for visibility on black background
          autoSkip: false, // Ensure all labels are shown
          maxRotation: 0, // Prevent rotation of labels
          minRotation: 0,
        },
      },
    },
  }

  return (
    <div>
      {loading ? (
        <p>Loading data...</p >
      ) : (
        <div>
          <div style={tableContainerStyle}>
            {/* Deal Data Table */}
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Deal Name</th>
                  <th>Total Outreach</th>
                  <th>New Fund</th>
                  <th>Respond or Not</th>
                </tr>
              </thead>
              <tbody>
                {dealData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.dealName}</td>
                    <td>{item.totalOutreach}</td>
                    <td>{item.newFund}</td>
                    <td>{item.respondOrNot}</td>
                  </tr>
                ))}
                <tr>
                  <td>Grand Total</td>
                  <td>{dealData.reduce((acc, item) => acc + item.totalOutreach, 0)}</td>
                  <td>{dealData.reduce((acc, item) => acc + item.newFund, 0)}</td>
                  <td>{dealData.reduce((acc, item) => acc + item.respondOrNot, 0)}</td>
                </tr>
              </tbody>
            </table>

            {/* Account Holder Data Table */}
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Account Holder</th>
                  <th>Total Outreach</th>
                  <th>New Fund</th>
                  <th>Respond or Not</th>
                  <th>New Respond</th>
                </tr>
              </thead>
              <tbody>
                {accountHolderData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.accountHolder}</td>
                    <td>{item.totalOutreach}</td>
                    <td>{item.newFund}</td>
                    <td>{item.respondOrNot}</td>
                    <td>{item.newRespond}</td>
                  </tr>
                ))}
                <tr>
                  <td>Grand Total</td>
                  <td>{accountHolderData.reduce((acc, item) => acc + item.totalOutreach, 0)}</td>
                  <td>{accountHolderData.reduce((acc, item) => acc + item.newFund, 0)}</td>
                  <td>{accountHolderData.reduce((acc, item) => acc + item.respondOrNot, 0)}</td>
                  <td>{accountHolderData.reduce((acc, item) => acc + item.newRespond, 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ height: '400px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  )
}

const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.render(<App />, rootElement)
}