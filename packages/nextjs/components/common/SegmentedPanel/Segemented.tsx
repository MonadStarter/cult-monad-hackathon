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
        className={`py-2 rounded-xl cursor-pointer flex-1 ${
          value === options.id
            ? "bg-gray-900 text-white-500"
            : "text-white-64"
        }`}
        onClick={(): void => onChange(options.id)}
      >
        <h5 className="font-medium text-center">{options.label}</h5>
      </div>
    );
  };

  return (
    <div className={`flex p-0.5 bg-gray-950 rounded-xl ${className}`}>
      {options.map(buildOptions)}
    </div>
  );
};

export type { SegmentedOptionType };
export default Segmented;
