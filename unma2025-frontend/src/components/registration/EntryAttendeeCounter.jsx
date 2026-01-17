import React from "react";
import { motion } from "framer-motion";

const AgeGroup = {
  adults: "adults",
  teens: "teens",
  children: "children",
  toddlers: "toddlers",
};

const ageGroupLabels = {
  adults: "Adults (18+ years)",
  teens: "Teens (12-17 years)",
  children: "Children (5-11 years)",
  toddlers: "Toddlers (Below 5 years)",
};

const defaultValues = {
  adults: { veg: 0, nonVeg: 0 },
  teens: { veg: 0, nonVeg: 0 },
  children: { veg: 0, nonVeg: 0 },
  toddlers: { veg: 0, nonVeg: 0 },
};

const EntryAttendeeCounter = ({
  values = defaultValues,
  onChange,
  disabled = false,
}) => {
  // Ensure values is never undefined
  const currentValues = values || defaultValues;

  const handleCountChange = (ageGroup, foodType, value) => {
    if (disabled) return;

    const newValues = {
      ...currentValues,
      [ageGroup]: {
        ...currentValues[ageGroup],
        [foodType]: Math.max(0, value),
      },
    };
    onChange(newValues);
  };

  const getTotalCount = (ageGroup) => {
    const group = currentValues[ageGroup] || { veg: 0, nonVeg: 0 };
    return (group.veg || 0) + (group.nonVeg || 0);
  };

  const renderCounter = (ageGroup, foodType) => {
    const count = currentValues[ageGroup]?.[foodType] || 0;

    return (
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => handleCountChange(ageGroup, foodType, count - 1)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${
            disabled || count === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700"
          }`}
          disabled={disabled || count === 0}
        >
          −
        </button>
        <span className="w-12 text-center text-xl font-semibold text-gray-700">
          {count}
        </span>
        <button
          type="button"
          onClick={() => handleCountChange(ageGroup, foodType, count + 1)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700"
          }`}
          disabled={disabled}
        >
          +
        </button>
      </div>
    );
  };

  const calculateTotal = (type) => {
    return Object.values(AgeGroup).reduce(
      (sum, group) => sum + (currentValues[group]?.[type] || 0),
      0
    );
  };

  const getTotalAttendees = () => {
    return calculateTotal("veg") + calculateTotal("nonVeg");
  };

  return (
    <div className="space-y-6">
      {Object.values(AgeGroup).map((ageGroup) => (
        <motion.div
          key={ageGroup}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-6 ${
            disabled ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {ageGroupLabels[ageGroup]}
              </h3>
              <p className="text-sm font-medium text-blue-600">
                Total: {getTotalCount(ageGroup)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  🥗 Vegetarian
                </label>
                {renderCounter(ageGroup, "veg")}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  🍖 Non-Vegetarian
                </label>
                {renderCounter(ageGroup, "nonVeg")}
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h4 className="text-lg font-semibold text-blue-800 mb-4">
          📊 Attendee Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {calculateTotal("veg")}
            </div>
            <div className="text-sm text-gray-600">Vegetarian</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-600">
              {calculateTotal("nonVeg")}
            </div>
            <div className="text-sm text-gray-600">Non-Vegetarian</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border-2 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {getTotalAttendees()}
            </div>
            <div className="text-sm text-gray-600">Total Attendees</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryAttendeeCounter;
