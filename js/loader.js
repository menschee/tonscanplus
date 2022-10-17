const url = "https://raw.githubusercontent.com/menschee/tonscanplus/main/data.json"

fetch(url).then((response) => response.text()).then( text => {
    const json = JSON.parse(text.replace(/,[\n\s]+}/gm, "\n}").replace(/\n\s+\n/gm, ',').replaceAll(/,+/gm, ','))
    Object.keys(json).forEach(async key => {
        const currentAddress = await chrome.storage.local.get(key);
        if(Object.keys(currentAddress).length === 0) {
            const data = {}
            data[key] = {name: json[key], type: "github"}
            chrome.storage.local.set(data);
        }
    })
})
