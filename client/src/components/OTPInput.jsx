import React, { useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, value, onChange, disabled = false }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (e, index) => {
    const val = e.target.value;

    // Only allow digits
    if (!/^[0-9]*$/.test(val)) return;

    // Update the value at this index
    const newValue = value.split('');
    newValue[index] = val.slice(-1); // Take last char if multiple entered
    const newValueStr = newValue.join('').padEnd(length, ' ').slice(0, length);
    onChange(newValueStr.trim());

    // Auto-focus next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current and stay
        const newValue = value.split('');
        newValue[index] = ' ';
        onChange(newValue.join('').trim());
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    onChange(pastedData);

    // Focus the appropriate input
    const focusIndex = Math.min(pastedData.length, length - 1);
    setTimeout(() => {
      inputRefs.current[focusIndex]?.focus();
    }, 0);
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-2xl font-bold rounded-xl transition-all duration-300 focus:outline-none disabled:opacity-50"
          style={{
            background: 'var(--theme-card-bg)',
            border: `2px solid ${value[index] ? 'var(--theme-primary)' : 'var(--theme-border)'}`,
            color: 'var(--theme-text)',
            boxShadow: value[index] ? '0 0 10px var(--theme-primary-glow)' : 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--theme-primary)';
            e.target.style.boxShadow = '0 0 15px var(--theme-primary-glow)';
          }}
          onBlur={(e) => {
            if (!value[index]) {
              e.target.style.borderColor = 'var(--theme-border)';
              e.target.style.boxShadow = 'none';
            }
          }}
        />
      ))}
    </div>
  );
};

export default OTPInput;
