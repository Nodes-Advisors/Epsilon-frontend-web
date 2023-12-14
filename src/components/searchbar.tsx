import styles from '../styles/home.module.less'
import SearchBarIcon from '../assets/svgs/search-bar-icon.svg?react'
import { useEffect, useMemo, useState } from 'react'
import DropdownUl from './dropdown-ul'
import { useQuery } from 'react-query'
import { throttle, debounce } from 'lodash'

export default function SearchBar() {

  const [inputValue, setInputValue] = useState<string>('')
  const [focus, setFocus] = useState<boolean>(false)
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

  const setSearchValue = useMemo(() => {
    const debouncedSetInputValue = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
    }, 500)
  
    return throttle((e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSetInputValue(e)
    }, 500, { leading: false, trailing: true })
  }, [])
  
  const { isFetching, error, data, refetch } = useQuery('search', 
    () => fetchSearch(),
    { enabled: inputValue !== '' })
  
  const empty = inputValue === '' || (inputValue !== '' && !focus) || !data ? '' : '-non'

  useEffect(() => {
    refetch()
    
  }, [inputValue])

  const memoData = useMemo(() => data, [data])

  return (
    <div className={styles['search-bar']}>
      <SearchBarIcon className={styles['search-bar-icon']}/>
      <input id={styles['search-bar-input' + `${empty}-empty`]} maxLength={100} type="text" placeholder="Search"
        onChange={e => setSearchValue(e)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      />
      {
        error ? 
          <div>Error: {(error as {message: string}).message as string}</div>
          : 
          !isFetching
            ? inputValue !== '' && <DropdownUl data={focus ? memoData : []} searchItem={inputValue} focused={focus} />
            : null
      }
    </div>
  )
}
    