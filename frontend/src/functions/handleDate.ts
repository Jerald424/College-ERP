export const makeDDMMYYYYToJsDate = (date: string) => {
  try {
    if (!date) return new Date();
    let [dt, month, year] = date?.split("-");
    return new Date(+year, +month - 1, +dt);
  } catch (error) {
    console.error(error);
  }
};

export const makeJsDateToDDMMYYYY = (date: Date) => {
  try {
    date = new Date(date);
    return [date?.getDate(), date?.getMonth() + 1, date?.getFullYear()]?.join("-");
  } catch (error) {
    console.error(error);
    return "10-20-2024";
  }
};

export const makeJSDateToYYYYMMDD = (date: Date) => {
  try {
    return [date?.getFullYear(), `0${date?.getMonth() + 1}`.slice(-2), `0${date?.getDate()}`.slice(-2)]?.join("-");
  } catch (error) {
    console.error(error);
    return "2024-01-01";
  }
};

export const getMonthStartDateEndDateOfDate = (date: Date) => {
  try {
    date = new Date(date);
    let start_date = new Date(date?.getFullYear(), date?.getMonth(), 1);
    let end_date = new Date(date?.getFullYear(), date?.getMonth() + 1, 0);
    return [start_date, end_date];
  } catch (error) {
    console.error(error);
    return [date, date];
  }
};

export const getHHMMFromJsDate = (date: Date) => {
  try {
    date = new Date(date);
    return `${date.getHours()?.toString()?.padStart(2, "0")}:${date?.getMinutes()?.toString()?.padStart(2, "0")}`;
  } catch (error) {
    console.error(error);
    return "";
  }
};

export const setHourMinutes = ({ date, hour, minute }: { date: Date; hour: number; minute: number }) => {
  try {
    let dt = new Date(date);
    dt.setHours(+hour);
    dt.setMinutes(+minute);
    return dt;
  } catch (error) {
    console.error(error);
    return new Date();
  }
};

export const makeHHMMFromJSDate = (date: Date) => {
  try {
    if (date instanceof Date) {
      return `${date.getHours()}:${date?.getMinutes()}`;
    }
  } catch (error) {
    console.error(error);
    return "";
  }
};
