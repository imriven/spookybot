export function getOrdinalNum(number) {
    let selector;

    if (number <= 0) {
        selector = 4;
    } else if ((number > 3 && number < 21) || number % 10 > 3) {
        selector = 0;
    } else {
        selector = number % 10;
    }

    return number + ['th', 'st', 'nd', 'rd', ''][selector];
};

export function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60)
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds
}