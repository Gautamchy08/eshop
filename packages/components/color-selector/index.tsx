import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

const defaultColors = [
  '#000000', // black
  '#ffffff', // white
  '#ff0000', // red
  '#00ff00', // green
  '#0000ff', // blue
  '#ffff00', // yellow
  '#ff00ff', // magenta
  '#00ffff', // cyan
];

const ColorSelector = ({ control, errors }: any) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState('#ffffff');
  return (
    <div className="mt-2">
      <label className="block font-semibold text-gray-300 mb-1"> Colors</label>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {[...defaultColors, ...customColors].map((color) => {
              const isSelected = (field.value || []).includes(color);
              const isLightColor = ['#ffffff', '#ffff00'].includes(color);
              return (
                <button
                  type="button"
                  key={color}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((c: string) => c !=  color)
                        : [...(field.value || []), color]
                    )
                  }
                  className={`w-7 h-7 rounded-md my-1 border-2 transition ${
                    isSelected ? 'border-white scale-110' : 'border-transparent'
                  } flex items-center justify-center ${
                    isLightColor ? 'border-gray-600' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              );
            })}
            {/* add new color */}
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-500 bg-green-400  hover:bg-gray-700 transition "
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              {<Plus size={16} color="white" />}
            </button>
            {/* color picker */}
            {showColorPicker && (
              <div className="flex items-center gap-2  relative">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-10 p-0 border-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    const allColors = [...defaultColors, ...customColors];
                    if (!allColors.includes(newColor.toLowerCase())) {
                      setCustomColors([
                        ...customColors,
                        newColor.toLowerCase(),
                      ]);
                      setShowColorPicker(false);
                    }
                  }}
                  className="px-3 py-1 bg-gray-700 text-white rounded-md  text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default ColorSelector;
