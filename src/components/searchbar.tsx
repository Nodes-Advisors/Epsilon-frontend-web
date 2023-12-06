import styles from '../styles/home.module.less'
import SearchBarIcon from '../assets/svgs/search-bar-icon.svg?react'

export default function SearchBar() {
  return (
    <div className={styles['search-bar']}>
      <SearchBarIcon id={styles['search-bar-icon']}/>
      <input id={styles['search-bar-input']} type="text" placeholder="Search" />
    </div>
  )
}
    