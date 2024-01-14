import { useEffect, useState } from 'react'
import styles from '../styles/home.module.less'
import Skeleton from 'react-loading-skeleton'
import GPTdata from './GPTdata'
import axios from 'axios'
import Table from './Table'

function LiveUpdate() {
  const [isLoading, setLoading] = useState(true)
  const [focused, setFocused] = useState<'all' | 'you'>('all')

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div className={styles['live-update-button-layout']}>
        <button
          className={
            focused === 'all'
              ? styles['live-update-option-button-highlighted']
              : styles['live-update-option-button']
          }
          onClick={() => {
            setFocused('all')
            setLoading(true)
          }}
        >
          All
        </button>
        <button
          className={
            focused === 'you'
              ? styles['live-update-option-button-highlighted']
              : styles['live-update-option-button']
          }
          onClick={() => {
            setFocused('you')
            setLoading(true)
          }}
        >
          You
        </button>
      </div>
      {isLoading ? (
        <div>
          <ul className={styles['new-ul-skeleton']}>
            {Array.from({ length: 3 }).map((_, index) => {
              return (
                <li key={index}>
                  <Skeleton duration={2.0} />
                </li>
              )
            })}
          </ul>
        </div>
      ) : focused === 'all' ? (
        <ul className={styles['news-ul']}>
          <li>
            <span>6</span> Funds are currently reviewing <span>Avivo</span> Deck
            this week - 2 whom you sourced this week.
          </li>
          <li>
            <span>6</span> Funds are currently reviewing <span>Avivo</span> Deck
            this week - 2 whom you sourced this week.
          </li>
          <li>
            <span>6</span> Funds are currently reviewing <span>Avivo</span> Deck
            this week - 2 whom you sourced this week.
          </li>
        </ul>
      ) : (
        <ul className={styles['news-ul']}>
          <li>
            Digitalis Ventures passed on Avivo - Tyler. Here’s why :”Hi
            Tyler,Thank you for reaching out. While this is an interesting
            approach, it is not a good fit for us. There is a fair amount of
            biological risk delivering GLP1-R through gene therapy, and the
            effort is still early. We&apos;d love to hear more as they advance
            the program!”
          </li>
          <li>
            <span>6</span> Funds are currently reviewing <span>Avivo</span> Deck
            this week - 2 whom you sourced this week.
          </li>
        </ul>
      )}
    </div>
  )
}

export default LiveUpdate
