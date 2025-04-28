import { theme_color } from "src/utils/colors";

const initialBase = {
  colors: theme_color,
  user: {
    login: false,
    info: null,
  },
  academic_year: null,
  active_academic_year: null,
  institution: {
    isLoading: false,
    profile: null,
  },
};
export default initialBase;
