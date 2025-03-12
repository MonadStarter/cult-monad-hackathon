const NoItems = ({
  icon,
  note,
  button,
}: {
  icon: React.ReactNode;
  note: string;
  button: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center gap-y-6 px-5 py-28 text-center">
      <div className="bg-[#2c2a39] p-5 rounded-full">{icon}</div>
      <h4 className="text-lg text-white font-medium">{note}</h4>
      {button}
    </div>
  );
};

export default NoItems;
