import { HolderOutlined } from "@ant-design/icons";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "@tanstack/react-query";
import { Button, message, Table, TableProps } from "antd";
import { isEmpty } from "lodash";
import React, { useContext, useEffect, useMemo } from "react";
import axiosInstance from "src/axiosInstance";
import { LoaderCmp } from "../loader";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

const RowContext = React.createContext<RowContextProps>({});

const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return <Button type="text" size="small" icon={<HolderOutlined />} style={{ cursor: "move" }} ref={setActivatorNodeRef} {...listeners} />;
};

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}

const Row: React.FC<RowProps> = (props) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: props["data-row-key"] });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
  };

  const contextValue = useMemo<RowContextProps>(() => ({ setActivatorNodeRef, listeners }), [setActivatorNodeRef, listeners]);

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

const updateSequence = async ({ sequence, url }) => {
  if ([sequence, url].some((res) => !res)) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.post(url, { sequence });
  return response;
};

interface sequenceTableProps extends TableProps {
  onEndDrag?: (val: any) => void;
  is_update_API?: boolean;
  url?: string;
}

const SequenceTable = ({ is_update_API = true, ...props }: sequenceTableProps) => {
  const [dataSource, setDataSource] = React.useState([]);
  const { mutate: updateSequenceMutate, isPending } = useMutation({ mutationKey: ["update/sequence"], mutationFn: updateSequence });

  let columns = useMemo(() => {
    try {
      let arr = [{ key: "sort", align: "center", title: <LoaderCmp style={{ visibility: isPending ? "visible" : "hidden" }} />, width: 80, render: () => <DragHandle /> }];
      if (props?.columns) arr.push(...props?.columns);
      return arr;
    } catch (error) {
      console.error(error);
    }
  }, [props?.columns, isPending]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource((prevState) => {
        const activeIndex = prevState.findIndex((record) => record?.key === active?.id);
        const overIndex = prevState.findIndex((record) => record?.key === over?.id);
        let rec = arrayMove(prevState, activeIndex, overIndex);
        props?.onEndDrag?.(rec);
        let sequence = rec?.reduce((acc, cur, index) => {
          acc[cur?.key] = index + 1;
          return acc;
        }, {});
        if (is_update_API) {
          updateSequenceMutate(
            { sequence, url: props?.url },
            {
              onError: (error) => {
                message.error(error?.error);
              },
            }
          );
        }
        return rec;
      });
    }
  };

  useEffect(() => {
    setDataSource(props?.dataSource);
  }, [props?.dataSource]);

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext items={isEmpty(dataSource) ? [] : dataSource?.map?.((i) => i?.key)} strategy={verticalListSortingStrategy}>
        <Table {...props} rowKey="key" components={{ body: { row: Row } }} columns={columns} dataSource={dataSource} />
      </SortableContext>
    </DndContext>
  );
};

export default SequenceTable;
