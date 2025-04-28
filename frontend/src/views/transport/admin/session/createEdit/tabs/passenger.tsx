import UsersTable from "./table";

export default function Passenger({ users, control, is_edit }) {
  return (
    <>
      <UsersTable users={users} type="passenger_ids" control={control} is_edit={is_edit} />
    </>
  );
}
