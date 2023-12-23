// import { useEffect, useState } from 'react'
// import axios from 'axios'
// import Table from './Table'
// import "./app.css";

// function GPTdata() {
//   const [query, setQuery] = useState("");
//   const [data, setData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [senders, setSenders] = useState([]);
//   const [investorEmails, setInvestorEmails] = useState([]);
//   const [deals, setDeals] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await axios.get(`http://localhost:5001?q=${query}`);
//       setData(res.data);
//       setFilteredData(res.data);

//       // Extract unique senders
//       const uniqueSenders = [...new Set(res.data.map(item => item.sender))];
//       setSenders(uniqueSenders);

//       // Extract investor emails
//       const investorEmails = [...new Set(res.data.map(item => (item.isInvestorEmail).toString()))];
//       setInvestorEmails(investorEmails);

//       // Extract unique deals
//       const uniqueDeals = [...new Set(res.data.map(item => item.project))];
//       setDeals(uniqueDeals);
//     };
//     if (query.length === 0 || query.length > 2) fetchData();
//   }, [query]);

//   // Filter by each unique sender
//   const filterBySender = (sender) => {
//     const filteredSender = data.filter(item => item.sender === sender);
//     setFilteredData(filteredSender);
//   };

//   // Filter by whether the emails isInvestorEmail
//   const filterByInvestorEmail = (investors) => {
//     const filteredInvestor = data.filter(item => (item.isInvestorEmail).toString() === investors);
//     setFilteredData(filteredInvestor);
//   };

//   // Filter by each unique deal
//   const filterByDeal = (deals) => {
//     const filteredDeal = data.filter(item => item.project === deals);
//     setFilteredData(filteredDeal);
//   };

//   return (
//     <div className="app">

//       {/* Side bar buttons for selecting senders */}
//       {/* <div className="sidebar">
//         {senders.map(sender => (
//           <button key={sender} onClick={() => filterBySender(sender)}>
//             {sender}
//           </button>
//         ))}
//       </div> */}

//       {/* Side bar buttons for selecting investor emails (true / false) */}
//       <div className="sidebar">
//         {investorEmails.map(investors => (
//           <button key={investors} onClick={() => filterByInvestorEmail(investors)}>
//             {investors}
//           </button>
//         ))}
//       </div>

//       {/* Side bar buttons for selecting deals */}
//       <div className="sidebar">
//         {deals.map(deals => (
//           <button key={deals} onClick={() => filterByDeal(deals)}>
//             {deals}
//           </button>
//         ))}
//       </div>

//       {/* Search bar and display info table */}
//       <div className="main-content">
//         <input
//           className="search"
//           placeholder="Search..."
//           onChange={(e) => setQuery(e.target.value.toLowerCase())}
//         />
//         <Table data={filteredData} />
//       </div>
//     </div>
//   );
// }

// export default GPTdata;





import { useEffect, useState } from 'react'
import axios from 'axios'
import Table from './Table'
// import './app.css'

interface IDataItem {
  sender: string;
  isInvestorEmail: boolean;
  project: string;
}

function GPTdata() {
  const [query, setQuery] = useState<string>('')
  const [data, setData] = useState<IDataItem[]>([])
  const [filteredData, setFilteredData] = useState<IDataItem[]>([])
  const [senders, setSenders] = useState<string[]>([])
  const [investorEmails, setInvestorEmails] = useState<string[]>([])
  const [deals, setDeals] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`http://localhost:5001?q=${query}`)
      setData(res.data)
      setFilteredData(res.data)
  
      // Extract unique senders
      const uniqueSenders = Array.from(new Set(res.data.map((item: IDataItem) => item.sender)))
      setSenders(uniqueSenders as string[])
  
      // Extract investor emails
      const investorEmails = Array.from(new Set(res.data.map((item: IDataItem) => item.isInvestorEmail.toString())))
      setInvestorEmails(investorEmails as string[])
  
      // Extract unique deals
      const uniqueDeals = Array.from(new Set(res.data.map((item: IDataItem) => item.project)))
      setDeals(uniqueDeals as string[])
    }
    if (query.length === 0 || query.length > 2) fetchData()
  }, [query])

  const filterBySender = (sender: string) => {
    const filteredSender = data.filter((item: IDataItem) => item.sender === sender)
    setFilteredData(filteredSender)
  }

  const filterByInvestorEmail = (investors: string) => {
    const filteredInvestor = data.filter((item: IDataItem) => item.isInvestorEmail.toString() === investors)
    setFilteredData(filteredInvestor)
  }

  const filterByDeal = (deals: string) => {
    const filteredDeal = data.filter((item: IDataItem) => item.project === deals)
    setFilteredData(filteredDeal)
  }

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

      {/* Side bar buttons for selecting investor emails (true / false) */}
      <div className="sidebar">
        {investorEmails.map(investors => (
          <button key={investors} onClick={() => filterByInvestorEmail(investors)}>
            {investors}
          </button>
        ))}
      </div>

      {/* Side bar buttons for selecting deals */}
      <div className="sidebar">
        {deals.map(deals => (
          <button key={deals} onClick={() => filterByDeal(deals)}>
            {deals}
          </button>
        ))}
      </div>

      {/* Search bar and display info table */}
      <div className="main-content">
        <input
          className="search"
          placeholder="Search..."
          onChange={(e) => setQuery(e.target.value.toLowerCase())}
        />
        <Table data={filteredData} />
      </div>
    </div>
  )
}

export default GPTdata