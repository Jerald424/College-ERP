import { createSlice } from "@reduxjs/toolkit";
import initialState from "./initialState";
import { getAcademicYear, getActiveInstitutionProfile } from "./request";

const baseSlice = createSlice({
  name: "base",
  initialState,
  reducers: {
    addEditBase: (state, { payload }: { payload: { obj?: string; key: string; value: any } }) => {
      if (payload?.obj) state[payload.obj][payload?.key] = payload?.value;
      else state[payload?.key] = payload?.value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAcademicYear.fulfilled, (state, { payload }) => {
        let active_acdemic_year = payload?.rows?.find((res) => res?.active);
        state.active_academic_year = active_acdemic_year;
        state.academic_year = payload;
      })
      .addCase(getActiveInstitutionProfile.pending, (state) => {
        state.institution.isLoading = true;
      })
      .addCase(getActiveInstitutionProfile.fulfilled, (state, { payload }) => {
        state.institution.profile = payload;
        state.institution.isLoading = false;
      })
      .addCase(getActiveInstitutionProfile.rejected, (state) => {
        state.institution.isLoading = false;
      });
  },
});

export const { addEditBase } = baseSlice.actions;
export default baseSlice.reducer;
