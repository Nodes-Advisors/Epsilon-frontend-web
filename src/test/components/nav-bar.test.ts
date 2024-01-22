//@ts-nocheck
import { render, fireEvent } from '@testing-library/react'

describe('NavBar', () => {
  it('renders without crashing', async () => {
    const { findByText } = render(<NavBar />)
    expect(await findByText('My Saved Funds')).toBeInTheDocument()
  })

  it('opens and closes the notification panel', async () => {
    const { getByTestId, findByTestId } = render(<NavBar />)
    const notificationIcon = getByTestId('notification-icon')

    // Open the notification panel
    fireEvent.click(notificationIcon)
    expect(await findByTestId('notification-layout')).toBeInTheDocument()

    // Close the notification panel
    fireEvent.click(notificationIcon)
    expect(await findByTestId('notification-layout')).not.toBeInTheDocument()
  })

  it('opens and closes the user panel', async () => {
    const { getByTestId, findByTestId } = render(<NavBar />)
    const profilePic = getByTestId('nav-profile-pic')

    // Open the user panel
    fireEvent.click(profilePic)
    expect(await findByTestId('user-panel')).toBeInTheDocument()

    // Close the user panel
    fireEvent.click(profilePic)
    expect(await findByTestId('user-panel')).not.toBeInTheDocument()
  })
})