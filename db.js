import db from "./config/dbConfig"

function deleteFollowers() {
    return db("followers").del()
}
function getFollowers() {
    return db("followers")
}
function insertFollowers(followers) {
    return db("followers").insert(followers)
}
function deleteMods() {
    return db("mods").del()
}
function getMods() {
    return db("mods")
}
function insertMods(mods) {
    return db("mods").insert(mods)
}
function deleteVips() {
    return db("vips").del()
}
function insertVips(vips) {
    return db("vips").insert(vips)
}
function getVips() {
    return db("vips")
}
function updateStatus(status) {
    return db("status").where({ configId: 1 }).update(status)
}
function getStatus() {
    return db("status").where({ configId: 1 }).first()
}
function upsertCounter(counter) {
    return db("counter").insert(counter)
        .onConflict("name")
        .merge()
        .returning("*");
}
function getCounter(counterName) {
    return db("counter").where({ name: counterName }).first()
}
function deleteCounter() {
    return db("counter").where({ name: counterName }).del()
}


export default { 
    deleteFollowers, 
    insertFollowers, 
    deleteMods, 
    insertMods, 
    insertVips, 
    deleteVips, 
    updateStatus, 
    getStatus, 
    getMods, 
    getVips, 
    getFollowers, 
    deleteCounter, 
    getCounter, 
    upsertCounter 
}


