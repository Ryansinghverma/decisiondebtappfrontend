import { useState } from 'react';

interface SliderProps {
  label?: string;
  min: number;
  max: number;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  showValue?: boolean;
}

export function Slider({ 
  label, 
  min, 
  max, 
  defaultValue = min, 
  value: controlledValue,
  onChange,
  showValue = true 
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setInternalValue(newValue);
    onChange?.(newValue);
  };
  
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-foreground">
            {label}
          </label>
          {showValue && (
            <span className="text-muted-foreground">
              {value}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
