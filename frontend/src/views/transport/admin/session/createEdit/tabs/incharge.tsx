import UsersTable from "./table";

export default function Incharge({ users, control, is_edit }) {
  return (
    <>
      <UsersTable users={users} type="incharge_ids" control={control} is_edit={is_edit} />
    </>
  );
}
