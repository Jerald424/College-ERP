import { useAppSelector } from "src/redux/hooks";

export const useCommunicationMainSlice = () => useAppSelector((s) => s?.communication?.communication_main);
