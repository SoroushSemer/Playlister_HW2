import React from "react";

export default class SidebarHeading extends React.Component {
  handleClick = (event) => {
    const { createNewListCallback } = this.props;
    createNewListCallback();
  };
  render() {
    return (
      <div id="sidebar-heading">
        <input
          type="button"
          id="add-list-button"
          className={
            this.props.canCreateNewList
              ? "toolbar-button"
              : "toolbar-button-disabled"
          }
          onClick={this.handleClick}
          value="+"
          disabled={!this.props.canCreateNewList}
        />
        Your Playlists
      </div>
    );
  }
}
