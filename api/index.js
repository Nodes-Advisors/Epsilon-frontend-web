/* eslint-disable no-console */
/* eslint-disable no-undef */
import app from './src/app.js'

const PORT = process.env.PORT || 5002
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
