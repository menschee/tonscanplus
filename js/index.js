const src = chrome.runtime.getURL("../config.js");
import(src).then( ({ config }) => {           
    function reloadPage(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        });
    }

    async function run(){
        const storage = await chrome.storage.local.get("state")
        

        if (storage.state === undefined || storage.state === "off") {
            await chrome.storage.local.set({state: "off"});
        }

        chrome.action.setIcon({ path: config.icons[storage.state] });

        $("#app__button__new-tab__table").click(function(){ 
            chrome.tabs.create({'url': chrome.runtime.getURL('table.html')})
        })

        $(".app__toggle").each((_, element) => {
            $(element).click(async function(){
                const currentElement = $(this)
                await resetToggles()
                await toggleState({element: currentElement, state: currentElement.data().state})
                reloadPage()
            })
        })

        $("#app__button__clear-storage").click(async function(){
            const storage = await chrome.storage.local.get("state")
            await chrome.storage.local.clear();
            await chrome.storage.local.set({state: storage.state});
            reloadPage()
        })

        async function resetToggles(){
            $(".app__toggle").addClass('btn-light')
            $(".app__toggle").removeClass('btn-danger')
            $(".app__toggle").removeClass('btn-success')
            $(".app__toggle").removeClass('active')
        }
        
        async function toggleState({element, state='off'} = {}) {
            element.addClass('active')
            element.addClass(config.interface.enum.btns[state])
            element.removeClass('btn-light')
            chrome.action.setIcon({ path: config.icons[state] });
            await chrome.storage.local.set({ state })
        }

        const currentState = await chrome.storage.local.get("state")
        const toggle = $( "#app__toggle__"+currentState.state )
        await toggleState({ element: toggle, state: currentState.state })
        $("#app__button__ton-address_and_name").click(async function(){
            const data = {}
            data[$("#app__input__ton-address").val()] = {name: $("#app__input__name").val(), type: "local"}
            $("#app__input__ton-address").val("")
            $("#app__input__name").val("")
            await chrome.storage.local.set(data);
        })
    } 

    run()

})