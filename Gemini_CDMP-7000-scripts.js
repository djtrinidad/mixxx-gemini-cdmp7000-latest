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
  CDMP7000.deck = [];
  for (let i = 0; i < 2; i++) {
    CDMP7000.deck[i] = new CDMP7000.Deck(i + 1, i);
    CDMP7000.deck[i].setCurrentDeck("[Channel" + (i + 1) + "]");
  }
  for (i = 1; i < 40; i++) {
    midi.SendShortMsg(0x90, i, 0x7f);
  }
};

CDMP7000.Deck = function(deckNumbers, offset) {
  components.Deck.call(this, deckNumbers);

  this.wheelTouch = function(channel, control, value, _status, _group) {
    if (value == 0x7F) {
      const alpha = 1.0/8;
      const beta = alpha/32;
      engine.scratchEnable(script.deckFromGroup(this.currentDeck), 512, 45, alpha, beta);
    }
  }
};
