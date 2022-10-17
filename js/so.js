let src
let elementsSortNormal
let elementsSort
let newPage
let intervalIds
let customElements
let customEvents

function init(){
    src = chrome.runtime.getURL("config.js");
    elementsSortNormal = []
    elementsSort = []
    newPage = false
    intervalIds = []
    customElements = new Set()
    customEvents = []
}

function fire(){
    import(src).then(({ deepCopyConfig }) => {
        const config = deepCopyConfig()
        const objColors = {
            green: { back: config.green, text: config.greenLight},
            red: { back: config.red, text: config.redLight },
            gray: { back: config.gray, text: config.white }
        }

        document.querySelectorAll('.custom__style__for__custom_name').forEach(el => el.remove())
        
        const styleForCustomName = document.createElement('style')
        customElements.add(styleForCustomName)
        styleForCustomName.classList.add('custom__style__for__custom_name')
        styleForCustomName.innerHTML = ` .custom__name:before { color: ${config.yellow}; }`

        document.querySelector('.tx-history-wrap').prepend(styleForCustomName)

        const intId1 = setInterval(() => {
            if(chrome.runtime.id !== undefined){
                chrome.storage.local.get(['state'], function(storage) {
                    if(storage.state === "on"){
                        const elements = document.querySelectorAll("[data-loopa]")
                        elements.forEach(element => {
                            const tonAddress = element.dataset.loopa+element.dataset.poopa
                            chrome.storage.local.get(tonAddress, function(storageAddr) {
                                const current = storageAddr[tonAddress] 
                                if(current !== undefined){
                                    element.classList.add('custom__name')
                                    element.dataset.loopa = current.name
                                    element.dataset.poopa = `(${replacer(tonAddress)})`
                                }
                            })
                        })

                        document.querySelectorAll(".card-main-address").forEach( element => {
                            const currentElement = element.innerText.trim()
                            const idForCustomElement = 'current-ton-address__custom-element'
                            const customText = val => "Name: "+val

                            async function getData(){
                                const data = await chrome.storage.local.get(currentElement)
                                const curElement = document.getElementById(idForCustomElement)
                                if(Object.keys(data).length !== 0 ){
                                    const current = data[currentElement]
                                    if(current !== undefined){
                                        if(curElement === null){
                                            const el = document.createElement('span')

                                            el.innerText = customText(current.name)
                                            el.id = idForCustomElement
                                            el.style =`
                                                background: var(--body-background);
                                                border-radius: 60px;
                                                padding-left: 10px;
                                                width: fit-content;
                                                padding-right: 10px;
                                                padding-bottom: 5px;
                                                padding-top: 5px;
                                            `
                                            document.getElementsByClassName("card-main-address")[0].parentElement.append(el)
                                        } else if(curElement.innerText !== customText(current.name)){
                                            curElement.innerText = customText(current.name)
                                        }
                                    }
                                } else {
                                    curElement !== null && curElement.remove()
                                }
                            }
                            getData()
                        })
                    }
                });
            }
        }, 1000);

        intervalIds.push(intId1)
        const ALL = () =>{ 
                console.debug('create ALL')
                const ALL = new Action(objColors.gray, "ALL")
                ALL.setNext(new Action(objColors.red, "OUT"))
                .setNext(new Action(objColors.green, "IN"))
                .setNext(ALL)
                return ALL
            }

        let current = ALL()
        const action = function () { 
            console.debug('action')
            if (!newPage) current = current.next;
            const style = document.querySelector(".custom__css")
            if(style === null) {
                const styleElement = document.createElement("style")
                customElements.add(styleElement)
                styleElement.className = "custom__css"
                styleElement.innerHTML = ` .custom__parent__${current.text === "OUT" ? 'in': 'out'} { display: none }`
                document.querySelector('head').appendChild(styleElement)
            } else{
                if (current.text === "ALL"){ document.querySelector(".custom__css").remove() } 
                else { style.innerHTML = `.custom__parent__${current.text === "OUT" ? 'in': 'out'} { display: none } ` }
            }
            setButton()
        }

        function setButton({ object=current } = {}){
            console.debug('setButton')
            chrome.storage.local.get('state', ({ state }) => {
                if(state !== 'on') return;

                document.querySelector(".tx-history-wrap thead th:nth-child(4)").innerHTML = `
                    <button id="custom__button" class="tx-table__badge" style="background: ${object.color.back}; color: ${object.color.text}">${object.text}</button>
                `
                custom__button.onclick = action
                customElements.add(custom__button)
            })
        }

        function createBtnSort({ defaultDirection = config.direction } = {}){
            console.debug('createBtnSort')
            chrome.storage.local.get('state', ({ state }) => {
                if(state !== 'on') return;
                
                const genBtnSort = {}

                const custom__sort__arrow = document.querySelector(".custom__sort__arrow")
                custom__sort__arrow !== null && custom__sort__arrow.remove();

                genBtnSort[config.so.enum.UP] =  {
                    element: function(withContainer=true){ 
                        const container = createContainer()
                        const element = createElementBtnSort({ color: config.grayLight, transform:"rotate(-180deg)" })

                        container.appendChild(element)

                        return withContainer ? container : element
                    },
                    next: config.so.enum.DOWN
                }

                genBtnSort[config.so.enum.DOWN] = {
                    element: function(withContainer=true){ 
                        const container = createContainer()
                        const element = createElementBtnSort({ color: config.grayLight, transform: "rotate(0)", mt: withContainer && "13px" })

                        container.appendChild(element)

                        return withContainer ? container : element
                    },
                    next: config.so.enum.ALL
                }

                genBtnSort[config.so.enum.ALL] =  {
                    element: function(){ 
                        const container = createContainer()
                        container.appendChild(genBtnSort[config.so.enum.UP].element(false))
                        container.appendChild(genBtnSort[config.so.enum.DOWN].element(false))

                        return container
                    },
                    next: config.so.enum.UP
                }
                
                const btnSort = genBtnSort[defaultDirection].element()

                document.querySelector('th:nth-child(6)').style.display = 'flex'
                document.querySelector('th:nth-child(6)').appendChild(btnSort)

                btnSort.onclick = function(){ 
                    config.direction = genBtnSort[defaultDirection].next
                    createBtnSort()
                    sorting()
                }
                customElements.add(btnSort)
            })
        }

        function sorting(){
            console.debug('sorting')
            chrome.storage.local.get('state', ({ state }) => {
                if(state !== 'on') return;

                if(config.direction !== config.so.enum.ALL){
                    elementsSort.sort((a, b)=> {
                                if(config.direction === config.so.enum.UP) return parseFloat(a.dataset.value)-parseFloat(b.dataset.value) 
                                else return parseFloat(b.dataset.value)-parseFloat(a.dataset.value)
                            }).forEach(currentNode => {
                                currentNode && currentNode.parentNode && currentNode.parentNode.appendChild(currentNode)
                            })
                } else {
                    elementsSortNormal.forEach(currentNode => {
                        currentNode && currentNode.parentNode && currentNode.parentNode.appendChild(currentNode)
                    })
                }
            })
        }

        function loadAllData(){
            console.debug('loadAllData')
            chrome.storage.local.get('state', ({ state }) => {
                if(state !== 'on') return;
                const loaderElement = createLoader()
                const idInterval = setInterval(() => { document.querySelector('.mugen-scroll__button').click() }, 100)
                intervalIds.push(idInterval)
                throttle( id => {
                    clearInterval(id)
                    setButton()
                    createBtnSort()
                    const intId2 = setInterval(addActionFromClickAddress, 500)
                    const intId3 = setInterval(classAdd, 1000)
                    intervalIds.push(intId2)
                    intervalIds.push(intId3)

                    loaderElement.remove()
                }, config.loadAllDataTimeout)(idInterval)
            })
        }

        throttle(loadAllData, 100)()
        addEvent('custom__event__need_sort', sorting)
    })
}

function addEvent(name, callback){
    window.addEventListener(name, callback)
    customEvents.push({ name, callback })
}

function removeEvent({ name, callback, all=false }={}){
    if(all){
        customEvents.forEach(customEvent => window.removeEventListener(customEvent.name, customEvent.callback))
        customEvents.length = 0
    } else {
        window.removeEventListener(name, callback)
    }
}

class Action{
    constructor(color,text,next){
        console.debug('Action init')
        this.color = color
        this.text = text
        this.next = next
    }
    setNext(e){
        this.next = e
        return e
    }
}

function classAdd(){
    try{
        chrome.storage.local.get('state', ({ state }) => {
            if(state !== 'on') return;
            const classIn = 'custom__parent__in'
            const classOut = 'custom__parent__out'
            const elements = document.querySelectorAll(`tbody tr:not(.custom__row)`)
            if(elements.length > 0){
                console.debug('classAdd')
                elements.forEach(e => {
                    const elOut = e.querySelector('.tx-table__badge--out')
                    const elIn = e.querySelector('.tx-table__badge--in')

                    e.classList.add("custom__row")

                    if (elOut !== null && !e.classList.contains(classOut) ){ e.classList.add(classOut) }
                    else if(elIn !== null && !e.classList.contains(classIn) ){ e.classList.add(classIn) }
                })
                setDataset()
                let event = new Event("custom__event__need_sort", {bubbles: true})
                window.dispatchEvent(event);
            }
        })
    } catch {}
}

function setDataset({ selector='.custom__row',  key='value' }={}){
    console.debug('setDataset')
    document.querySelectorAll(selector).forEach((row) => {
        if( row.parentNode.dataset[key] === undefined){
            let arrNum
            console.debug(navigator.language)
            if(navigator.language === 'en'){
                arrNum  = row.querySelector('td:nth-child(6) div').innerText.replaceAll(/\s|TON|,/gi, '').split(/[\.]/gi) 
            } else {
                arrNum  = row.querySelector('td:nth-child(6) div').innerText.replaceAll(/\s|TON|\./gi, '').split(/[,]/gi)
            }
            
            if(arrNum.length > 1){
                const lZero = arrNum.slice(arrNum.length-1).join('')
                const gZero = arrNum.slice(0, arrNum.length-1).join('')
                row.parentNode.dataset[key] = parseFloat(gZero+"."+lZero)
            } else {
                row.parentNode.dataset[key] = parseInt(arrNum)
            }
        }
        if ( row.parentNode.dataset[key] !== undefined && !elementsSortNormal.includes(row.parentNode) ) { elementsSortNormal.push(row.parentNode) }
        if ( !elementsSort.includes(row.parentNode) ) { elementsSort.push(row.parentNode) }
    })
}

function addActionFromClickAddress(){
    try{
        chrome.storage.local.get('state', ({ state }) => {
            if(state !== 'on') return;
            const elements = document.querySelectorAll(".address-link.clickable:not(.custom__click)")
            elements.forEach(e => {
                e.classList.add('custom__click')
                e.onclick = (e) => {
                    if(!e.ctrlKey && !e.shiftKey && !e.altKey){
                        clearApp()
                        init()
                        fire()
                    }
                }
            })
        })
    } catch {}
}

function replacer(text, size={max:10,start: 5,end: 5}){
    if(text.length > size.max){ return text.slice(0,size.start)+'...'+text.slice(text.length-size.end) }
    return text
}

function createElementBtnSort({
    color, 
    transform, 
    mt
}={}){
    console.debug('createElementBtnSort')
    const btnSort = document.createElement("div")
    customElements.add(btnSort)
    btnSort.style.width=0
    btnSort.style.height=0
    btnSort.style.fontSize=0
    btnSort.style.lineHeight=0
    btnSort.style.float="left"
    btnSort.style.borderLeft="10px solid transparent"
    btnSort.style.borderRight="10px solid transparent"
    btnSort.style.borderTop="10px solid " + color
    btnSort.style.marginTop=mt === undefined || !mt ? "4px": mt
    btnSort.style.transform=transform
    return btnSort
}

function createContainer(className="custom__sort__arrow"){
    console.debug('createContainer')
    const container = document.createElement('div')
    customElements.add(container)
    container.className = className
    container.style.width = '20px'
    container.style.height = '25px'
    return container
}

function createLoader(){
    console.debug('createLoader')
    const divTable = document.querySelector(".tx-history-wrap")
    const div = document.createElement('div')
    const img = document.createElement('img')
    div.className = "custom__loader"
    
    div.style.position= "absolute";
    div.style.width= "100%";
    div.style.height= "100%";
    div.style.background= "var(--card-background)";
    div.style.zIndex= "100";
    div.style.opacity= "0.8"
    div.style.display= "flex";
    div.style.justifyContent= "center";

    img.src = chrome.runtime.getURL("./icons/loader.png")
    img.style.marginTop = "50px"
    img.style.height = img.style.width = '50px'
    img.style.userSelect = "none"

    div.appendChild(img)
    divTable.prepend(div)
    return div
}

function throttle(call, timeout) {
    let timer = null

    return function perform(...args) {
        if (timer) return

        timer = setTimeout(() => {
            call(...args)

            clearTimeout(timer)
            timer = null
        }, timeout)
    }
}

function clearApp(){
    removeEvent({ all: true })
    intervalIds.forEach(intId => clearInterval(intId) )
    customElements.forEach(el => el && el.remove() )
}

init("First init")
fire()