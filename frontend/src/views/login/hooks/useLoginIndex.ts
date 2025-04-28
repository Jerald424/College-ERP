import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { useForm } from "react-hook-form";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useCheckToken, useCheckUserToken } from "src/hooks/useInitial";

export const ADMISSION_TOKEN = "admission-token";
export const USER_TOKEN = "user-token";
const login = async (payload: any) => {
  const response = await axiosInstance.post("/api/admission/login", { payload });
  return response;
};

const portalLogin = async (payload: any) => {
  const response = await axiosInstance.post("/api/base/login", { payload });
  return response;
};

const setTokenToLS = (token: string) => {
  try {
    if (token) {
      localStorage.setItem(ADMISSION_TOKEN, JSON.stringify(token));
      localStorage.removeItem(USER_TOKEN);
    }
  } catch (error) {
    console.error(error);
  }
};

export const setTokenToAxios = (token: string) => {
  try {
    if (token) axiosInstance.defaults.headers[ADMISSION_TOKEN] = token;
  } catch (error) {
    console.error(error);
  }
};

const setUserTokenToLS = (token: string) => {
  try {
    if (token) {
      localStorage.setItem(USER_TOKEN, JSON.stringify(token));
      localStorage.removeItem(ADMISSION_TOKEN);
    }
  } catch (error) {
    console.error(error);
  }
};

export const setUserTokenToAxios = (token: string) => {
  try {
    if (token) axiosInstance.defaults.headers[USER_TOKEN] = token;
  } catch (error) {
    console.error(error);
  }
};

export default function useLoginIndex() {
  const { control, handleSubmit } = useForm({ defaultValues: { is_portal_user: true }, mode: "onBlur" });
  const { mutate, isPending } = useMutation({ mutationKey: ["login"], mutationFn: login });
  const { check: checkToken } = useCheckToken({ is_login: true });
  const { check: checkUserToken } = useCheckUserToken({ is_login: true });

  const { mutate: portalUserLoginMutate, isPending: isLoadingPortalLogin } = useMutation({ mutationFn: portalLogin, mutationKey: ["portal/login"] });

  let form_data: formData = [
    { label: "User name", name: "username", type: "input_box", rules: { required: "User name is required" }, inputProps: { autoFocus: true } },
    { label: "Password", name: "password", type: "input_box", rules: { required: "Password is required" }, inputProps: { type: "password" }, conProps: { className: "mt-3" } },
    { label: "Is portal user", name: "is_portal_user", type: "check_box", conProps: { className: "mt-3" }, checkBoxProps: { className: "ms-3" } },
  ];

  const onSubmit = (data: any) => {
    try {
      if (data?.is_portal_user) {
        portalUserLoginMutate(data, {
          onSuccess: (success) => {
            checkUserToken(success?.response?.user_token);
            setUserTokenToLS(success?.response?.user_token);
          },
          onError: (error) => {
            message.error(error?.error);
          },
        });
      } else
        mutate(data, {
          onSuccess: (success) => {
            checkToken(success?.response?.token);
            setTokenToLS(success?.response?.token);
          },
          onError: (error) => {
            message.error(error?.error);
          },
        });
    } catch (error) {
      console.error(error);
    }
  };

  return { control, form_data, handleSubmit: handleSubmit(onSubmit), isPending: isPending || isLoadingPortalLogin };
}
