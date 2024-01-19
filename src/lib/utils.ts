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
