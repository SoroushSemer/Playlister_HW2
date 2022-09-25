import React, { Component } from "react";

export default class RemoveSongModal extends Component {
  render() {
    const { song, removeSongCallback, hideRemoveSongModalCallback } =
      this.props;
    let title = "";
    if (song) {
      title = song.title;
    }
    return (
      <div class="modal" id="remove-song-modal" data-animation="slideInOutLeft">
        <div class="modal-root" id="verify-remove-song-root">
          <div class="modal-north">Remove song?</div>
          <div class="modal-center">
            <div class="modal-center-content">
              Are you sure you wish to permanently remove <span>{title}</span>{" "}
              from the playlist?
            </div>
          </div>
          <div class="modal-south">
            <input
              type="button"
              id="remove-song-confirm-button"
              class="modal-button"
              onClick={removeSongCallback}
              value="Confirm"
            />
            <input
              type="button"
              id="remove-song-cancel-button"
              class="modal-button"
              onClick={hideRemoveSongModalCallback}
              value="Cancel"
            />
          </div>
        </div>
      </div>
    );
  }
}
