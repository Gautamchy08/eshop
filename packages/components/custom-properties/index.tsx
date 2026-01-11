import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { PlusCircle, Trash2, X } from 'lucide-react';

const CustomProperties = ({ control, errors }: any) => {
  const [properties, setProperties] = useState<
    { label: string; values: string[] }[]
  >([]);

  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'custom_Specifications',
  });
  return (
    <div>
      <div className="flex flex-col gap-3">
        <Controller
          name="customProperties"
          control={control}
          render={({ field }) => {
            useEffect(() => {
              field.onChange(properties);
            }, [properties]);

            const addProperty = () => {
              if (!newLabel.trim()) return;
              setProperties([...properties, { label: newLabel, values: [] }]);
              setNewLabel('');
            };

            const addValue = (index: number) => {
              if (!newValue.trim()) return;
              const updatedProperties = [...properties];
              updatedProperties[index].values.push(newValue);
              setProperties(updatedProperties);
              setNewValue('');
            };
            const removeProperty = (index: number) => {
              setProperties(properties.filter((_, i) => i !== index));
            };
            return (
              <div className="mt-2">
                <label className="block  font-semibold text-gray-300 mb-1">
                  Custom Properties
                </label>
                {/* showing existing property */}
                <div className="flex flex-col gap-3">
                  {properties.map((property, index) => (
                    <div
                      key={index}
                      className="border border-gray-700 p-3 rounded-lg bg-gray-900"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">
                          {property.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProperty(index)}
                        >
                          {<X size={18} className="text-red-500" />}
                        </button>
                      </div>

                      {/* add value to properties */}
                      <div className="flex items-center mt-2 gap-2 ">
                        <input
                          type="text"
                          className="outline-none border border-gray-700 bg-gray-800  p-2 rounded-md text-black  w-full "
                          placeholder="Enter Value..."
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                        />

                        <button
                          type="button"
                          className="px-3 py-1  bg-blue-500 text-white rounded-md"
                          onClick={() => addValue(index)}
                        >
                          Add
                        </button>
                      </div>

                      {/* showing values */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {property.values.map((value, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-700 text-white rounded-md"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new property input */}
                <div className="flex items-center mt-3 gap-2">
                  <input
                    type="text"
                    className="outline-none border border-gray-700 bg-green-800 p-2 rounded-md text-white flex-1"
                    placeholder="Property name (e.g., Size, Color)"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-500 text-white rounded-md flex items-center gap-2"
                    onClick={addProperty}
                  >
                    <PlusCircle size={18} />
                    Add Property
                  </button>
                </div>
              </div>
                
            );
          }}
        />
      </div>
    </div>
  );
};

export default CustomProperties;
