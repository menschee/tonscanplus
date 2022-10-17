const url = "https://raw.githubusercontent.com/menschee/tonscanplus/main/data.json"

// fetch(url).then((response) => response.text()).then( text => {
//     let json = JSON.parse(text.replace(/,[\n\s]+}/gm, "\n}"))
//     Object.keys(json).map(key => {
//         addRow(json, key)
//     })
// })
function loadGithub(){
    const url = "https://raw.githubusercontent.com/menschee/tonscanplus/main/data.json"

    fetch(url).then((response) => response.text()).then( text => {
        const json = JSON.parse(text.replace(/,[\n\s]+}/gm, "\n}"))
        Object.keys(json).forEach(async key => {
            const currentAddress = await chrome.storage.local.get(key);
            if(Object.keys(currentAddress).length === 0) {
                const data = {}
                data[key] = {name: json[key], type: "github"}
                chrome.storage.local.set(data);
            }
        })
    })
}

async function saveData(e){
    const text = $("#select")
    const input = $("#selected_input")
    const currentValue = input.val()
    const data = {}
    if(text.data().address !== undefined){
        const dataStorage = await chrome.storage.local.get(text.data().address)
        if(currentValue.trim() === "") {
            chrome.storage.local.remove(text.data().address);
        }

        data[text.data().address] = {}
        data[text.data().address].name = currentValue
        data[text.data().address].type = dataStorage[text.data().address].type
    } else if(text.data().name !== undefined ) {
        const dataStorage = await chrome.storage.local.get(text.text())
        if(currentValue.trim() === "") {
            chrome.storage.local.remove(text.text());
        }
        else{
            data[currentValue] = {}
            data[currentValue].name = text.data().name
            data[currentValue].type = dataStorage[text.text()].type
            chrome.storage.local.remove(text.text());
        }
       
    }
    chrome.storage.local.set(data);
    input.remove()
    $(e.target).remove()
    $("#select").css("display", "").attr("id", "")
    getJson()
}

function editTd(e){
    if($("#ton-addr__users tbody input").length === 0){
        const currentElement = $(e.target)
        const button = $("<button>ok</button>")
        const input = $(`<input id="selected_input" type="text" value="${currentElement.text()}" style="width: 80%">`)
        
        button.click(saveData)

        currentElement.parent().append(input)
        currentElement.parent().append(button)
        
        currentElement.attr("id", "select")
        currentElement.css("display", "none")
    }
}

async function createTd({
    dataSetName="address",
    dataSetValue="",
    style={},
    data, 
    click=editTd
} = {}){

    const newTd =  $("<td></td>")
    const newDiv =  $(`<div data-${ dataSetName }="${ dataSetValue }">${ data }</div>`)

    newTd.css({ textAlign: "center"})
    newDiv.css(style)
    newTd.append(newDiv)
    newTd.children().click(click)

    return newTd
}

async function addRow(json, key){
    const newRow = $("<tr></tr>")
    const element = $("#ton-addr__users tbody")

    newRow.append(await createTd({ dataSetValue: key, data: json[key].name , style: { "min-width": "50px", "min-height": "20px" } }))
    newRow.append(await createTd({ dataSetName:"name", dataSetValue: json[key].name, data: key }))
    newRow.append(await createTd({ dataSetName:"name", dataSetValue: key.name, data: json[key].type, click: ()=>""}))

    element.append(newRow)
}

async function getJson(){
    const address = await chrome.storage.local.get(null)
    const element = $("#ton-addr__users tbody tr")
    element.remove()
    
    let filtered = Object.keys(address).filter( f => f !== "state")
    if(Object.keys(filtered).length === 0) { 
        await loadGithub() 
        await getJson()
    }

    filteredLocal = filtered.filter( addr => address[addr].type === "local" )
    filteredGithub = filtered.filter( addr => address[addr].type === "github" )
    
    filteredLocal.forEach( async key => await addRow(address, key) )
    filteredGithub.forEach( async key => await addRow(address, key) )
}
getJson()