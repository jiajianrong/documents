/*
class Component{
    
    render() {
        console.log( this.constructor.name +  ' render' )
        this.child && this.child.render()
    }
    
    setState(o) {
        var k
        for (k in o) {
            this.state[k] = o[k]
        }
        this.render()
    }
    
}



class Parent extends Component {
    
    constructor() {
        super()
        this.state = {x: 0}
    }
    
    hook() {
        this.setState({x: 1})
    }
    
    setChild(c) {
        this.child = c
        this.child.parentHook = this.hook.bind(this)
    }
    
}



class Child extends Component {
    
    constructor() {
        super()
        this.state = {}
    }
    
    hook() {
        this.setState({x: 2})
        this.parentHook()
    }
    
}



var p = new Parent()
var c = new Child()

p.setChild(c)
c.hook()
*/

// -----------
// batching
// -----------

class Component {
    
    render() {
        console.log( this.constructor.name +  ' render; state=', this.state )
        this.child && this.child.render()
    }
    
    setState(state) {
        transaction.push(state, this)
    }
    
    _setState(o) {
        var k
        for (k in o) {
            this.state[k] = o[k]
        }
    }
    
    setChild(c) {
        this.child = c
        this.child.parentHook = this.hook.bind(this)
    }
    
}



class Parent extends Component {
    
    constructor() {
        super()
        this.state = {x: 0}
    }
    
    hook() {
        this.setState({x: 1})
    }
    
}



class Child extends Component {
    
    constructor() {
        super()
        this.state = {y: 10}
    }
    
    hook() {
        this.setState({y: 11})
        this.parentHook()
    }
    
}




var transaction = {
    
    state_queue: [],
    comp_queue: [],
    
    
    flush: function() {
        
        var state, comp
        
        for (var i=this.state_queue.length-1;i>-1;i--) {
            state = this.state_queue[i]
            comp = this.comp_queue[i]
            
            comp._setState(state)
        }
        
        // child render first
        this.comp_queue[1].render()
        
    },
    
    
    push: function(state, comp) {
        this.state_queue.push(state)
        this.comp_queue.push(comp)
    }
    
}




var p = new Parent()
var c = new Child()

p.setChild(c)
c.hook()

transaction.flush()
















