import { MouseEventHandler } from 'react'


type TButtonProps =  {
    onClick: MouseEventHandler<HTMLButtonElement>;
    buttonClass: string;
    textClass: string;
    text: string;
  }
  
export default function ActionButton({onClick, buttonClass, textClass, text}: TButtonProps) {
  return (
    <button className={buttonClass} onClick={onClick}>
      <span className={textClass}>{text}</span>
    </button>
  )
}