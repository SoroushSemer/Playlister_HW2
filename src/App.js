import React from "react";
import "./App.css";

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from "./db/DBManager";
import jsTPS from "./common/jsTPS.js";

// OUR TRANSACTIONS
import MoveSong_Transaction from "./transactions/MoveSong_Transaction.js";
import RemoveSong_Transaction from "./transactions/RemoveSong_Transaction.js";
import EditSong_Transaction from "./transactions/EditSong_Transaction.js";
import AddSong_Transaction from "./transactions/AddSong_Transaction.js";

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from "./components/DeleteListModal.js";
import EditSongModal from "./components/EditSongModal.js";
import RemoveSongModal from "./components/RemoveSongModal.js";

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from "./components/Banner.js";
import EditToolbar from "./components/EditToolbar.js";
import PlaylistCards from "./components/PlaylistCards.js";
import SidebarHeading from "./components/SidebarHeading.js";
import SidebarList from "./components/SidebarList.js";
import Statusbar from "./components/Statusbar.js";
const defaultSong = {
  title: "Untitled",
  artist: "Unknown",
  youTubeId: "dQw4w9WgXcQ",
};

class App extends React.Component {
  constructor(props) {
    super(props);

    // THIS IS OUR TRANSACTION PROCESSING SYSTEM
    this.tps = new jsTPS();

    // THIS WILL TALK TO LOCAL STORAGE
    this.db = new DBManager();

    // GET THE SESSION DATA FROM OUR DATA MANAGER
    let loadedSessionData = this.db.queryGetSessionData();

    // SETUP THE INITIAL STATE
    this.state = {
      listKeyPairMarkedForDeletion: null,
      currentList: null,
      currentSong: null,
      sessionData: loadedSessionData,
    };
  }
  sortKeyNamePairsByName = (keyNamePairs) => {
    keyNamePairs.sort((keyPair1, keyPair2) => {
      // GET THE LISTS
      return keyPair1.name.localeCompare(keyPair2.name);
    });
  };
  // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
  createNewList = () => {
    // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
    let newKey = this.state.sessionData.nextKey;
    let newName = "Untitled" + newKey;

    // MAKE THE NEW LIST
    let newList = {
      key: newKey,
      name: newName,
      songs: [],
    };

    // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
    // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
    let newKeyNamePair = { key: newKey, name: newName };
    let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
    this.sortKeyNamePairsByName(updatedPairs);

    // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
    // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
    // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
    // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
    // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
    // SHOULD BE DONE VIA ITS CALLBACK
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: newList,
        currentSong: prevState.currentSong,
        sessionData: {
          nextKey: prevState.sessionData.nextKey + 1,
          counter: prevState.sessionData.counter + 1,
          keyNamePairs: updatedPairs,
        },
      }),
      () => {
        // PUTTING THIS NEW LIST IN PERMANENT STORAGE
        // IS AN AFTER EFFECT
        this.db.mutationCreateList(newList);

        // SO IS STORING OUR SESSION DATA
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };
  // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
  deleteList = (key) => {
    // IF IT IS THE CURRENT LIST, CHANGE THAT
    let newCurrentList = null;
    if (this.state.currentList) {
      if (this.state.currentList.key !== key) {
        // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
        // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
        newCurrentList = this.state.currentList;
      }
    }

    let keyIndex = this.state.sessionData.keyNamePairs.findIndex(
      (keyNamePair) => {
        return keyNamePair.key === key;
      }
    );
    let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
    if (keyIndex >= 0) newKeyNamePairs.splice(keyIndex, 1);

    // AND FROM OUR APP STATE
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: null,
        currentList: newCurrentList,
        currentSong: prevState.currentSong,
        sessionData: {
          nextKey: prevState.sessionData.nextKey,
          counter: prevState.sessionData.counter - 1,
          keyNamePairs: newKeyNamePairs,
        },
      }),
      () => {
        // DELETING THE LIST FROM PERMANENT STORAGE
        // IS AN AFTER EFFECT
        this.db.mutationDeleteList(key);

        // SO IS STORING OUR SESSION DATA
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };
  deleteMarkedList = () => {
    this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
    this.hideDeleteListModal();
  };
  // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
  deleteCurrentList = () => {
    if (this.state.currentList) {
      this.deleteList(this.state.currentList.key);
    }
  };

  editCurrentSong = (newSong) => {
    if (this.state.currentSong != null) {
      this.addEditSongTransaction(this.state.currentSong, newSong);
      this.hideEditSongModal();
    }
  };

  editSong = (index, newSong) => {
    let newCurrentList = this.state.currentList;

    newCurrentList.songs[index] = newSong;

    // AND FROM OUR APP STATE

    this.setStateWithUpdatedList(newCurrentList);
  };

  removeCurrentSong = () => {
    if (this.state.currentSong != null) {
      this.addRemoveSongTransaction(this.state.currentSong);
      this.hideRemoveSongModal();
    }
  };

  removeSong = (index) => {
    let newList = this.state.currentList;
    newList.songs = newList.songs.filter((_, i) => i !== index);

    this.setStateWithUpdatedList(newList);
  };

  addNewSong = (song) => {
    this.addSong(null, song);
  };

  addSong = (index, song) => {
    let newList = this.state.currentList;
    if (index == null) {
      newList.songs.push(song);
    } else {
      newList.songs.splice(index, 0, song);
    }

    this.setStateWithUpdatedList(newList);
  };

  renameList = (key, newName) => {
    let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
    // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
    for (let i = 0; i < newKeyNamePairs.length; i++) {
      let pair = newKeyNamePairs[i];
      if (pair.key === key) {
        pair.name = newName;
      }
    }
    this.sortKeyNamePairsByName(newKeyNamePairs);

    // WE MAY HAVE TO RENAME THE currentList
    let currentList = this.state.currentList;
    if (currentList.key === key) {
      currentList.name = newName;
    }

    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: null,
        sessionData: {
          nextKey: prevState.sessionData.nextKey,
          counter: prevState.sessionData.counter,
          keyNamePairs: newKeyNamePairs,
        },
      }),
      () => {
        // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
        // THE TRANSACTION STACK IS CLEARED
        let list = this.db.queryGetList(key);
        list.name = newName;
        this.db.mutationUpdateList(list);
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };
  // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
  loadList = (key) => {
    let newCurrentList = this.db.queryGetList(key);
    this.tps.clearAllTransactions();
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: newCurrentList,
        currentSong: prevState.currentSong,
        sessionData: this.state.sessionData,
      }),
      () => {
        // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
        // THE TRANSACTION STACK IS CLEARED
        this.tps.clearAllTransactions();
      }
    );
  };
  // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
  closeCurrentList = () => {
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: null,
        currentSong: prevState.currentSong,
        sessionData: this.state.sessionData,
      }),
      () => {
        // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
        // THE TRANSACTION STACK IS CLEARED
        this.tps.clearAllTransactions();
      }
    );
  };
  setStateWithUpdatedList(list) {
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: list,
        currentSong: prevState.currentSong,
        sessionData: this.state.sessionData,
      }),
      () => {
        // UPDATING THE LIST IN PERMANENT STORAGE
        // IS AN AFTER EFFECT
        this.db.mutationUpdateList(this.state.currentList);
      }
    );
  }

  setStateWithCurrentSong(index) {
    this.setState((prevState) => ({
      listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
      currentList: prevState.currentList,
      currentSong: index,
      sessionData: this.state.sessionData,
    }));
  }

  getPlaylistSize = () => {
    return this.state.currentList.songs.length;
  };
  // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
  // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
  moveSong(start, end) {
    let list = this.state.currentList;

    // WE NEED TO UPDATE THE STATE FOR THE APP
    start -= 1;
    end -= 1;
    if (start < end) {
      let temp = list.songs[start];
      for (let i = start; i < end; i++) {
        list.songs[i] = list.songs[i + 1];
      }
      list.songs[end] = temp;
    } else if (start > end) {
      let temp = list.songs[start];
      for (let i = start; i > end; i--) {
        list.songs[i] = list.songs[i - 1];
      }
      list.songs[end] = temp;
    }
    this.setStateWithUpdatedList(list);
  }

  // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
  addMoveSongTransaction = (start, end) => {
    let transaction = new MoveSong_Transaction(this, start, end);
    this.tps.addTransaction(transaction);
  };
  addRemoveSongTransaction = () => {
    let transaction = new RemoveSong_Transaction(
      this,
      this.state.currentSong,
      this.state.currentList.songs[this.state.currentSong]
    );
    this.tps.addTransaction(transaction);
  };
  addEditSongTransaction = (index, newSong) => {
    let transaction = new EditSong_Transaction(
      this,
      index,
      this.state.currentList.songs[index],
      newSong
    );
    this.tps.addTransaction(transaction);
  };
  addAddSongTransaction = (song) => {
    let transaction = new AddSong_Transaction(this, song);
    this.tps.addTransaction(transaction);
  };

  // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
  undo = () => {
    if (this.tps.hasTransactionToUndo()) {
      this.tps.undoTransaction();

      // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
      this.db.mutationUpdateList(this.state.currentList);
    }
  };
  // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
  redo = () => {
    if (this.tps.hasTransactionToRedo()) {
      this.tps.doTransaction();

      // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
      this.db.mutationUpdateList(this.state.currentList);
    }
  };
  markListForDeletion = (keyPair) => {
    this.setState(
      (prevState) => ({
        currentList: prevState.currentList,
        listKeyPairMarkedForDeletion: keyPair,
        sessionData: prevState.sessionData,
      }),
      () => {
        // PROMPT THE USER
        this.showDeleteListModal();
      }
    );
  };

  markSongForEditing = (index) => {
    this.setState(
      (prevState) => ({
        ...prevState,
        currentSong: index,
      }),
      () => {
        this.showEditSongModal();
      }
    );
  };

  markSongForRemoval = (index) => {
    this.setState(
      (prevState) => ({
        ...prevState,
        currentSong: index,
      }),
      () => {
        this.showRemoveSongModal();
      }
    );
  };
  // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
  // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
  showDeleteListModal() {
    let modal = document.getElementById("delete-list-modal");
    modal.classList.add("is-visible");
  }
  // THIS FUNCTION IS FOR HIDING THE MODAL
  hideDeleteListModal() {
    let modal = document.getElementById("delete-list-modal");
    modal.classList.remove("is-visible");
  }

  showEditSongModal() {
    let modal = document.getElementById("edit-song-modal");
    modal.classList.add("is-visible");
  }

  hideEditSongModal() {
    let modal = document.getElementById("edit-song-modal");
    modal.classList.remove("is-visible");
  }

  showRemoveSongModal() {
    let modal = document.getElementById("remove-song-modal");
    modal.classList.add("is-visible");
  }

  hideRemoveSongModal() {
    let modal = document.getElementById("remove-song-modal");
    modal.classList.remove("is-visible");
  }

  canUndo = () => {
    return this.state.currentList && this.tps.hasTransactionToUndo();
  };

  canRedo = () => {
    return this.state.currentList && this.tps.hasTransactionToRedo();
  };

  render() {
    const canAddSong = () => this.state.currentList !== null;
    // const canUndo = ;
    // const canRedo = this.tps.hasTransactionToRedo;
    const canClose = () => this.state.currentList !== null;

    const handleKeyDown = (event) => {
      if (event.ctrlKey) {
        if (event.keyCode === 90) {
          if (this.tps.hasTransactionToUndo()) {
            this.undo();
          }
          event.preventDefault();
        } else if (event.keyCode === 89) {
          if (this.tps.hasTransactionToRedo()) {
            this.redo();
          }
        }
      }
    };

    return (
      <div id="root" onKeyDown={handleKeyDown}>
        <Banner />
        <SidebarHeading
          createNewListCallback={this.createNewList}
          canCreateNewList={this.state.currentList != null ? false : true}
        />
        <SidebarList
          currentList={this.state.currentList}
          keyNamePairs={this.state.sessionData.keyNamePairs}
          deleteListCallback={this.markListForDeletion}
          loadListCallback={this.loadList}
          renameListCallback={this.renameList}
        />
        <EditToolbar
          canAddSong={canAddSong}
          canUndo={this.canUndo}
          canRedo={this.canRedo}
          canClose={canClose}
          addSongCallback={() => this.addAddSongTransaction(defaultSong)}
          undoCallback={this.undo}
          redoCallback={this.redo}
          closeCallback={this.closeCurrentList}
        />
        <PlaylistCards
          currentList={this.state.currentList}
          moveSongCallback={this.addMoveSongTransaction}
          editSongCallback={this.markSongForEditing}
          removeSongCallback={this.markSongForRemoval}
        />
        <Statusbar currentList={this.state.currentList} />
        <DeleteListModal
          listKeyPair={this.state.listKeyPairMarkedForDeletion}
          hideDeleteListModalCallback={this.hideDeleteListModal}
          deleteListCallback={this.deleteMarkedList}
        />
        <EditSongModal
          song={
            this.state.currentSong == null || this.state.currentList == null
              ? defaultSong
              : this.state.currentList.songs[this.state.currentSong]
          }
          hideEditSongModalCallback={this.hideEditSongModal}
          editSongCallback={this.editCurrentSong}
        />

        <RemoveSongModal
          song={
            this.state.currentSong == null || this.state.currentList == null
              ? defaultSong
              : this.state.currentList.songs[this.state.currentSong]
          }
          hideRemoveSongModalCallback={this.hideRemoveSongModal}
          removeSongCallback={this.removeCurrentSong}
        />
      </div>
    );
  }
}

export default App;
