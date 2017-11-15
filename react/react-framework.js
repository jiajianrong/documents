var h = require("virtual-dom/h")
var render = require("virtual-dom/render")
var raf = require("raf")
var Observ = require("observ")
var ObservArray = require("observ-array")
var computed = require("observ/computed")
var diff = require("virtual-dom-diff")
var patch require("virtual-dom-patch")
var batch = require("virtual-dom-batch")




var store = {
    text: Observ(''),
    items: ObservArray([])
}



/* component */
class TodoList {
	constructor(props) {}
	
	render() {
		let items = this.props.items
		return h("ul", items.map( text => h("li", text) ))
	}
}


/* component */
class AddTodo {
	constructor(props) {}
	
	render() {
		return h("div", { "onClick": this.clickHandler }, [
            h("input", { value: props.text, name: "text" }),
            h("button", "Add")
        ])
	}
	
	clickHandler(ev) {
		store.items.push(ev.originTarget.siblingPrevious.value)
		store.text.set('')
	}
}


/* App */
function TodoApp(state) {
	
    return h("div", [
        h("h3", "TODO"),
		new TodoList(state.items),
        new AddTodo()
    ])
}






// render initial store
var vTree = TodoApp(store)
var domTree = render(vTree)

document.body.appendChild(domTree)









// when store changes, diff it
var diffQueue = []
var applyUpdate = false
computed([store.text, store.items], function () {
    // only call `update()` in next tick.
    // this allows for multiple synchronous changes to the state
    // in the current tick without re-rendering the virtual DOM
    if (applyUpdate === false) {
        applyUpdate = true
        setImmediate(function () {
            update()
            applyUpdate = false
        })
    }
})




function update() {
    var vNextTree = TodoApp(store)

    // calculate and cache the diff
    var patches = diff(vTree, vNextTree)
    diffQueue = diffQueue.concat(patches)
    vTree = vNextTree
}



// at 60 fps, batch all the patches and then apply them
raf(function renderDOM() {
    var patches = batch(diffQueue)
    patch(domTree, patches)

    raf(renderDOM)
})




/*
 * reference: https://gist.github.com/Raynos/8414846
 */

