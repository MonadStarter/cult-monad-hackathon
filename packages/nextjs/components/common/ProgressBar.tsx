function ProgressBar({ current, bgColorClass = "bg-background" }: { current: number; bgColorClass?: string }) {
  return (
    <div className={`w-full h-2 ${bgColorClass} rounded-full`}>
      <div style={{ width: `${current}%` }} className="bg-primary-500 h-full rounded-full"></div>
    </div>
  );
}

export default ProgressBar;
