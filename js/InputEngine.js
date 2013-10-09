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
        
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    },
    
    bind: function(key, action) {
        this.bindings[key] = action;
    },
    
    onKeyDown: function(event) {
        var action = this.bindings[event.keyCode];
        if (action) {
            this.actions[action] = true;
            event.preventDefault();
        }
        return false;
    
    },
    
    onKeyUp: function(event) {
        var action = this.bindings[event.keyCode];
        if (action) {
            this.actions[action] = false;
            
            var listeners = this.listeners[action];
            if (listeners) {
                for (var i = 0; i < listeners.length; i++) {
                    var listener = listeners[i];
                    listener();
                }
            }
        }
    
    
    }




});

gInputEngine = new InputEngine();
