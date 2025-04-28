import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "src/axiosInstance";
import { getBoardingPoints } from "../../../bus/createEdit/hooks/useCreate";
import { useMemo } from "react";

const getBusIdFromSession = async ({ session_id }) => {
  if (!session_id) return;
  const response = await axiosInstance.get(`api/transport/session-to-bus/${session_id}`);
  return response;
};

export default function useTracker({ session_id }) {
  const { data: bus } = useQuery({ queryKey: ["get/bus", session_id], queryFn: () => getBusIdFromSession({ session_id }) });
  const { data: boarding_points } = useQuery({ queryKey: ["get/boarding-points", bus], queryFn: () => getBoardingPoints({ bus_id: bus?.response?.bus_id }) });

  const items = useMemo(() => {
    try {
      return boarding_points?.response?.map((res) => {
        return {
          children: res?.name,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [boarding_points]);

  return { items };
}
