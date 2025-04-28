const makeDDMMYYYYToYYYYMMDD = (date) => {
    try {
        if (date) {
            let [dt, month, year] = date?.split('-');
            return [year, month, dt].join('-')
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = { makeDDMMYYYYToYYYYMMDD }