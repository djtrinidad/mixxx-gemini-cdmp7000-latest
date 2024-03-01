// ver 1

var CDMP7000 = {};

CDMP7000.sysex = [0xF0, 0x7D, 0x01];  // pre-amble for all sysex display messages


CDMP7000.init = function() {
  
  CDMP7000.leftDeck = new CDMP7000.Deck(1, 1);
//  CDMP7000.rightDeck = new CDMP7000.Deck(2, 2);
  CDMP7000.memoActive = 0;
  CDMP7000.vinylModeOn = 0;
  CDMP7000.leftDeck.reconnectComponents();
  midi.sendSysexMsg(CDMP7000.sysex.concat([0x3C, 0x62, 0x79, 0x65, 0x3E, 0xF7]),9);  // clear lcd
  
  message = "<artist><title>MIXXX DJ<album><genre><length>20<index>0";
  midi.sendSysexMsg(CDMP7000.sysex.concat(message.toInt(), 0xF7),4+message.length);   // sendto lcd song name slot
};

CDMP7000.shutdown = function() {
for (i=0x01; i<=0x60; i++) midi.sendShortMsg(0x90,i,0x00);  // Turn off all LEDs
};

CDMP7000.Deck = function (deckNumbers, midiChannel) {
  components.Deck.call(this, deckNumbers);
  
// =================       Transport            ==================== //
  
  this.cueButton = new components.CueButton([0x90, 0x01]);
  this.playButton = new components.PlayButton([0x90, 0x02]);
  this.syncButton = new components.SyncButton([0x90, 0x0D]);

// =================   Slip / Vinyl / Jogwheel    ================== //
  this.slipModeButton = new components.Button({
    midi: [0x90, 0x1F],
    key: "slip_enabled",
    type: components.Button.prototype.types.toggle,
  });

  this.vinylModeButton = function (channel, control, value, status, group) {
    if (value && !CDMP7000.vinylModeOn) {
      midi.sendShortMsg(0x90, 0x0E, 0x7F);
      CDMP7000.vinylModeOn = 1;
    } else if (value && CDMP7000.vinylModeOn) {
      midi.sendShortMsg(0x90, 0x0E, 0x00);
      CDMP7000.vinylModeOn = 0;
    } // end elif
  };
  
  this.wheelTouch = function (channel, control, value, status, group) {
    var deckNumber = script.deckFromGroup(group);
    if (value && CDMP7000.vinylModeOn == 1) {
      var alpha = 1.0/8;
      var beta = alpha/32;
      engine.scratchEnable(deckNumber, 128, 33+1/3, alpha,beta);
    } else {
            engine.scratchDisable(deckNumber);
    }
  };

  this.wheelTurn = function (channel, control, value, status, group) {
    var deckNumber = script.deckFromGroup(group);
    var newValue=(value-64);
    if (!engine.isScratching(deckNumber)) {
       engine.setValue(group, "jog", newValue);
       return;
    }
    engine.scratchTick(deckNumber,newValue);
  };

// ================= Loop IN/Loop Out/Reloop/Exit ================== //

  this.loopIn = new components.Button({
    midi: [0x90, 0x10],
    key: "loop_in",
    output: function (channel, control, value, status, group) {
      if (engine.getValue(this.group, "loop_in")) {
         this.send(0x7F);
      }
    }, // end output
  });

  this.loopOut = new components.Button({
    midi: [0x90, 0x11],
    key: "loop_out",
    output: function (channel, control, value, status, group) {
       if (engine.getValue(this.group, "loop_out")) {
         this.send(0x7F);
       }
    } // end output
  });

  /* replaced midi.sendShortMsg with engine.SetValue */
  this.reloopExit = new components.Button({
    midi: [0x90, 0x12],
    key: "reloop_exit",
    input: function (channel, control, value, status, group) {
        components.Button.prototype.input.apply(this, arguments);

        if (engine.getValue(group, "loop_enabled")) {
        midi.sendShortMsg(0x90, 0x10, 0x7F);
        midi.sendShortMsg(0x90, 0x11, 0x7F);
        } else {
        midi.sendShortMsg(0x90, 0x10, 0x00);
        midi.sendShortMsg(0x90, 0x11, 0x00);
       }
    }, // end output
  });
  
 
// ================= Hotcue / Memo Button Section ================== //
  
  this.hotcueButtons = [];
    for (var i = 1; i <= 3; i++) {
        this.hotcueButtons[i] = new components.HotcueButton({
            midi: [0x90, 0x04 + i],
            number: i,
    });
    }
 
  this.memoButton = new components.Button({
    midi: [0x91, 0x08],
    group: '[Controls]',
    key: 'touch_shift',
    input: function (channel, control, value, status, group) {
       if (value && CDMP7000.memoActive == 0) {
         for (let i = 1; i <= 3; i++) {
           CDMP7000.leftDeck.hotcueButtons[i].shift()
         }
         midi.sendShortMsg(0x90,0x08,0x7F);
         CDMP7000.memoActive = 1;
       } else if (value && CDMP7000.memoActive == 1) {
         for (let i = 1; i <= 3; i++) {
           CDMP7000.leftDeck.hotcueButtons[i].unshift()
         }
         midi.sendShortMsg(0x90,0x08,0x00);
         CDMP7000.memoActive = 0;
       } //endif
    }, // end input
   });

    
  this.reconnectComponents(function (c) {
        if (c.group === undefined) {
            // 'this' inside a function passed to reconnectComponents refers to the ComponentContainer
            // so 'this' refers to the custom Deck object being constructed
            c.group = this.currentDeck;
        }
    });
  
}

CDMP7000.Deck.prototype = new components.Deck();

