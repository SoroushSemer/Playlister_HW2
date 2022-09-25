import jsTPS_Transaction from "../common/jsTPS.js";
/**
 * RemoveSong_Transaction
 *
 * This class represents a transaction that works with removing a song.
 *  It will be managed by the transaction stack.
 *
 * @author McKilla Gorilla
 * @author Soroush Semer
 */
export default class RemoveSong_Transaction extends jsTPS_Transaction {
  constructor(initApp, initOldIndex, initOldSong) {
    super();
    this.app = initApp;
    this.oldIndex = initOldIndex;
    this.oldSong = initOldSong;
  }

  doTransaction() {
    this.app.removeSong(this.oldIndex);
  }

  undoTransaction() {
    this.app.addSong(this.oldIndex, this.oldSong);
  }
}
