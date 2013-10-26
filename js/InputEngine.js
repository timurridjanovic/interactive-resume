InputEngine = Class.extend({
/*A dictionary mapping ASCII key codes to string values to describe the action 
we want to take when a key is pressed*/

    bindings: {},
    
    actions: {},
    
    listeners: [],
    
    setup: function() {
        this.bind(38, 'up');
        this.bind(37, 'left');
        this.bind(40, 'down');
        this.bind(39, 'right');
        this.bind(32, 'space');
        this.bind(8, 'backspace');
        this.bind(187, '+');
        this.bind(189, '-');
        this.bind(13, 'enter');
        this.bind(112, 'F1');
        
        
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    },
    
    bind: function(key, action) {
        this.bindings[key] = action;
    },
    
    onKeyDown: function(event) {
        var action = gInputEngine.bindings[event.keyCode];
        if (action) {
            gInputEngine.actions[action] = true;
            event.preventDefault();
        }
        return false;
    
    },
    
    onKeyUp: function(event) {
        var action = gInputEngine.bindings[event.keyCode];
        if (action) {
            gInputEngine.actions[action] = false;
            
            var listeners = gInputEngine.listeners[action];
            if (listeners) {
                for (var i = 0; i < listeners.length; i++) {
                    var listener = listeners[i];
                    listener();
                }
            }
            event.preventDefault();
        }
        return false;
    
    
    },
    
    addListener: function(action, listener) {
        this.listeners[action] = this.listeners[action] || new Array();
        this.listeners[action].push(listener);
    
    },
    
    removeListeners: function() {
        this.listeners = [];
    
    }




});

gInputEngine = new InputEngine();
