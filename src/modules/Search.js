import axios from "axios"

class Search {
  // 1. Describe and create/initiate our object
  constructor() {
    // Initialize the object properties
    this.addSearchHTML() // Add search HTML to the DOM
    this.resultsDiv = document.querySelector("#search-overlay__results") // Reference to the search results div
    this.openButton = document.querySelectorAll(".js-search-trigger") // Reference to search open button(s)
    this.closeButton = document.querySelector(".search-overlay__close") // Reference to search close button
    this.searchOverlay = document.querySelector(".search-overlay") // Reference to the search overlay element
    this.searchField = document.querySelector("#search-term") // Reference to the search input field
    this.isOverlayOpen = false // Flag to track if search overlay is open
    this.isSpinnerVisible = false // Flag to track if the spinner/loader is visible
    this.previousValue // Variable to store the previous search term
    this.typingTimer // Timer for typing logic
    this.events() // Bind event listeners
  }

  // 2. Events
  events() {
    // Event listener for opening the search overlay
    this.openButton.forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault()
        this.openOverlay()
      })
    })

    // Event listener for closing the search overlay
    this.closeButton.addEventListener("click", () => this.closeOverlay())

    // Event listener for keyboard actions
    document.addEventListener("keydown", e => this.keyPressDispatcher(e))

    // Event listener for typing in the search field
    this.searchField.addEventListener("keyup", () => this.typingLogic())
  }

  // 3. Methods (functions, actions...)
  // Function to handle typing logic
  typingLogic() {
    // Check if the value of the search field has changed
    if (this.searchField.value != this.previousValue) {
      clearTimeout(this.typingTimer)

      // If the search field is not empty
      if (this.searchField.value) {
        if (!this.isSpinnerVisible) {
          // Show spinner/loader if not already visible
          this.resultsDiv.innerHTML = '<div class="spinner-loader"></div>'
          this.isSpinnerVisible = true
        }
        // Set a timeout to execute the search after a delay
        this.typingTimer = setTimeout(this.getResults.bind(this), 750)
      } else {
        // Clear results if search field is empty
        this.resultsDiv.innerHTML = ""
        this.isSpinnerVisible = false
      }
    }

    this.previousValue = this.searchField.value // Update the previous value
  }

  // Function to fetch search results
  async getResults() {
    try {
      const response = await axios.get(universityData.root_url + "/wp-json/university/v1/search?term=" + this.searchField.value)
      const results = response.data
      // Render search results HTML
      this.resultsDiv.innerHTML = `
        <div class="row">
          <!-- General Information Section -->
          <div class="one-third">
            <h2 class="search-overlay__section-title">General Information</h2>
            ${results.generalInfo.length ? '<ul class="link-list min-list">' : "<p>No general information matches that search.</p>"}
              ${results.generalInfo.map(item => `<li><a href="${item.permalink}">${item.title}</a> ${item.postType == "post" ? `by ${item.authorName}` : ""}</li>`).join("")}
            ${results.generalInfo.length ? "</ul>" : ""}
          </div>

          <!-- Programs Section -->
          <div class="one-third">
            <h2 class="search-overlay__section-title">Programs</h2>
            ${results.programs.length ? '<ul class="link-list min-list">' : `<p>No programs match that search. <a href="${universityData.root_url}/programs">View all programs</a></p>`}
              ${results.programs.map(item => `<li><a href="${item.permalink}">${item.title}</a></li>`).join("")}
            ${results.programs.length ? "</ul>" : ""}

            <!-- Professors Section -->
            <h2 class="search-overlay__section-title">Professors</h2>
            ${results.professors.length ? '<ul class="professor-cards">' : `<p>No professors match that search.</p>`}
              ${results.professors.map(item => `<li class="professor-card__list-item"><a class="professor-card" href="${item.permalink}"><img class="professor-card__image" src="${item.image}"><span class="professor-card__name">${item.title}</span></a></li>`).join("")}
            ${results.professors.length ? "</ul>" : ""}
          </div>

          <!-- Campuses Section -->
          <div class="one-third">
            <h2 class="search-overlay__section-title">Campuses</h2>
            ${results.campuses.length ? '<ul class="link-list min-list">' : `<p>No campuses match that search. <a href="${universityData.root_url}/campuses">View all campuses</a></p>`}
              ${results.campuses.map(item => `<li><a href="${item.permalink}">${item.title}</a></li>`).join("")}
            ${results.campuses.length ? "</ul>" : ""}

            <!-- Events Section -->
            <h2 class="search-overlay__section-title">Events</h2>
            ${results.events.length ? "" : `<p>No events match that search. <a href="${universityData.root_url}/events">View all events</a></p>`}
              ${results.events.map(item => `<div class="event-summary"><a class="event-summary__date t-center" href="${item.permalink}"><span class="event-summary__month">${item.month}</span><span class="event-summary__day">${item.day}</span></a><div class="event-summary__content"><h5 class="event-summary__title headline headline--tiny"><a href="${item.permalink}">${item.title}</a></h5><p>${item.description} <a href="${item.permalink}" class="nu gray">Learn more</a></p></div></div>`).join("")}
          </div>
        </div>
      `
      this.isSpinnerVisible = false // Hide spinner/loader after rendering results
    } catch (e) {
      console.log(e) // Log any errors
    }
  }

  // Function to dispatch key presses
  keyPressDispatcher(e) {
    // Open search overlay when 'S' key is pressed and overlay is not already open and input/textarea is not focused
    if (e.keyCode == 83 && !this.isOverlayOpen && document.activeElement.tagName != "INPUT" && document.activeElement.tagName != "TEXTAREA") {
      this.openOverlay()
    }

    // Close search overlay when 'Esc' key is pressed and overlay is open
    if (e.keyCode == 27 && this.isOverlayOpen) {
      this.closeOverlay()
    }
  }

  // Function to open the search overlay
  openOverlay() {
    // Add class to show search overlay
    this.searchOverlay.classList.add("search-overlay--active")
    document.body.classList.add("body-no-scroll") // Add class to body to disable scrolling
    this.searchField.value = "" // Clear search field
    setTimeout(() => this.searchField.focus(), 301) // Focus on search field after a short delay
    console.log("our open method just ran!") // Log that the open method ran
    this.isOverlayOpen = true // Set overlay open flag
    return false
  }

  // Function to close the search overlay
  closeOverlay() {
    // Remove class to hide search overlay
    this.searchOverlay.classList.remove("search-overlay--active")
    document.body.classList.remove("body-no-scroll") // Remove class to enable scrolling
    console.log("our close method just ran!") // Log that the close method ran
    this.isOverlayOpen = false // Set overlay close flag
  }

  // Function to add search HTML to the DOM
  addSearchHTML() {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="search-overlay">
        <div class="search-overlay__top">
          <div class="container">
            <i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
            <input type="text" class="search-term" placeholder="What are you looking for?" id="search-term">
            <i class="fa fa-window-close search-overlay__close" aria-hidden="true"></i>
          </div>
        </div>
        
        <div class="container">
          <div id="search-overlay__results"></div>
        </div>

      </div>
    `
    )
  }
}

export default Search
