import axios from "axios";

class MyNotes {
  constructor() {
    // Check if the element with id "my-notes" exists in the DOM
    if (document.querySelector("#my-notes")) {
      // Set default headers for Axios requests
      axios.defaults.headers.common["X-WP-Nonce"] = universityData.nonce;
      // Get the element with id "my-notes"
      this.myNotes = document.querySelector("#my-notes");
      // Attach event listeners
      this.events();
    }
  }

  events() {
    // Add event listener for clicks on the "#my-notes" element
    this.myNotes.addEventListener("click", e => this.clickHandler(e));
    // Add event listener for clicks on the ".submit-note" element
    document.querySelector(".submit-note").addEventListener("click", () => this.createNote());
  }

  clickHandler(e) {
    // Determine which action to perform based on the clicked element's class
    if (e.target.classList.contains("delete-note") || e.target.classList.contains("fa-trash-o")) 
      this.deleteNote(e);
    if (e.target.classList.contains("edit-note") || e.target.classList.contains("fa-pencil") || e.target.classList.contains("fa-times")) 
      this.editNote(e);
    if (e.target.classList.contains("update-note") || e.target.classList.contains("fa-arrow-right")) 
      this.updateNote(e);
  }

  findNearestParentLi(el) {
    // Find the nearest parent element with tag name "LI"
    let thisNote = el;
    while (thisNote.tagName != "LI") {
      thisNote = thisNote.parentElement;
    }
    return thisNote;
  }

  // Methods will go here

  editNote(e) {
    // Find the nearest parent list item
    const thisNote = this.findNearestParentLi(e.target);
    // Toggle between editable and read-only mode
    if (thisNote.getAttribute("data-state") == "editable") {
      this.makeNoteReadOnly(thisNote);
    } else {
      this.makeNoteEditable(thisNote);
    }
  }

  makeNoteEditable(thisNote) {
    // Make the note fields editable
    thisNote.querySelector(".edit-note").innerHTML = '<i class="fa fa-times" aria-hidden="true"></i> Cancel';
    thisNote.querySelector(".note-title-field").removeAttribute("readonly");
    thisNote.querySelector(".note-body-field").removeAttribute("readonly");
    thisNote.querySelector(".note-title-field").classList.add("note-active-field");
    thisNote.querySelector(".note-body-field").classList.add("note-active-field");
    thisNote.querySelector(".update-note").classList.add("update-note--visible");
    thisNote.setAttribute("data-state", "editable");
  }

  makeNoteReadOnly(thisNote) {
    // Make the note fields read-only
    thisNote.querySelector(".edit-note").innerHTML = '<i class="fa fa-pencil" aria-hidden="true"></i> Edit';
    thisNote.querySelector(".note-title-field").setAttribute("readonly", "true");
    thisNote.querySelector(".note-body-field").setAttribute("readonly", "true");
    thisNote.querySelector(".note-title-field").classList.remove("note-active-field");
    thisNote.querySelector(".note-body-field").classList.remove("note-active-field");
    thisNote.querySelector(".update-note").classList.remove("update-note--visible");
    thisNote.setAttribute("data-state", "cancel");
  }

  async deleteNote(e) {
    // Find the nearest parent list item
    const thisNote = this.findNearestParentLi(e.target);

    try {
      // Send a delete request to the server
      const response = await axios.delete(universityData.root_url + "/wp-json/wp/v2/note/" + thisNote.getAttribute("data-id"));
      // Fade out and remove the note from the DOM
      thisNote.style.height = `${thisNote.offsetHeight}px`;
      setTimeout(function () {
        thisNote.classList.add("fade-out");
      }, 20);
      setTimeout(function () {
        thisNote.remove();
      }, 401);
      // Update UI if necessary
      if (response.data.userNoteCount < 5) {
        document.querySelector(".note-limit-message").classList.remove("active");
      }
    } catch (e) {
      console.log("Sorry");
    }
  }

  async updateNote(e) {
    // Find the nearest parent list item
    const thisNote = this.findNearestParentLi(e.target);

    // Prepare updated note data
    var ourUpdatedPost = {
      "title": thisNote.querySelector(".note-title-field").value,
      "content": thisNote.querySelector(".note-body-field").value
    };

    try {
      // Send a post request to update the note
      const response = await axios.post(universityData.root_url + "/wp-json/wp/v2/note/" + thisNote.getAttribute("data-id"), ourUpdatedPost);
      // Make the note read-only after update
      this.makeNoteReadOnly(thisNote);
    } catch (e) {
      console.log("Sorry");
    }
  }

  async createNote() {
    // Prepare data for creating a new note
    var ourNewPost = {
      "title": document.querySelector(".new-note-title").value,
      "content": document.querySelector(".new-note-body").value,
      "status": "publish"
    };

    try {
      // Send a post request to create a new note
      const response = await axios.post(universityData.root_url + "/wp-json/wp/v2/note/", ourNewPost);

      // Handle the response
      if (response.data != "You have reached your note limit.") {
        // Clear input fields
        document.querySelector(".new-note-title").value = "";
        document.querySelector(".new-note-body").value = "";
        // Add the new note to the DOM
        document.querySelector("#my-notes").insertAdjacentHTML(
          "afterbegin",
          ` <li data-id="${response.data.id}" class="fade-in-calc">
            <input readonly class="note-title-field" value="${response.data.title.raw}">
            <span class="edit-note"><i class="fa fa-pencil" aria-hidden="true"></i> Edit</span>
            <span class="delete-note"><i class="fa fa-trash-o" aria-hidden="true"></i> Delete</span>
            <textarea readonly class="note-body-field">${response.data.content.raw}</textarea>
            <span class="update-note btn btn--blue btn--small"><i class="fa fa-arrow-right" aria-hidden="true"></i> Save</span>
          </li>`
        );

        // Make the new note visible with animation
        let finalHeight;
        let newlyCreated = document.querySelector("#my-notes li");
        setTimeout(function () {
          finalHeight = `${newlyCreated.offsetHeight}px`;
          newlyCreated.style.height = "0px";
        }, 30);
        setTimeout(function () {
          newlyCreated.classList.remove("fade-in-calc");
          newlyCreated.style.height = finalHeight;
        }, 50);
        setTimeout(function () {
          newlyCreated.style.removeProperty("height");
        }, 450);
      } else {
        // Show note limit message
        document.querySelector(".note-limit-message").classList.add("active");
      }
    } catch (e) {
      console.error(e);
    }
  }
}

export default MyNotes;
