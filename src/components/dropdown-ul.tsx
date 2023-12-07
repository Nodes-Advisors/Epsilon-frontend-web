import styles from '../styles/home.module.less'
import SearchBarIcon from '../assets/svgs/search-bar-icon.svg?react'
import { Fragment, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DetailMessage from '../pages/DetailMessage'
import { memo } from 'react'
type IEmailDetail = {
  sender: string,
  subject: string,
  toRecipients: string,
  id: string,
  [key: string]: string | boolean
}
// may change backend to decide which keyword is matched
const DropdownUl = ({data, searchItem}: {data: IEmailDetail[], searchItem: string}) => {

  const navigate = useNavigate()
  const displayData = (email: IEmailDetail) => {
    const { sender, subject, toRecipients } = email
    const emailDetail: { [key: string]: string } = { sender, subject, toRecipients }
    for (const key in emailDetail) {
      if (emailDetail[key].toLowerCase().includes(searchItem.toLowerCase())) {
        return `${key}: ${emailDetail[key]}`
      }
    }
    // return `${sender} - ${subject} - ${toRecipients}`
  }


  return (
    <ul className={styles['dropdown-ul']}>
      {
        Array.from({length: data ? data.length + 2 : 2}, (_, i) => i).map((_, i) => (
          i === 0 ? (
            <Fragment key={i}>
              <li className={styles['dropdown-li']}></li>
            </Fragment>
          ) : (
            <li key={i} className={styles['dropdown-fragment']}>
              <SearchBarIcon className={styles['dropdown-icon']}/>
              <p className={styles['dropdown-li']} onClick={() => {
                if (i !== 1)
                  navigate('detailmessage', { state: data[i-2] })
              }}>{ i !== 1 ? displayData(data[i-2]) : searchItem}</p>
            </li>
          )
        ))
      }
    </ul>
  )
}

export default memo(DropdownUl)