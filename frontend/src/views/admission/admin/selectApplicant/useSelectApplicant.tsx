import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { CheckBoxCmp } from "src/components/styled";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";
import { selectApplicant } from "../fee/createEdit/useCreate";
import { message } from "antd";
import { useBase } from "src/redux/hooks";

const getProgramme = async () => {
  const response = await axiosInstance.get("api/admission/get-programme?attributes=programme_programme_level,id,name");
  return response?.response;
};

const getApplicant = async ({ programme_id, academic_year_id }: { programme_id: number; academic_year_id?: number }) => {
  if (!programme_id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/admission/selected-applicant/${programme_id}?attributes=id,name,gender,image,application_no&academic_year_id=${academic_year_id}`);
  return response?.response;
};

export default function useSelectApplicant() {
  const { control, handleSubmit, reset, getValues, watch } = useForm({ mode: "all" });
  const { data: programme } = useQuery({ queryKey: ["get/programme"], queryFn: getProgramme });
  const { active_academic_year } = useBase();
  const { mutate: getApplicantMutate, isPending: isLoadingApplicant, data: applicant } = useMutation({ mutationKey: ["get/applicant"], mutationFn: getApplicant });
  const { mutate: selectApplicantMutate, isPending: isLoadingSelectApplicant } = useMutation({ mutationKey: ["select/applicant"], mutationFn: selectApplicant });
  const [selected, setSelected] = useState([]);
  const { Modal, setIsOpen } = useConfirmationModal();

  let form_data: formData = [
    {
      label: "Programme",
      name: "programme_id",
      type: "drop_down",
      rules: { required: "Programme is required" },
      inputProps: { autoFocus: true },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: programme?.rows,
        optional_value: "id",
        optional_label: "name",
        onChange: (programme_id) => {
          getApplicantMutate({ programme_id, academic_year_id: active_academic_year?.id });
          setSelected([]);
        },
      },
    },
  ];

  let isAllSelected = useMemo(() => {
    try {
      return applicant?.length === selected?.length;
    } catch (error) {
      console.error(error);
    }
  }, [selected, applicant]);

  let columns = [
    {
      dataIndex: "s.no",
      title: (
        <div>
          <CheckBoxCmp
            checked={isAllSelected}
            onChange={() => {
              if (isAllSelected) setSelected([]);
              else setSelected(() => applicant?.map((res) => res?.id));
            }}
            className="me-2"
          />{" "}
          #
        </div>
      ),
      align: "center",
    },
    {
      dataIndex: "name",
      title: "Name",
    },
    {
      dataIndex: "application_no",
      title: "Application No",
    },
    {
      dataIndex: "gender",
      title: "Gender",
    },
  ];

  const handleSelectDeselect = (app) => {
    try {
      setSelected((tmp) => {
        let prev = [...tmp];
        if (prev?.includes(app?.id)) {
          let index = prev?.indexOf(app?.id);
          prev?.splice(index, 1);
        } else prev?.push(app?.id);
        return prev;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchApplicant = () => {
    try {
      let programme_id = watch("programme_id");
      if (programme_id && active_academic_year?.id) getApplicantMutate({ programme_id, academic_year_id: active_academic_year?.id });
    } catch (error) {
      console.error(error);
    }
  };

  let dataSource = useMemo(() => {
    try {
      return applicant?.map((app, index) => {
        return {
          id: app?.id,
          "s.no": (
            <div>
              <CheckBoxCmp checked={selected?.includes(app?.id)} className="me-2" />
              {index + 1}
            </div>
          ),
          name: (
            <div>
              <img src={app?.image} style={{ height: 50, width: 50, borderRadius: 50 }} className="me-3" />
              {app?.name}
            </div>
          ),
          application_no: app?.application_no,
          gender: app?.gender?.value,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [applicant, selected]);

  const handleSelect = () => {
    try {
      setIsOpen(false);
      selectApplicantMutate(
        { applicant_ids: selected },
        {
          onSuccess: () => {
            message.success("Application selected successfully");
          },
          onError: (error) => {
            message.error(String(error?.error));
          },
          onSettled: () => {
            fetchApplicant();
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchApplicant();
  }, [active_academic_year]);

  return {
    form_data,
    control,
    columns,
    isLoading: isLoadingApplicant || isLoadingSelectApplicant,
    dataSource,
    handleSelectDeselect,
    handleClickSave: handleSubmit(() => setIsOpen(true)),
    Modal,
    setIsOpen,
    handleSelect,
    selected,
  };
}
