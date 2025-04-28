import React, { HTMLProps } from "react";

interface flatListInterface extends Omit<HTMLProps<HTMLDivElement>, "data"> {
  data: any[];
  renderItem: (item: any, index: number, arr: any[]) => React.ReactNode;
  reactRef?: any;
}

export default function FlatList({ data, renderItem, ...props }: flatListInterface): React.JSX.Element {
  try {
    return (
      <div ref={props?.reactRef} {...props}>
        {" "}
        {data?.map(renderItem)}
      </div>
    );
  } catch (error) {
    console.error(error);
    return <></>;
  }
}
