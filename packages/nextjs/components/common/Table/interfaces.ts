type TableColumnInterface = {
  title: string;
  widthPercentage: number;
  accessor: (rowData: TableValueInterface) => string | number | React.ReactNode;
  renderer: (value: any) => React.ReactNode;
};

type TableValueInterface = {
  [key: string]: string | number | JSX.Element;
};

export type { TableColumnInterface, TableValueInterface };
