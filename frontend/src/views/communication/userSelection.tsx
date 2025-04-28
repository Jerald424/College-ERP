import { useState } from "react";
import { Link } from "react-router-dom";
import { ButtonCmp, Para } from "src/components/styled";
import Dropdown from "src/components/styled/inputs/dropdown";
import io from "socket.io-client";

export let users = [
  { id: 1, name: "Jerald" },
  { id: 2, name: "Jayakumar" },
  { id: 3, name: "Palayanur" },
  { id: 4, name: "Viriyur" },
  { id: 5, name: "Sank" },
];

export let group = [
  { id: "group-1", name: "Group 1" },
  { id: "group-2", name: "Group 2" },
  { id: "group-3", name: "Group 4" },
];
export const socket = io.connect("http://192.168.1.70:5000", {
  // extraHeaders: {
  //   ["user-token"]: "test",
  // },
});
export default function UserSelection() {
  const [user, setUser] = useState();
  const [selGroup, setSelGroup] = useState();

  return (
    <div className="container mt-4 card p-5">
      <Para>User</Para>
      <Dropdown className="w-100" options={users} placeholder="User" handleChange={setUser} optional_value="id" optional_label="name" />
      <Para>Group</Para>
      <Dropdown className="w-100" options={group} handleChange={setSelGroup} placeholder="Group" optional_value="id" optional_label="name" />
      <Link to={`/chat/${user}/${selGroup}`}>
        <ButtonCmp className="mt-3 w-100">Next</ButtonCmp>
      </Link>
    </div>
  );
}
