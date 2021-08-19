class InputEngine {
  bindings = {};
  actions = {};
  listeners = [];
  setup() {
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
  }

  bind(key, action) {
    this.bindings[key] = action;
  }

  onKeyDown(event) {
    const action = gInputEngine.bindings[event.keyCode];
    if (action) {
      gInputEngine.actions[action] = true;
      event.preventDefault();
    }
    return false;
  }

  onKeyUp(event) {
    const action = gInputEngine.bindings[event.keyCode];
    if (action) {
      gInputEngine.actions[action] = false;
      const listeners = gInputEngine.listeners[action];
      if (listeners) {
        for (let i = 0; i < listeners.length; i++) {
          const listener = listeners[i];
          listener();
        }
      }

      event.preventDefault();
    }

    return false;
  }

  addListener(action, listener) {
    this.listeners[action] = this.listeners[action] || new Array();
    this.listeners[action].push(listener);
  }

  removeListeners() {
    this.listeners = [];
  }
}

const gInputEngine = new InputEngine();
