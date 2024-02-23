import axios from 'axios'
import { MouseEvent, useEffect, useRef, useState } from 'react'
import { useTokenStore, useUserStore } from '../store/store'
import { SERVER_ADDRESS } from '../lib/utils'
export default function Database() {
  const [query, setQuery] = useState<string>('')
  const [data, setData] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [buttonNames, setButtonNames] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({})
  const loader = useRef(null)
  const [filterOptions, setFilterOptions] = useState({})
  const [fields, setFields] = useState<string[]>([])
  const formRef = useRef(null)
  const [remaining, setRemaining] = useState(true)
  const token = useTokenStore((state) => state.token)
  const user = useUserStore((state) => state.user)
  
  
  useEffect(() => {
    if (query === '') return
    const fetchFields = async (query) => {
      const res = await axios.get(`http://${SERVER_ADDRESS}:5001/getFields/${query}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
        },
      })
      setFields(res.data)
      // console.log(res.data)
      const newFilterOptions = {}
      // console.log(res.data)
      for (const field of res.data) {
        const res2 = await axios.get(`http://${SERVER_ADDRESS}:5001/getUniqueValues/${query}/${field}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token,
              'email': user?.email,
            },
          })
        // console.log(res2.data)
        newFilterOptions[field] = res2.data
      }

      setFilterOptions(newFilterOptions)
    }

    fetchFields(query)
   
  }, [query])

  useEffect(() => {
    if (query === '') return
    const fetchData = async (query, page) => {
      const res = await axios.get(`http://${SERVER_ADDRESS}:5001/getCollections/${query}`, {
        params: {
          page: page,
          pageSize: 500,
          filters: JSON.stringify(filters),
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
        },
      })
      if (res.data.length === 0) {
        setRemaining(false)
      }
      setData(prevData => [...prevData, ...res.data])
    }
    console.log(page)
    fetchData(query, page)
  }, [query, page, filters])

  // useEffect(() => {
  //   const options = {
  //     root: null,
  //     rootMargin: '20px',
  //     threshold: 1.0,
  //   }

  //   const observer = new IntersectionObserver(handleObserver, options)
  //   if (loader.current) {
  //     observer.observe(loader.current)
  //   }

  // }, [])

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    })
    setData([])
    setPage(1)
  }

  const handleFilterSubmit = (event) => {
    event.preventDefault()
    // setIsFilterActive(true)
    // setData([])
    // setPage(1)
  }

  const handleObserver = (entities) => {
    const target = entities[0]
    if (target.isIntersecting) {   
      setPage((prev) => prev + 1)
    }
  }

  useEffect(() => {
    const fetchCollections = async() => {
      const res = await axios.get(`http://${SERVER_ADDRESS}:5001/getCollections`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
        },
      })
      if (res.status === 200) {
        setButtonNames(res.data)
      }
    }
    fetchCollections()
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '3rem' }}>
      <h1>Database</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '70%' }} onClick={(e: MouseEvent) => { setPage(1); setQuery(e.target.innerText); setData([]) }}>
        {
          buttonNames.map((name, index) => <button key={index} style={{ padding: '1rem', fontSize: '1.5rem', borderRadius: '0.5rem', border: 'none' }}>{name}</button>)
        }
        
      </div>
      <form onSubmit={handleFilterSubmit} ref={formRef}>
        {
          fields.length > 0 && fields.map((key, index) => (
            <div key={index}>
              <label>{key}</label>
              <select
                style={{width: '200px'}}
                name={key}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {
                  filterOptions[key] && filterOptions[key].map((option, i) => (
                    <option key={i} value={option}>{option}</option>
                  ))
                }
              </select>
            </div>
          ))
        }
        {/* <button type="submit">Apply filters</button> */}
      </form>
      <button onClick={() => {
        setFilters({})
        setPage(1)
        setData([])
        if (formRef.current) {
          formRef.current.reset()
        }
        // setIsFilterActive(false)
      }
      }>Clear filter</button>
      <table style={{ gap: '1rem', padding: '3rem', alignSelf: 'start' }}>
        <thead>
          <tr>
            {
              (() => {
                const allKeys = new Set()
                data.forEach(item => {
                  Object.keys(item).forEach(key => allKeys.add(key))
                })
                return Array.from(allKeys).map((key, index) => <th key={index} style={{
                  padding: '0 10px', maxWidth: '100px', wordWrap: 'break-word'}}>{key}</th>)
              })()
            }
          </tr>
        </thead>
        <tbody>
          {
            data.map((item: object, index: number) => (
              <tr key={index}>
                {Object.values(item).map((value, i) => <td key={i} style={{padding: '0 10px', maxWidth: '100px', wordWrap: 'break-word'}}>{value === false ? 'False' : value}</td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
      <div  className="loading" ref={loader}>
        {
          !remaining 
            ?
            <h2>no more data</h2>
            :
            <button onClick={() => setPage(page => page + 1)}>Load More</button>

        }
      </div>
    </div>
  )
}