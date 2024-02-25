var CDMP7000 = {};

CDMP7000.init = function() {
  
  CDMP7000.leftDeck = new CDMP7000.Deck(1, 1);
  CDMP7000.memoActive = 0;
  //CDMP7000.leftDeck.hotcueButtons[1].unshift()
  CDMP7000.leftDeck.reconnectComponents();

};

CDMP7000.shutdown = function() {
for (i=0x01; i<=0x60; i++) midi.sendShortMsg(0x90,i,0x00);  // Turn off all LEDs
};

CDMP7000.Deck = function (deckNumbers, midiChannel) {
  components.Deck.call(this, deckNumbers);
 /* this.playButton = new components.PlayButton([0x90 + midiChannel, 0x01]); */
  this.cueButton = new components.CueButton([0x90, 0x01]);
  this.playButton = new components.PlayButton([0x90, 0x02]);

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
    type: components.Button.prototype.types.push,
    on: 0x7F,
    off: 0x00,
    input: function (channel, control, value, status, group) {
       if (value && CDMP7000.memoActive == 0) {
         for (let i = 1; i <= 3; i++) {
           CDMP7000.leftDeck.hotcueButtons[i].shift()
         } 
         CDMP7000.memoActive = 1;
       } else if (value && CDMP7000.memoActive == 1) {
         for (let i = 1; i <= 3; i++) {
           CDMP7000.leftDeck.hotcueButtons[i].unshift()
         }  
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

