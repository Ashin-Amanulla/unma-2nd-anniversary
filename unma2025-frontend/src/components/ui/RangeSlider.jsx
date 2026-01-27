import ReactSlider from "react-slider";
import "./RangeSlider.css";

/**
 * Dual-handle range slider component using react-slider
 * Clean, accessible, and customizable
 */
const RangeSlider = ({ min = 18, max = 60, value, onChange, step = 1 }) => {
  const handleChange = (newValue) => {
    onChange?.({ min: newValue[0], max: newValue[1] });
  };

  return (
    <div className="w-full px-2">
      <ReactSlider
        className="horizontal-slider"
        thumbClassName="slider-thumb"
        trackClassName="slider-track"
        min={min}
        max={max}
        step={step}
        value={[value?.min || min, value?.max || max]}
        onChange={handleChange}
        renderThumb={(props, state) => (
          <div {...props} className="slider-thumb-custom">
            <div className="slider-thumb-inner" />
          </div>
        )}
        renderTrack={(props, state) => (
          <div
            {...props}
            className={`slider-track-custom ${
              state.index === 1 ? "slider-track-active" : ""
            }`}
          />
        )}
      />
      {/* Value Display */}
      <div className="flex justify-between mt-3 text-sm">
        <span className="font-medium text-primary">
          {value?.min || min} years
        </span>
        <span className="font-medium text-primary">
          {value?.max || max} years
        </span>
      </div>
    </div>
  );
};

export default RangeSlider;
