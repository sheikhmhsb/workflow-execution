function delay(data) {
    const { delay, delayUnit } = data;
    let timeInMillis;

    switch (delayUnit) {
        case 'minutes':
            timeInMillis = parseInt(delay) * 60 * 1000; // Convert minutes to milliseconds
            break;
        case 'hours':
            timeInMillis = parseInt(delay) * 60 * 60 * 1000; // Convert hours to milliseconds
            break;
        case 'days':
            timeInMillis = parseInt(delay) * 24 * 60 * 60 * 1000; // Convert days to milliseconds
            break;
        default:
            throw new Error('Invalid delay unit'); // Throw an error if an unsupported unit is provided
    }

    return new Promise(resolve => setTimeout(resolve, timeInMillis));
}

module.exports = { delay };
