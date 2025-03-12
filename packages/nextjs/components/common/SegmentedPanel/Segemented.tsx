"use client";

type SegmentedOptionType = {
  id: string;
  label: string;
};

type SegmentedButtonProps = {
  options: SegmentedOptionType[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
};

const Segmented = ({ options, className, value, onChange }: SegmentedButtonProps) => {

  const buildOptions = (options: SegmentedOptionType) => {
    return (
      <div
        key={options.id}
        className={`py-3 px-2 rounded-xl cursor-pointer flex-1 transition-all duration-200 ${
          value === options.id
            ? "bg-[#1c1a29] text-white shadow-sm"
            : "text-gray-400 hover:text-gray-300"
        }`}
        onClick={(): void => onChange(options.id)}
      >
        <h5 className="font-medium text-center">{options.label}</h5>
      </div>
    );
  };

  return (
    <div className={`flex p-1.5 rounded-xl ${className}`}>
      {options.map(buildOptions)}
    </div>
  );
};

export type { SegmentedOptionType };
export default Segmented;
