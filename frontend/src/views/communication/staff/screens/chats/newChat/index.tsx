import { FlatList, InputBox, ModalLoader } from "src/components/styled";
import useNewChat from "./useNewChat";
import { SepGroupChat } from "../chatList";

export default function NewChat() {
  const { isLoading, users } = useNewChat();

  if (isLoading)
    return (
      <div className="my-3 text-center">
        <ModalLoader />
      </div>
    );
  return (
    <div>
      <div className="px-2">
        <InputBox placeholder="Search" />
      </div>
      <div className="mt-3" />
      <FlatList
        data={users}
        renderItem={(user) => {
          let is_student = user?.student_id;
          let item = {
            ...user,
            image: is_student ? user?.student?.applicant?.image : user?.staff?.image,
            name: is_student ? user?.student?.applicant?.name : user?.staff?.name,
          };
          return <SepGroupChat item={item} key={user?.id} />;
        }}
      />
    </div>
  );
}
