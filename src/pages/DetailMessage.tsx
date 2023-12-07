import { useLocation, useNavigate } from 'react-router-dom'

export default function DetailMessage() {
  const { state } = useLocation()
  const data = state as { [key: string]: string | boolean }
  const navigate = useNavigate()
  return (
    <div>
      {
        Object.keys(data).map((key, i) => (
          <h2 key={i}>{key}: {data[key] ?? 'null'}</h2>
        ))
      }

      <button onClick={() => navigate(-1)}>go back</button>
    </div>
  )
}