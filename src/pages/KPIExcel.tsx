import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ReactDOM from 'react-dom'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import 'chart.js/auto'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { SERVER_ADDRESS } from '../lib/utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

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
  const [accountHolderData, setAccountHolderData] = useState<
    AccountHolderData[]
  >([])
  const [dealChartData, setDealChartData] = useState({})
  const [loading, setLoading] = useState<boolean>(true)
  const [monthlyTotals, setMonthlyTotals] = useState([])
  const [monthlyLineData, setMonthlyLineData] = useState({})
  const [accountHoldersLineData, setAccountHoldersLineData] = useState({})
  const [accountHoldersPieData, setAccountHoldersPieData] = useState({})
  const [combinedChartData, setCombinedChartData] = useState({})

  const tableStyle = {
    width: '40%',
    margin: '0 1%',
  }

  const tableContainerStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '20px',
  }

  useEffect(() => {
    // Fetch the Data for Deals
    const fetchDealData = async () => {
      try {
        const response = await axios.get<DealData[]>(
          `http://${SERVER_ADDRESS}:5002/deals`,
        )
        setDealData(response.data)
      } catch (error) {
        console.error('Error fetching deal data:', error)
      }
    }

    // Fetch the data for account holders
    const fetchAccountHolderData = async () => {
      try {
        const response = await axios.get<AccountHolderData[]>(
          `http://${SERVER_ADDRESS}:5002/account-holders`,
        )
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
    // For Deal KPI Chart
    const chartLabels = dealData.map((item) => item.dealName)
    const totalOutreachData = dealData.map((item) => item.totalOutreach)
    const newFundData = dealData.map((item) => item.newFund)
    const respondOrNotData = dealData.map((item) => item.respondOrNot)

    setDealChartData({
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

  // Deal Chart Options
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

  useEffect(() => {
    // Fetch the monthly totals data
    const fetchMonthlyTotals = async () => {
      try {
        const response = await axios.get(
          `http://${SERVER_ADDRESS}:5002/monthly-totals`,
        )
        setMonthlyTotals(response.data)
      } catch (error) {
        console.error('Error fetching monthly totals:', error)
      }
    }

    fetchMonthlyTotals()
  }, []) // Run once on component mount

  useEffect(() => {
    // For Monthly KPI Chart
    const chartLabels = monthlyTotals.map(
      (data) => `${data.month}/${data.year}`,
    )
    const totalOutreachData = monthlyTotals.map((data) => data.totalOutreach)
    const totalNewFundData = monthlyTotals.map((data) => data.totalNewFund)
    const totalResponseData = monthlyTotals.map((data) => data.totalResponse)

    setMonthlyLineData({
      labels: chartLabels,
      datasets: [
        {
          label: 'Total Outreach',
          data: totalOutreachData,
          borderColor: 'rgb(0, 123, 255)', // Blue
          backgroundColor: 'rgba(0, 123, 255, 0.5)', // Light blue
          fill: false,
          tension: 0.1,
        },
        {
          label: 'Total New Fund',
          data: totalNewFundData,
          borderColor: 'rgb(255, 193, 7)', // Orange
          backgroundColor: 'rgba(255, 193, 7, 0.5)', // Light orange
          fill: false,
          tension: 0.1,
        },
        {
          label: 'Total Response',
          data: totalResponseData,
          borderColor: 'rgb(108, 117, 125)', // Gray
          backgroundColor: 'rgba(108, 117, 125, 0.5)', // Light gray
          fill: false,
          tension: 0.1,
        },
      ],
    })
  }, [monthlyTotals]) // This effect runs when monthlyTotals is set

  // Monthly Chart Options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Count',
        },
      },
    },
  }

  // Helper function to transform the data into Chart.js format
  const transformDataForChart = (rawData) => {
    // Group data by account holders
    const dataByAccountHolder = rawData.reduce(
      (acc, { accountHolder, month, year, totalOutreach }) => {
        const monthYear = `${month}-${year}`
        if (!acc[accountHolder]) {
          acc[accountHolder] = {
            label: accountHolder,
            data: [],
            borderColor: getRandomColor(),
            fill: false,
            tension: 0.1,
          }
        }
        acc[accountHolder].data.push({ monthYear, totalOutreach })
        return acc
      },
      {},
    )

    // Sort data by month-year for each account holder
    for (const holder of Object.keys(dataByAccountHolder)) {
      dataByAccountHolder[holder].data.sort(
        (a, b) => new Date(a.monthYear) - new Date(b.monthYear),
      )
    }

    // Create the labels (month-year) and datasets for the chart
    const labels = [
      ...new Set(rawData.map(({ month, year }) => `${month}-${year}`)),
    ].sort((a, b) => new Date(a) - new Date(b))
    const datasets = Object.values(dataByAccountHolder).map(
      (accountHolder) => ({
        label: accountHolder.label,
        data: labels.map((label) => {
          const entry = accountHolder.data.find(
            (entry) => entry.monthYear === label,
          )
          return entry ? entry.totalOutreach : null
        }),
        borderColor: accountHolder.borderColor,
        fill: accountHolder.fill,
        tension: accountHolder.tension,
      }),
    )

    return { labels, datasets }
  }

  // Random color generator for the datasets
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  // useEffect hook to fetch data and transform it for the chart
  useEffect(() => {
    const fetchAccountHolderKPIs = async () => {
      try {
        const response = await axios.get(
          `http://${SERVER_ADDRESS}:5002/account-holder-kpis`,
        )
        const transformedData = transformDataForChart(response.data)
        setAccountHoldersLineData(transformedData)
      } catch (error) {
        console.error('Error fetching account holder KPIs:', error)
      }
    }

    fetchAccountHolderKPIs()
  }, [])

  useEffect(() => {
    const fetchTotalOutreachPerAccountHolder = async () => {
      try {
        const response = await axios.get(
          `http://${SERVER_ADDRESS}:5002/total-outreach-per-account-holder`,
        )
        const dataForPieChart = transformDataForPieChart(response.data)
        setAccountHoldersPieData(dataForPieChart)
      } catch (error) {
        console.error(
          'Error fetching total outreach per account holder:',
          error,
        )
      }
    }

    fetchTotalOutreachPerAccountHolder()
  }, [])

  // Helper function to transform the data into Chart.js format for the doughnut chart
  const transformDataForPieChart = (data) => {
    return {
      labels: data.map((item) => item.accountHolder),
      datasets: [
        {
          data: data.map((item) => item.totalOutreach),
          backgroundColor: data.map(() => getRandomColor()),
          borderWidth: 1,
        },
      ],
    }
  }

  useEffect(() => {
    // Fetch the monthly totals data
    const fetchMonthlyTotals = async () => {
      try {
        const response = await axios.get(
          `http://${SERVER_ADDRESS}:5002/monthly-totals`,
        )
        setMonthlyTotals(response.data)
        // Here we create the combined chart data
        const chartData = createCombinedChartData(response.data)
        setCombinedChartData(chartData)
      } catch (error) {
        console.error('Error fetching monthly totals:', error)
      }
    }

    fetchMonthlyTotals()
  }, []) // Run once on component mount

  // Function to create combined chart data
  const createCombinedChartData = (data) => {
    const labels = data.map((item) => `${item.month}/${item.year}`)
    const totalOutreachData = data.map((item) => item.totalOutreach)
    const totalNewFundData = data.map((item) => item.totalNewFund)
    const totalResponseData = data.map((item) => item.totalResponse)
    const averageResponseData = data.map((item) => item.averageResponse)

    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Total Outreach',
          data: totalOutreachData,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          type: 'bar',
          label: 'Total New Fund',
          data: totalNewFundData,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          type: 'line',
          label: 'Total Response',
          data: totalResponseData,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          fill: true,
        },
        {
          type: 'line',
          label: 'Average Response',
          data: averageResponseData,
          borderColor: 'rgba(255, 205, 86, 1)',
          backgroundColor: 'rgba(255, 205, 86, 0.5)',
          fill: false,
        },
      ],
    }
  }

  const combinedChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  return (
    <div>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div>
          <h2>Statistics for Each Deal</h2>
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
                  <td>
                    {dealData.reduce(
                      (acc, item) => acc + item.totalOutreach,
                      0,
                    )}
                  </td>
                  <td>
                    {dealData.reduce((acc, item) => acc + item.newFund, 0)}
                  </td>
                  <td>
                    {dealData.reduce((acc, item) => acc + item.respondOrNot, 0)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Horizontal Bar Plot for Each Deal's KPI */}
            <div style={{ height: '800px', width: '950px' }}>
              <Bar data={dealChartData} options={chartOptions} />
            </div>
          </div>

          <h2>Account Holders' KPI</h2>

          <div style={tableContainerStyle}>
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
                  <td>
                    {accountHolderData.reduce(
                      (acc, item) => acc + item.totalOutreach,
                      0,
                    )}
                  </td>
                  <td>
                    {accountHolderData.reduce(
                      (acc, item) => acc + item.newFund,
                      0,
                    )}
                  </td>
                  <td>
                    {accountHolderData.reduce(
                      (acc, item) => acc + item.respondOrNot,
                      0,
                    )}
                  </td>
                  <td>
                    {accountHolderData.reduce(
                      (acc, item) => acc + item.newRespond,
                      0,
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Line Plot for Each Account Holder */}
            <div style={{ height: '500px', width: '950px' }}>
              <Line data={accountHoldersLineData} options={lineChartOptions} />
            </div>
          </div>

          {/* Doughnut Plot for Each Account Users' Total Outreach */}
          <div style={tableContainerStyle}>
            <div>
              <Doughnut data={accountHoldersPieData} />
            </div>
          </div>

          <h2>Statistics for Each Month</h2>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            {/* Table for KPI in Each Month */}
            <div style={{ flex: '1', minWidth: '300px' }}>
              {' '}
              {/* Adjust minWidth according to your need */}
              <table
                style={{ width: '100%' /* Adjust the tableStyle as needed */ }}
              >
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Total Outreach</th>
                    <th>Total New Fund</th>
                    <th>Total Response</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTotals.map((data, index) => (
                    <tr key={index}>
                      <td>{`${data.month}/${data.year}`}</td>
                      <td>{data.totalOutreach}</td>
                      <td>{data.totalNewFund}</td>
                      <td>{data.totalResponse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Line chart for monthly data */}
            <div style={{ flex: '2', minWidth: '300px' }}>
              {' '}
              {/* Adjust minWidth according to your need */}
              <div style={{ height: '500px', width: '100%' }}>
                {/* <Line data={combinedChartData} options={combinedChartOptions} /> */}
              </div>
            </div>
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
