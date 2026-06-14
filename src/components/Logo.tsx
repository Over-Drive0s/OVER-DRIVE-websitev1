import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const sizeClasses = {
  sm: 'h-10',
  md: 'h-14 lg:h-16',
  lg: 'h-16 lg:h-[4.5rem]',
}

export default function Logo({ className = '', size = 'md', onClick }: LogoProps) {
  return (
    <Link to="/" className={`inline-flex shrink-0 items-center ${className}`} onClick={onClick}>
      <img
        src="/logo.png"
        alt="Overdrive IO"
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
    </Link>
  )
}
