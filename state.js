export default class BotState {
    constructor() {
        this._counters = [];
        this._mods = [];
        this._vips = [];
        this._followers = null;
        this._currentZwiftActivityId = null;
    }
    set mods(mods) {
        this._mods = mods;
    }

    get mods() {
        return this._mods;
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

    addCounter(counter) {
        this.counters = [...this.counters, counter]
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

}