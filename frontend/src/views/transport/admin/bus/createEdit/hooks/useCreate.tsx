import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { isEmpty, isObject } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ bus }: { bus: any }) => {
  let url = bus?.id ? `api/transport/bus/${bus?.id}` : "api/transport/bus";
  let method = bus?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { bus });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/transport/bus/${id}`);
  return response?.response;
};

export const getBoardingPoints = async ({ bus_id }) => {
  if (!bus_id) return {};
  const response = await axiosInstance.get(`api/transport/boarding-point/${bus_id}`);
  return response;
};

const createEditBoardingPoints = async ({ boarding_point }) => {
  const response = await axiosInstance.post(`api/transport/boarding-point`, { boarding_point });
  return response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, watch, setValue } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  let [level, boarding_points_value] = watch(["level", "boarding_points"]);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme, data } = useMutation({ mutationKey: ["get/programme"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });
  const { mutate: getBoardingPointsMutate, isPending: isLoadingBoardingPoint, data: boarding_points } = useMutation({ mutationKey: ["get/boarding-points"], mutationFn: getBoardingPoints });
  const { mutate: createUpdateBoardingPointsMutate, isPending: isLoadingUpdateBoardingPoints } = useMutation({ mutationKey: ["post/put-boarding-points"], mutationFn: createEditBoardingPoints });

  let form_data = useMemo(() => {
    let arr: formData = [
      {
        label: "Name",
        name: "name",
        type: "input_box",
        rules: { required: "Name is required" },
        inputProps: { autoFocus: true },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
    ];
    return arr;
  }, [level]);

  let description_form: formData = [
    {
      label: "Description",
      name: "description",
      type: "ckeEditor",
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let bus = getValues();
      if (record_id) {
        let boarding_point_value = bus?.boarding_points;
        let boarding_point = { bus_id: record_id };

        if (isObject(boarding_point_value)) {
          boarding_point_value = Object.values(boarding_point_value)?.map((res) => {
            let obj = { name: res?.name };
            if (!res?.static) obj["id"] = res?.id;
            return obj;
          });
          boarding_point["points"] = boarding_point_value;
        }

        createUpdateBoardingPointsMutate(
          { boarding_point },
          {
            onSettled() {
              refetchBoardingPoint();
            },
          }
        );
      }
      mutate(
        { bus },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            console.log("success: ", success);
            message.success(record_id ? "Bus updated successfully" : "Bus created successfully");
            let result = success?.response;
            setSearch({ id: result?.id });
            setIsEdit(false);
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const loadBoardingPlace = () => {
    try {
      let arr = boarding_points?.response;
      console.log("arr: ", arr);
      let obj = arr?.reduce((acc, cur) => {
        acc[cur?.id] = cur;
        return acc;
      }, {});

      setValue("boarding_points", obj);
    } catch (error) {
      console.error(error);
    }
  };

  const refetchBoardingPoint = () => {
    getBoardingPointsMutate({ bus_id: record_id });
  };

  useEffect(() => {
    if (record_id) {
      getProgrammeMutate(
        { id: record_id },
        {
          onSuccess: (data) => {
            reset({
              ...data,
            });
          },
        }
      );
      refetchBoardingPoint();
    }
  }, [record_id]);

  useEffect(() => {
    if (!isEmpty(boarding_points)) loadBoardingPlace();
  }, [boarding_points]);

  return {
    control,
    form_data,
    record_id,
    handleSubmit: handleSubmit(() => setIsOpen(true)),
    Modal,
    navigate,
    isLoading: isPending || isLoadingProgramme,
    onSubmit,
    isEdit,
    setIsEdit,
    description_form,
    reset,
    boarding_points_value,
    refetchBoardingPoint,
    isLoadingBoardingPoint,
    isLoadingUpdateBoardingPoints,
  };
}
