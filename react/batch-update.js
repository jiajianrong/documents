/*
class Component{

    constructor() {
        this.state = {x: 0}
    }

    componentDidMount() {
        
        this.setState({x: 1})
        console.log(this.state)
        this.setState({x: 2})
        console.log(this.state)
        
    }
    
    
    setState(o) {
        
        var k
        for (k in o) {
            this.state[k] = o[k]
        }
        
    }

}


var comp = new Component()

comp.componentDidMount()
*/


// -----------
// batching
// -----------



class Component{
    
    setState(o) {
        transaction.push(function() {this._setState(o)}, this)
    }
    
    _setState(o) {
        var k
        for (k in o) {
            this.state[k] = o[k]
        }
    }

}





class MyComponent extends Component {
    
    constructor() {
        super()
        this.state = {x: 0}
    }
    
    componentDidMount() {
        this.setState({x: 1})
        console.log(this.state)
        this.setState({x: 2})
        console.log(this.state)
        setTimeout(()=>{ console.log(this.state) })
    }
    
    hookComponentDidMount() {
        this.componentDidMount()
        transaction.flush()
    }
}




var transaction = {
    
    queue: [],
    
    flush: function() {
        this.queue.forEach(f=>f())
    },
    
    push: function(f, ctx) {
        this.queue.push(f.bind(ctx)) //f()
    }
    
}




var comp = new MyComponent()

comp.hookComponentDidMount()









