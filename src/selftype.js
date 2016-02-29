'use strict';

class SelfType {
    constructor (options) {
        this.loadSettings(options);
        this.exposePublicMethods();
        this.getTextDOMNode();
        this.setWord();
    }
    
    addHighlight () {
        var opt = this.default_options();
        this.oldValue = this.anim_text.style.color || opt.highlightColor;
        this.oldValueBg = this.anim_text.style.backgroundColor || opt.highlightBg;
        
        this.anim_text.style.backgroundColor = this.options.highlightColor;
        if (this.darkColor(this.options.highlightColor)) {
            this.anim_text.style.color = opt.lightColor;
        }
    }
  
    addLetter () {
        this.anim_text.innerText += this.word.substr(0, 1);
        this.word = this.word.substr(1);
        if (!this.word) {
            this.setDelay();
        }
    }
    
    darkColor (color) {
        if (color.indexOf('#') === -1) return false;
        
        var rgb = parseInt(color.substring(1), 16); // strip the hash sign from the colour
        var r = (rgb >> 16) & 0xff;  // extract red
        var g = (rgb >>  8) & 0xff;  // extract green
        var b = (rgb >>  0) & 0xff;  // extract blue
        
        var med = Math.floor((r + g + b) / 3);

        if (med > 255 / 2) {
            return true;
        }
        
        return false;
    }
    
    default_options () {
        return {
            highlightBg: 'transparent',
            highlightColor: 'rgba(0, 0, 0, .7)',
            lightColor: 'rgba(255, 255, 255, .9)',            
            max_speed: 10,
            min_speed: 1,
        };
    }
    
    default_words () {
        return [
            'awesome', 'amazing', 'the best language ever', 
            'pain', 'blood, sweat and tears', 'torture'
        ];
    }
  
    delayHasPassed () {
        if (!this.timestamp) return true;
        return this.timestamp + this.options.pause < Date.now();
    }
    
    exposePublicMethods () {
        this.pause = this.pauseAnimation;
        this.play  = this.playAnimation;
        this.reset = this.resetAnimation;
    }
    
    getRandomWord () {
        var random = Math.floor(Math.random() * this.words.length);
        var word = this.words[random];
        if (word === this.last_word) {
            word = this.getRandomWord();
        }
        this.last_word = word;
        return word;
    }
  
    getTextDOMNode () {
        var text = document.getElementById('st-text');
        if (text !== null) {
            this.anim_text = text;
        }
    }
  
    loadConfig (config) {
        this.options = this.options();
        
        if (typeof config !== 'object') return;
        
        for (var prop in config) {
            if (prop === 'speed') {
                config[prop] = this.parseSpeed(config[prop]);
            }
            
            if (prop !== 'words') {
                this.options[prop] = config[prop];
            }
        }
    }
    
    loadSettings (options) {        
        this.loadConfig(options);
        this.loadWords(options.words);
    }
    
    loadWords (words) {
        this.words = (typeof words === 'object' && words !== null && words.length) ? words : this.default_words();
    }
  
    options () {
        return {
            backspace: true,
            backspace_highlight: true,
            highlightColor: '#289BCC',
            pause: 1500,
            speed: 3,
        };
    };
    
    parseSpeed (speed) {
        if (typeof speed === 'string') {
            switch (speed) {
                case 'slow':
                    speed = 1;
                    break;

                case 'fast':
                    speed = 5;
                    break;

                case 'sonic':
                    speed = 10;
                    break;

                case 'medium':
                case 'normal':
                default:
                    speed = 3;
                    break;
            }
        } else if (typeof speed === 'number') {
            var opt = this.default_options();
            
            if (speed > opt.max_speed) {
                speed = opt.max_speed;
            }
            
            if (speed < opt.min_speed) {
                speed = opt.min_speed;
            }
        } else {
            speed = 3;
        }
        
        return speed;
    }
    
    pauseAnimation () {
        window.clearInterval(this.interval);
    }
    
    playAnimation () {
        var _that = this;
        var speed = Math.round(250/_that.options.speed);
        
        _that.interval = setInterval(function () {
            if (!_that.timestamp || (_that.timestamp && _that.delayHasPassed()))
            {
                _that.removeDelay();

                if (_that.word) {
                    _that.addLetter();
                } else if (_that.anim_text.innerText) {
                    if (_that.options.backspace) {
                        _that.removeLetter();
                    } else {
                        _that.resetAnimText(_that.options.backspace_highlight);
                    }
                } else {
                    _that.setWord();
                }
            }
        }, speed);
    }
  
    removeDelay () {
        this.timestamp = undefined;
    }
    
    removeHighlight () {
        this.anim_text.style.backgroundColor = this.oldValueBg;
        this.anim_text.style.color = this.oldValue;
    }
  
    removeLetter () {
        var text = this.anim_text.innerText;
        this.anim_text.innerText = text.substr(0, text.length - 1);
        if (!this.anim_text.innerText) {
            this.setDelay();
        }
    }
    
    resetAnimation () {
        this.pauseAnimation();
        this.playAnimation();
    }
    
    resetAnimText (highlight) {
        if (this.resetting_text) {
            return;
        } else {
            this.resetting_text = true;
        }
        
        var _that = this;
        var timeout = (highlight) ? (this.options.pause / 1.5) : 0;
            
        if (highlight) {
            this.addHighlight();
        }

        setTimeout(function () {
            _that.anim_text.innerText = '';
            _that.removeHighlight();
            _that.setDelay(-(_that.options.pause / 4));
            _that.resetting_text = false;
        }, timeout);
    }
  
    setDelay (len) {
        var offset = 0;
        
        if (len !== undefined && typeof len === 'number') {
            offset = len;
        }
                
        this.timestamp = Date.now() + offset;
    }
    
    setWord () {
        this.word = this.getRandomWord() + '.';
        this.resetAnimation();
    }
}

var selftype;

window.onload = function () {
    selftype = new SelfType();
}

window.onbeforeunload = function () {
    if (selftype !== undefined) {
        selftype.pause();
    }
};