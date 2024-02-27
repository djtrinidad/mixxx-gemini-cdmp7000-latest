// ver 1

var CDMP7000 = {};

CDMP7000.sysex = [0xF0, 0x7D, 0x01];  // pre-amble for all sysex display messages


CDMP7000.init = function() {
  
  CDMP7000.leftDeck = new CDMP7000.Deck(1, 1);
  CDMP7000.memoActive = 0;
  CDMP7000.vinylModeOn = 0;
  CDMP7000.leftDeck.reconnectComponents();
  midi.sendSysexMsg(CDMP7000.sysex.concat([0x3C, 0x62, 0x79, 0x65, 0x3E, 0xF7]),9);
  message = "<artist><title>MIXXX - Welcome DJ<album><genre><length>20<index>0";
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
  //this.sync

// =================   Slip / Vinyl / Jogwheel    ================== //
  this.slipModeButton = new components.Button({
    midi: [0x90, 0x1F],
    key: "slip_enabled",
    type: components.Button.prototype.types.toggle,
  });

  this.vinylModeButton = function (channel, control, value, status, group) {
    if (value && CDMP7000.vinylModeOn == 0) {
      CDMP7000.leftDeck.jogWheel.vinylMode = true;
      midi.sendShortMsg(0x90, 0x0E, 0x7F);
      CDMP7000.vinylModeOn = 1;
    } else if (value && CDMP7000.vinylModeOn == 1) {
      CDMP7000.leftDeck.jogWheel.vinylMode = false;
      midi.sendShortMsg(0x90, 0x0E, 0x00);
      CDMP7000.vinylModeOn = 0;
    } // end elif
  };
  
  this.jogWheel = new components.JogWheelBasic({
    deck: 1,
    wheelResolution: 1000,
    alpha: 1/8,
    beta: 1/8/32,
    rpm: 33 + 1/3,
});

// =================    Loop / Reloop Section     ================== //

  this.loopIn = new components.Button({
    midi: [0x90, 0x10],
    key: "loop_in",
  });

    this.loopOut = new components.Button({
    midi: [0x90, 0x11],
    key: "loop_out",
  });

    this.reloopExit = new components.Button({
    midi: [0x90, 0x12],
    key: "reloop_exit",
  });
  
// ================= Hotcue / Memo Button Section ================== //
  
  this.hotcueButtons = [];
    for (var i = 1; i <= 3; i++) {
        this.hotcueButtons[i] = new components.HotcueButton({
            midi: [0x90, 0x04 + i],
            number: i,
    });
    }
 /* This works, but trying with button components, and custom input 
  this.memoButtonPressed = function (channel, control, value, status, group) {
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
    }
    
  };
  */
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

