import React from "react";

export default class SongCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDragging: false,
      draggedTo: false,
    };
  }
  handleDragStart = (event) => {
    console.log("drag started");
    event.dataTransfer.setData("song", event.target.id);
    this.setState((prevState) => ({
      isDragging: true,
      draggedTo: prevState.draggedTo,
    }));
  };
  handleDragOver = (event) => {
    console.log("drag over");
    event.preventDefault();
    this.setState((prevState) => ({
      isDragging: prevState.isDragging,
      draggedTo: true,
    }));
  };
  handleDragEnter = (event) => {
    console.log("drag enter");
    event.preventDefault();
    this.setState((prevState) => ({
      isDragging: prevState.isDragging,
      draggedTo: true,
    }));
  };
  handleDragLeave = (event) => {
    console.log("drag leave");
    event.preventDefault();
    this.setState((prevState) => ({
      isDragging: prevState.isDragging,
      draggedTo: false,
    }));
  };
  handleDrop = (event) => {
    console.log("drop");
    event.preventDefault();
    let target = event.target;
    let targetId = target.id;
    targetId = targetId.substring(target.id.indexOf("-") + 1);
    let sourceId = event.dataTransfer.getData("song");
    sourceId = sourceId.substring(sourceId.indexOf("-") + 1);

    this.setState((prevState) => ({
      isDragging: false,
      draggedTo: false,
    }));

    // ASK THE MODEL TO MOVE THE DATA
    this.props.moveCallback(sourceId, targetId);
  };

  getItemNum = () => {
    return this.props.id.substring("playlist-song-".length);
  };

  render() {
    const { song } = this.props;
    let num = this.getItemNum();
    console.log("num: " + num);
    let itemClass = "playlister-song list-card unselected-list-card";
    if (this.state.draggedTo) {
      itemClass =
        "playlister-song-dragged-to unselected-list-card list-card" +
        (this.state.isDragging ? "" : " is-dragging");
    }
    return (
      <div
        id={"song-" + num}
        className={itemClass}
        onDragStart={this.handleDragStart}
        onDragOver={this.handleDragOver}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
        draggable="true"
      >
        {num + ". "}
        <a href={"https://www.youtube.com/watch?v=" + song.youTubeId}>
          {song.title} by {song.artist}
        </a>

        <input
          type="button"
          id={"delete-song-" + num}
          className="list-card-button"
          value={"X"}
        />
      </div>
    );
  }
}
