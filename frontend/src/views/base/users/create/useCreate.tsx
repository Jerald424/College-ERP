import { CloseCircleFilled, CheckCircleOutlined, CheckCircleFilled, LinkOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Tag, Tooltip, message } from "antd";
import { useForm, useWatch } from "react-hook-form";
import { formData } from "src/components/layouts/form";
import { useBase, useColors } from "src/redux/hooks";
import { getRoles } from "./request";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";

const createOrEditUser = async ({ user }: { user: any }) => {
  let url = user?.id ? `api/base/user/${user?.id}` : "api/base/user";
  let method = user?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { user });
  return response;
};

const getUser = async ({ id }: { id: number }) => {
  const response = await axiosInstance.get(`api/base/user/${id}`);
  return response?.response;
};

export const getStaffList = async () => {
  const response = await axiosInstance(`api/staff/staff?is_active=true`);
  return response?.response;
};

const getStudent = async ({ academic_year_id }) => {
  const response = await axiosInstance.get(`/api/student/student?academic_year_id=${academic_year_id}`);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, getValues, reset } = useForm();
  const { data: roles, isLoading: isLoadingRoles } = useQuery({ queryKey: ["get/roles"], queryFn: getRoles });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createOrEditUser });
  const { mutate: getUsersMutation, isPending: isLoadingUser } = useMutation({ mutationKey: ["get/user"], mutationFn: getUser });
  const { data: students, isPending: isLoadingStudent, mutate: getStudentMutate } = useMutation({ mutationKey: ["get/student"], mutationFn: getStudent });
  const { data: staffs } = useQuery({ queryKey: ["get/staff"], queryFn: getStaffList });
  const [active, setActive] = useState();
  const { colorSuccess } = useColors();
  const navigate = useNavigate();
  const { Modal, setIsOpen } = useConfirmationModal();
  const [search] = useSearchParams();
  const { active_academic_year } = useBase();
  let user_id = search.get("id");
  let level = useWatch({ control, name: "level" });

  const CustomTag = ({ arg }: any) => {
    return (
      <Tooltip title={arg?.value == active ? "Remove active" : "Make as active"}>
        <Tag
          className="cp"
          onClick={() => setActive((prev) => (arg?.value == prev ? null : arg?.value))}
          icon={arg?.value !== active ? <CheckCircleOutlined className="cp" /> : <CheckCircleFilled className="cp" style={{ color: colorSuccess }} />}
          closeIcon={<CloseCircleFilled onClick={arg?.onClose} />}
        >
          {arg?.label}
        </Tag>
      </Tooltip>
    );
  };

  let roles_data = useMemo(() => {
    try {
      return roles?.filter((res) => (level == "staff" ? ["college", "staff"].includes(level) : res?.level_id == level));
    } catch (error) {
      console.error(error);
    }
  }, [roles, level]);

  let student_options = useMemo(() => {
    try {
      return students?.rows?.map((res) => ({ ...res, name: res?.applicant?.name }));
    } catch (error) {
      console.error(error);
    }
  }, [students]);

  let form_data = useMemo(() => {
    try {
      let arr: formData = [
        {
          label: "User name",
          name: "username",
          type: "input_box",
          rules: { required: "User name is required" },
          inputProps: { autoFocus: true },
          inputsContainerProps: { className: "f2" },
          conProps: { className: "df" },
          labelProps: { className: "f1" },
        },
        {
          label: "Password",
          name: "password",
          type: "input_box",
          rules: { required: "Password is required" },
          inputsContainerProps: { className: "f2" },
          conProps: { className: "df mt-1" },
          labelProps: { className: "f1" },
        },
        {
          label: "Level",
          name: "level",
          type: "drop_down",
          rules: { required: "Level is required" },
          inputsContainerProps: { className: "f2" },
          conProps: { className: "df mt-1" },
          labelProps: { className: "f1" },
          dropdownProps: {
            options: [
              { id: "student", value: "Student" },
              { id: "staff", value: "Staff" },
            ],
            optional_label: "value",
            optional_value: "id",
            onChange: () => {
              reset((prev) => ({ ...prev, student_id: null, staff_id: null, roles: null }));
            },
          },
        },
      ];

      if (level) {
        if (level === "student") {
          arr.push({
            label: "Student",
            name: "student_id",
            type: "drop_down",
            rules: { required: "Level is required" },
            inputsContainerProps: { className: "f2" },
            conProps: { className: "df mt-1" },
            labelProps: { className: "f1" },
            dropdownProps: {
              options: student_options,
              optional_label: "name",
              optional_value: "id",
            },
          });
        } else {
          arr.push({
            label: "Staff",
            name: "staff_id",
            type: "drop_down",
            rules: { required: "Level is required" },
            inputsContainerProps: { className: "f2" },
            conProps: { className: "df mt-1" },
            labelProps: { className: "f1" },
            dropdownProps: {
              options: staffs?.rows,
              optional_label: "name",
              optional_value: "id",
            },
          });
        }
        arr.push({
          label: (
            <span>
              <Link to={"/divider/base/roles"}>
                {" "}
                Roles <LinkOutlined />
              </Link>
            </span>
          ),
          name: "roles",
          type: "drop_down",
          rules: { required: "Password is required" },
          dropdownProps: {
            mode: "multiple",
            options: roles_data,
            optional_label: "name",
            optional_value: "id",
            tagRender: (arg) => <CustomTag arg={arg} />,
            onDeselect: (val) => val == active && setActive(null),
          },
          conProps: { className: "df mt-1" },
          labelProps: { className: "f1" },
          inputsContainerProps: { className: "f2" },
        });
      }

      return arr;
    } catch (error) {
      console.error(error);
    }
  }, [level, student_options, active, staffs, roles_data]);

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let user = getValues();
      user["role"] = user?.roles?.map((res) => ({ role_id: res, is_active: res == active }));
      mutate(
        { user },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: () => {
            message.success(user_id ? "User updated successfully" : "User created successfully");
            navigate("/divider/base/users");
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user_id)
      getUsersMutation(
        { id: +user_id },
        {
          onSuccess: (data) => {
            console.log("data: ", data);
            let active = data?.user_roles?.find((res) => res?.is_active);
            setActive(active?.role_id);
            reset(() => ({
              ...data,
              username: data?.username,
              password: data?.password,
              roles: data?.user_roles?.map((res) => res?.role_id),
              id: data?.id,
              level: data?.student_id ? "student" : "staff",
            }));
          },
        }
      );
  }, []);

  useEffect(() => {
    getStudentMutate({ academic_year_id: active_academic_year?.id });
  }, [active_academic_year]);

  return { control, form_data, handleSubmit: handleSubmit(() => setIsOpen(true)), active, Modal, onSubmit, isPending: isPending || isLoadingUser, user_id, navigate };
}
