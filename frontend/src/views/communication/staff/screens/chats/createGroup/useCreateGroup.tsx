import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import axiosInstance from "src/axiosInstance";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { socket } from "../../..";
import { useBase } from "src/redux/hooks";

const getClassStudent = async () => {
  const response = await axiosInstance.get("api/communication/class-students");
  return response?.response;
};

// name | image | description | created_by_id
// admins = [1,2,3];
// members = [1,2,3,4];

const socketCreateGroup = ({ group }) => {
  socket.emit("create_group", { group });
};

export default function useCreateGroup({ already_in_group, handleAdd }) {
  const { data: cls_student, isLoading } = useQuery({ queryKey: ["get/cls-student"], queryFn: getClassStudent });
  const [selectedStudent, setSelectedStudent] = useState({});
  const { Modal, setIsOpen } = useConfirmationModal();
  const [groupName, setGroupName] = useState("");
  const {
    user: { info },
  } = useBase();

  let class_by_student = useMemo(() => {
    try {
      return cls_student?.reduce((acc, cur) => {
        let cls_key = JSON.stringify(cur?.class);
        if (!acc[cls_key]) acc[cls_key] = [];
        if (!already_in_group?.includes(cur?.user?.id)) acc[cls_key]?.push(cur);
        return acc;
      }, {});
    } catch (error) {
      console.error(error);
    }
  }, [cls_student, already_in_group]);

  const onConfirmCreate = () => {
    try {
      let members = Object.values(selectedStudent)?.flat();
      if (handleAdd) {
        handleAdd(members);
        setSelectedStudent({});
        return;
      }
      setIsOpen(false);
      let group = {
        name: groupName,
        created_by_id: info?.user?.id,
        admins: [info?.user?.id],
        members: members?.concat(info?.user?.id),
      };
      socketCreateGroup({ group });
    } catch (error) {
      console.error(error);
    }
  };

  return { class_by_student, isLoading, selectedStudent, setSelectedStudent, onConfirmCreate, Modal, setIsOpen, groupName, setGroupName };
}
