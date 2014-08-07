SoundManager = Class.extend({

    clips: {},

    enabled: true,

    soundContext: null,

    mainNode: null,

    //----------------------------
    init: function () {
        try {
            this.soundContext = new webkitAudioContext();
        } catch(e) {
         alert('Your browser does not support the webkit Audio Context API');
        }

        if (this.soundContext) {
            this.mainNode = this.soundContext.createGain();
            this.mainNode.connect(this.soundContext.destination);
        }    

    },

    loadAsync: function (path, callbackFcn) {
        var that = this;
        if (that.clips[path]) {
            callbackFcn(that.clips[path].s);
            return that.clips[path].s;
        }

        var clip = {
            s: new Sound(),
            b: null,
            l: false
        };
        that.clips[path] = clip;
        clip.s.path = path;

        var request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            that.soundContext.decodeAudioData(request.response,

                function (buffer) {
                    that.clips[path].b = buffer;
                    that.clips[path].l = true;
                    callbackFcn(that.clips[path].s);
                },

                function (data) {}
            );
        };
        
        request.send();


        return clip.s;

    },

    //----------------------------
    togglemute: function() {
        // Check if the gain value of the main node is 
        // 0. If so, set it to 1. Otherwise, set it to 0.
        if(this.mainNode.gain.value>0) {
            this.mainNode.gain.value = 0;
        }
        else {
            this.mainNode.gain.value = 1;
        }
    },

    //----------------------------
    stopAll: function() {
        // Disconnect the main node, then create a new 
        // Gain Node, attach it to the main node, and 
        // connect it to the audio context's destination. 
        this.mainNode.disconnect();
        this.mainNode = this.soundContext.createGain();
        this.mainNode.connect(this.soundContext.destination);
    },

    //----------------------------
    // Parameters:
    //	1) path: a string representing the path to the sound
    //           file.
    //  2) settings: a dictionary representing any game-specific
    //               settings we might have for playing this
    //               sound. In our case the only ones we'll be
    //               concerned with are:
    //               {
    //                   looping: a boolean indicating whether to
    //                            loop.
    //                   volume: a number between 0 and 1.
    //               }
    //----------------------------
    playSound: function (path, settings) {
        // Check if the Sound Manager has been enabled,
        // return false if not.
        if (!this.enabled) return false;

        // Set default values for looping and volume.
        var looping = false;
        var volume = 0.2;

        // Check if the given settings specify the volume
        // and looping, and update those appropriately.
        if (settings) {
            if (settings.looping) looping = settings.looping;
            if (settings.volume) volume = settings.volume;
        }

        // Check if the path has an associated sound clip,
        // and whether the sound has been loaded yet.
        // Return false if either of these sanity checks
        // fail.
        var sd = this.clips[path];
        if (sd === null) return false;
        if (sd.l === false) return false;

        var currentClip = null;

        // create a new buffer source for the sound we want
        // to play. We can do this by calling the 'createBufferSource'
        // method of this.soundContext.
        currentClip = this.soundContext.createBufferSource();

        // Set the properties of currentClip appropriately in order to
        // play the sound.
        currentClip.buffer = sd.b; // tell the source which sound to play
        var gain = this.soundContext.createGain();
        currentClip.loop = looping;

        // Connect currentClip to the main node, then play it. We can do
        // this using the 'connect' and 'noteOn' methods of currentClip.
        currentClip.connect(gain);
        gain.gain.value = volume;
        gain.connect(this.mainNode);
        currentClip.start(0);

        return true;
    }
});

//----------------------------
Sound = Class.extend({
    play: function(loop) {
        // Call the playSound function with the appropriate path and settings.
        this.playSound(this.path,{looping:loop, volume:1});
    }
});


