
import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  allowDecimals?: boolean;
  decimalSeparator?: string;
  maxDecimals?: number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, allowDecimals = true, decimalSeparator = '.', maxDecimals = 3, ...props }, ref) => {
    // Handle number inputs with decimal support
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (type === 'number' && allowDecimals && event.target.value) {
        const value = event.target.value;
        
        // Allow decimal input with specified separator
        const regex = new RegExp(`^[0-9]*${decimalSeparator.replace('.', '\\.')}?[0-9]{0,${maxDecimals}}$`);
        
        if (!regex.test(value) && value !== '') {
          // Revert to previous valid value or empty
          event.target.value = event.target.defaultValue || '';
        }
      }
      
      if (props.onChange) {
        props.onChange(event);
      }
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
