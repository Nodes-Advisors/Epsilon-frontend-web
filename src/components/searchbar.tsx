import styles from '../styles/home.module.less'
import SearchBarIcon from '../assets/svgs/search-bar-icon.svg?react'
import { useEffect, useMemo, useState } from 'react'
import DropdownUl from './dropdown-ul'
import { useQuery } from 'react-query'
import { throttle } from 'lodash'

export default function SearchBar() {

  const [inputValue, setInputValue] = useState<string>('')

  const fetchSearch = async () => {
    if (inputValue === '') {
      return
    }
    // import.meta.env.VITE_DEVELOPMENT_SERVER_HOST + 
    const res = await fetch(`http://localhost:5001/?q=${inputValue}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    if (!res.ok) {
      throw new Error('Network response was not ok')

    }
    return res.json()
  }

  const setSearchValue = useMemo(() => throttle((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, 500,{ leading: false, trailing: true }), [])
  
  const { isLoading, error, data, refetch } = useQuery('search', 
    () => fetchSearch(),
    { enabled: inputValue !== '' })
  
  const empty = inputValue === '' || !data || data.length === 0 ? '' : '-non'

  useEffect(() => {
    refetch()
  }, [inputValue])


  return (
    <div className={styles['search-bar']}>
      <SearchBarIcon className={styles['search-bar-icon']}/>
      <input id={styles['search-bar-input' + `${empty}-empty`]} maxLength={100} type="text" placeholder="Search"
        onChange={e => setSearchValue(e)} />
      {
        isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {(error as {message: string}).message as string}</div>
        ) : inputValue !== '' && data ? (
          <DropdownUl data={data} searchItem={inputValue} />
        ) : null
      }
    </div>
  )
}
    