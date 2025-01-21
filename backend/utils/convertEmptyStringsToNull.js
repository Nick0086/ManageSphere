export const convertEmptyStringsToNull = (obj) => {
    const baseObj = {};

    Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) {
            baseObj[key] = `null`; // Empty object
        } else if (Array.isArray(value) && value.length === 0) {
            baseObj[key] = []; // Empty array
        } else if (value === "" || value === "null" || value === undefined || value === 'undefined' || value === null) {
            baseObj[key] = null;
        } else if (value === "true") {
            baseObj[key] = 1;
        } else if (value === "false") {
            baseObj[key] = 0;
        } else if (isNaN(value) && typeof value === 'number' && value !== "") {
            baseObj[key] = Number(value);
        } else {
            baseObj[key] = value;
        }
    });

    return baseObj;
};



export const stringifyModemData = (data) => {
    return data !== null && data !== 'null' && data !== undefined && data !== "undefined" && data !== "" ? JSON.stringify(data) : null;
};
