import { useEffect, useState } from 'react'
import axios from 'axios'
import Table from './Table'
import { useTokenStore } from '../store/store'
// import './app.css'

interface IDataItem {
  sender: string;
  isInvestorEmail: boolean;
  project: string;
}

function GPTdata() {
  const token = useTokenStore((state) => state.token)
  const [query, setQuery] = useState<string>('')
  const [data, setData] = useState<IDataItem[]>([])
  const [filteredData, setFilteredData] = useState<IDataItem[]>([])
  const [senders, setSenders] = useState<string[]>([])
  const [investorEmails, setInvestorEmails] = useState<string[]>([])
  const [deals, setDeals] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`http://localhost:5001?q=${query}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      })
      setData(res.data)
      setFilteredData(res.data)

      // // Extract unique senders
      // const uniqueSenders = Array.from(
      //   new Set(res.data.map((item: IDataItem) => item.sender))
      // );
      // setSenders(uniqueSenders as string[]);

      // // Extract investor emails
      // const investorEmails = Array.from(
      //   new Set(
      //     res.data.map((item: IDataItem) => item.isInvestorEmail.toString())
      //   )
      // );
      // setInvestorEmails(investorEmails as string[]);

      // // Extract unique deals
      // const uniqueDeals = Array.from(
      //   new Set(res.data.map((item: IDataItem) => item.project))
      // );
      // setDeals(uniqueDeals as string[]);
    }
    if (query.length === 0 || query.length > 2) fetchData()
  }, [query])

  // const filterBySender = (sender: string) => {
  //   const filteredSender = data.filter(
  //     (item: IDataItem) => item.sender === sender
  //   );
  //   setFilteredData(filteredSender);
  // };

  // const filterByInvestorEmail = (investors: string) => {
  //   const filteredInvestor = data.filter(
  //     (item: IDataItem) => item.isInvestorEmail.toString() === investors
  //   );
  //   setFilteredData(filteredInvestor);
  // };

  // const filterByDeal = (deals: string) => {
  //   const filteredDeal = data.filter(
  //     (item: IDataItem) => item.project === deals
  //   );
  //   setFilteredData(filteredDeal);
  // };

  return (
    <div className="app">
      {/* Side bar buttons for selecting senders */}
      {/* <div className="sidebar">
        {senders.map(sender => (
          <button key={sender} onClick={() => filterBySender(sender)}>
            {sender}
          </button>
        ))}
      </div> */}

      {/* Side bar buttons for selecting investor emails (true / false)
      <div className="sidebar">
        {investorEmails.map((investors) => (
          <button
            key={investors}
            onClick={() => filterByInvestorEmail(investors)}
          >
            {investors}
          </button>
        ))}
      </div>

      {/* Side bar buttons for selecting deals 
      <div className="sidebar">
        {deals.map((deals) => (
          <button key={deals} onClick={() => filterByDeal(deals)}>
            {deals}
          </button>
        ))}
      </div> */}

      {/* Search bar and display info table */}
      <div className="main-content">
        {/* <input
          className="search"
          placeholder="Search..."
          onChange={(e) => setQuery(e.target.value.toLowerCase())}
        /> */}
        <Table data={filteredData} />
      </div>
    </div>
  )
}

export default GPTdata
