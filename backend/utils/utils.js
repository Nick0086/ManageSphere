import moment from 'moment-timezone';

let counter = 0;

export const createUniqueId = (prefix) => {
    counter++;
    if (counter > 999) counter = 1;

    return prefix + '_' + Date.now() + Math.floor(Math.random() * 1000) + counter;
}

// Convert UTC to Asia/kolkata
export const getCurrentTime = () => {
    return moment().tz('Asia/Kolkata').set({ second: 0 }).format('YYYY-MM-DD HH:mm:ss');
}


// Helper function to handle errors
export const handleError = (fnName,controllerName, res, error, message = "Internal server error") => {
    console.log(`${getCurrentTime()} :: Error in ${controllerName} in function ${fnName}: `, error);
    return res.status(500).json({code: 'SERVER_ERROR',success: false, message, error: error.message });
};