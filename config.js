const config_ = {}

config_.icons = {
    on: "../icons/icon__on.png",
    off: "../icons/icon__off.png"
},
config_.yellow = "yellow",
config_.green = "var(--badge-green-background-color)",
config_.greenLight = "var(--badge-green-color)",
config_.red = "var(--badge-red-background-color)",
config_.redLight = "var(--badge-red-color)",
config_.gray = 'gray',
config_.white = 'white',
config_.grayLight = "#6c757e",
config_.so = {
    enum: {
        ALL: 'all',
        UP: 'up',
        DOWN: 'down'
    }
},
config_.direction = config_.so.enum.ALL
config_.loadAllDataTimeout = 6000
config_.interface = {
    enum: {
        btns: { on: "btn-success", off: "btn-danger" }
    }
}
config_.timeout = {}

export const config = JSON.parse(JSON.stringify(config_))
export const deepCopyConfig = () => JSON.parse(JSON.stringify(config_))