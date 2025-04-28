import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "src/axiosInstance";

export const getAcademicYear = createAsyncThunk("get/academic-year", async () => {
  const response = await axiosInstance.get("api/base/academic-years");
  return response?.response;
});

export const getActiveInstitutionProfile = createAsyncThunk("get/active/inst-profile", async () => {
  const response = await axiosInstance.get("api/institution/active-institution");
  return response?.response;
});
