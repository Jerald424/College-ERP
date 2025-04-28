import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { useAppDispatch } from "src/redux/hooks";
import { addEditBase } from "src/redux/reducers/base/reducer";
import { getAcademicYear, getActiveInstitutionProfile } from "src/redux/reducers/base/request";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";
import { ADMISSION_TOKEN, USER_TOKEN, setTokenToAxios, setUserTokenToAxios } from "src/views/login/hooks/useLoginIndex";

const verifyAdmissionToken = async ({ token }: { token: string }) => {
  if (!token) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/admission/verify-token`, {
    headers: {
      [ADMISSION_TOKEN]: token,
    },
  });
  return response;
};

const verifyUserToken = async ({ token }: { token: string }) => {
  if (!token) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get("/api/base/verify-user-token", {
    headers: {
      [USER_TOKEN]: token,
    },
  });
  return response;
};

export const useCheckUserToken = (arg?: { is_login: boolean }) => {
  const { mutate, isPending: isLoadingVerifyUser } = useMutation({ mutationKey: ["verify-user-token"], mutationFn: verifyUserToken });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const check = async (token_string?: string) => {
    let token = localStorage.getItem(USER_TOKEN);
    if (token || token_string) {
      token = token_string ?? JSON.parse(token);
      mutate(
        { token },
        {
          onSuccess: (success) => {
            dispatch(addEditBase({ key: "login", obj: "user", value: true }));
            dispatch(addEditBase({ key: "info", obj: "user", value: success?.response }));
            setUserTokenToAxios(token);
            if (token_string) navigate("/divider");
          },
        }
      );
    }
  };
  useEffect(() => {
    if (!arg?.is_login) check();
  }, []);

  return { check, isLoadingVerifyUser };
};

export const useCheckToken = (arg?: { is_login: boolean }) => {
  const { mutate } = useMutation({ mutationKey: ["verify-admission-token"], mutationFn: verifyAdmissionToken });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const check = async (token_string?: string) => {
    let token = localStorage.getItem(ADMISSION_TOKEN);
    if (token || token_string) {
      token = token_string ?? JSON.parse(token);
      mutate(
        { token },
        {
          onSuccess: (success) => {
            dispatch(addEditBase({ key: "login", obj: "user", value: true }));
            dispatch(addEditBase({ key: "info", obj: "user", value: success?.response }));
            setTokenToAxios(token);
            if (token_string) navigate("/divider");
          },
        }
      );
    }
  };

  useEffect(() => {
    if (!arg?.is_login) check();
  }, []);

  return { check };
};

export default function useInitialState() {
  useCheckToken();
  const { isLoadingVerifyUser } = useCheckUserToken();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAcademicYear());
    dispatch(getActiveInstitutionProfile());
  }, []);

  return { isLoadingVerifyUser };
}
