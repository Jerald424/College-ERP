import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { appDispatch, rootState } from "..";
import { theme } from "antd";

export const useAppDispatch: () => appDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<rootState> = useSelector;

export const useBase = () => useAppSelector((s) => s.baseSlice);
export const useColors = () => theme.useToken().token;
