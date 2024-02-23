import clsx, { ClassValue } from 'clsx'


export function cx(...args: ClassValue[]) {
  return clsx(...args)
}

export const convertedOutput = (input: string[] | string) => {
  if (Array.isArray(input)) {
    return input.join(', ')
  } else {
    return input
  }
}

export  const handleFullTextFilter = (e, dispatch) => {
  // get data-label of the clicked element
  const target = e.target as HTMLElement
  const text = target.textContent as string
  const label = target.getAttribute('data-label')
  dispatch(prev => ({
    ...prev,
    [label]: [text],
  }))
}

const isInDEVMode = false

export const SERVER_ADDRESS = isInDEVMode ? 'localhost' : '51.20.51.84'