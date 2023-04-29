export default class BotState {
    constructor() {
        this._counters = {};
        this._numViewers = 0;
        this._numChatters = 0;
        this._mods = [];
        this._vips = [];
        this._liveTimers = {};
        this._isLive = false;
        this._followers = null;
        this._currentZwiftActivityId = null;
    }
    set mods(mods) {
        this._mods = mods;
    }

    get mods() {
        return this._mods;
    }

    set numViewers(viewers) {
        this.numViewers = viewers;
    }

    get numViewers() {
        return this._numViewers;
    }

    set numChatters(chatters) {
        this._numChatters = chatters;
    }

    get numChatters() {
        return this._numChatters;
    }


    set isLive(isLive) {
        this._isLive = isLive;
    }

    get isLive() {
        return this._isLive;
    }

    set vips(vips) {
        this._vips = vips;
    }

    get vips() {
        return this._vips;
    }

    set counters(counters) {
        this._counters = counters;
    }

    get counters() {
        return this._counters;
    }

    set followers(followers) {
        this._followers = followers;
    }

    get followers() {
        return this._followers;
    }

    deleteCounter(counterName) {
        delete this._counters[counterName]
    }

    incrementCounter(counterName, amount = 1) {
        this._counters[counterName].value += amount
    }

    decrementCounter(counterName, amount = 1) {
        this._counters[counterName].value -= amount
    }

    setCounter(counterName, value) {
        this._counters[counterName] = value
    }

    set zwiftActivityId(activityId) {
        this._currentZwiftActivityId = activityId;
    }

    get zwiftActivityId() {
        return this._currentZwiftActivityId;
    }

    set twitchTimers(timers) {
        this._twitchTimers = timers;
    }

    get twitchTimers() {
        return this._twitchTimers;
    }

    setTwitchTimer(timerName, intervalFunction) {
        this._twitchTimers[timerName] = intervalFunction
    }

    deleteTwitchTimer(timerName) {
        delete this._twitchTimers[timerName]
    }
}