import React, { Component } from "react";

export default class EditSongModal extends Component {
  constructor(props) {
    super(props);
    const defaultSong = {
      title: "Untitled",
      artist: "Unknown",
      youTubeId: "dQw4w9WgXcQ",
    };
    this.state = { song: defaultSong, initialSong: defaultSong };
  }

  handleChange = (event) => {
    this.setState((prevState) => ({
      ...prevState,
      song: {
        ...prevState.song,
        [event.target.name]: event.target.value,
      },
    }));
  };
  render() {
    const { editSongCallback, hideEditSongModalCallback } = this.props;

    if (this.props.song != null && this.props.song !== this.state.initialSong) {
      this.setState({ song: this.props.song, initialSong: this.props.song });
    }

    return (
      <div class="modal" id="edit-song-modal" data-animation="slideInOutLeft">
        <div class="modal-root" id="edit-song-root">
          <div class="modal-north">Edit Song</div>
          <div class="modal-center">
            <div class="edit-song modal-center-content">
              <div>Title:</div>
              <input
                type="text"
                class="edit-song-properties"
                id="edit-song-title"
                name="title"
                value={this.state.song.title}
                onChange={this.handleChange}
              />
              <div>Artist:</div>
              <input
                type="text"
                class="edit-song-properties"
                id="edit-song-artist"
                name="artist"
                value={this.state.song.artist}
                onChange={this.handleChange}
              />
              <div>You Tube Id:</div>
              <input
                type="text"
                class="edit-song-properties"
                id="edit-song-youTubeId"
                name="youTubeId"
                value={this.state.song.youTubeId}
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div class="modal-south">
            <input
              type="button"
              id="edit-song-confirm-button"
              class="modal-button"
              value="Confirm"
              onClick={() => editSongCallback(this.state.song)}
            />
            <input
              type="button"
              id="edit-song-cancel-button"
              class="modal-button"
              value="Cancel"
              onClick={hideEditSongModalCallback}
            />
          </div>
        </div>
      </div>
    );
  }
}
