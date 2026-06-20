import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleNumberInput(
  inputValue: string,
  currentValue: string | number
): string {
  const currentStr = currentValue.toString();
  if (inputValue === '') return '';
  if (/^\d*\.?\d*$/.test(inputValue)) {
    if ((currentValue === '0' || currentValue === 0 || currentValue === '') && inputValue.length === 1) {
      if (inputValue !== '0') {
        return inputValue;
      }
    }
    return inputValue;
  }
  return String(currentValue);
}
