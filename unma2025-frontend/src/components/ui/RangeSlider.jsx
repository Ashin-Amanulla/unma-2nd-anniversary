import { useState, useRef, useEffect } from "react";

/**
 * Dual-handle range slider component
 * Similar to Amazon pricing filter
 */
const RangeSlider = ({ min = 18, max = 60, value, onChange, step = 1 }) => {
  const [minVal, setMinVal] = useState(value?.min || min);
  const [maxVal, setMaxVal] = useState(value?.max || max);
  const minValRef = useRef(null);
  const maxValRef = useRef(null);
  const range = useRef(null);

  // Convert to percentage
  const getPercent = (val) => Math.round(((val - min) / (max - min)) * 100);

  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(+maxValRef.current.value);

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(maxVal);

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [maxVal, getPercent]);

  // Update parent component
  useEffect(() => {
    if (value?.min !== minVal || value?.max !== maxVal) {
      onChange?.({ min: minVal, max: maxVal });
    }
  }, [minVal, maxVal]);

  // Sync with external value changes
  useEffect(() => {
    if (value) {
      setMinVal(value.min || min);
      setMaxVal(value.max || max);
    }
  }, [value]);

  return (
    <div className="w-full">
      <div className="relative h-6">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          ref={minValRef}
          onChange={(event) => {
            const value = Math.min(+event.target.value, maxVal - step);
            setMinVal(value);
            event.target.value = value.toString();
          }}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-10"
          style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          ref={maxValRef}
          onChange={(event) => {
            const value = Math.max(+event.target.value, minVal + step);
            setMaxVal(value);
            event.target.value = value.toString();
          }}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-10"
        />

        <div className="relative w-full">
          {/* Track */}
          <div className="absolute w-full h-2 bg-gray-200 rounded-md"></div>
          {/* Range */}
          <div
            ref={range}
            className="absolute h-2 bg-primary rounded-md"
            style={{
              left: `${getPercent(minVal)}%`,
              width: `${getPercent(maxVal) - getPercent(minVal)}%`,
            }}
          ></div>
          {/* Thumbs */}
          <div
            className="absolute w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform z-20"
            style={{ left: `calc(${getPercent(minVal)}% - 10px)`, top: "-6px" }}
          ></div>
          <div
            className="absolute w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform z-20"
            style={{ left: `calc(${getPercent(maxVal)}% - 10px)`, top: "-6px" }}
          ></div>
        </div>
      </div>

      {/* Value Display */}
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span className="font-medium text-primary">{minVal} years</span>
        <span className="font-medium text-primary">{maxVal} years</span>
      </div>
    </div>
  );
};

export default RangeSlider;
