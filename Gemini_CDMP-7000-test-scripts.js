var CDMP7000 = {};

CDMP7000.init = function() {
  CDMP7000.leftDeck = new CDMP7000.Deck(1, 1);

};

CDMP7000.shutdown = function() {

};

CDMP7000.Deck = function (deckNumbers, midiChannel) {
  components.Deck.call(this, deckNumbers);
 /* this.playButton = new components.PlayButton([0x90 + midiChannel, 0x01]); */
  this.cueButton = new components.CueButton([0x90, 0x01]);
  this.playButton = new components.PlayButton([0x90, 0x02]);
}

this.reconnectComponents(function (c) {
        if (c.group === undefined) {
            // 'this' inside a function passed to reconnectComponents refers to the ComponentContainer
            // so 'this' refers to the custom Deck object being constructed
            c.group = this.currentDeck;
        }
    });

CDMP7000.Deck.prototype = new components.Deck();
