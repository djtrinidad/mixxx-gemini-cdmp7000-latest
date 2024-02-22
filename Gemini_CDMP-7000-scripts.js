/*
 * The Gemini CDMP-7000 controller operates as 2 independent controllers (think 2 CDJ-700's), with an analog mixer in-between.
 * The mappings are for the Left Deck and Right Deck controls only, since the mixer section sends no midi data.
 *
 * This is the vanilla mapping, I'll try to mimic the native function of each control first.  Then I plan to re-map some
 * buttons to better functions later.
 *
 * It's been shown that this mapping works on the Gemini CDJ-700 as well, they seem to have the same midi setup.
 */

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
  

