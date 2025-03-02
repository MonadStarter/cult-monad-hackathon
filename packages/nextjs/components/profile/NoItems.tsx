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
    <div className="flex flex-col items-center gap-y-5 px-5 py-24">
      <div className="bg-primary-500 p-3 rounded-full">{icon}</div>
      <h4>{note}</h4>
      {button}
    </div>
  );
};

export default NoItems;
