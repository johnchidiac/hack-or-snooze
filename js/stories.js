"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  if (currentUser) {
    getFavoritesFromLocalStorage();
  }
  putStoriesOnPage();
}

function getFavoriteStatus(storyId) {
  console.debug("getFavoriteStatus", storyId);
  if (!currentUser.favorites) {
    return false;
  }
  return currentUser.favorites.some((favorite) => favorite.storyId === storyId);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

const userMarkup = (story) => {
  if (!currentUser) {
    return "";
  } else {
    const star = getFavoriteStatus(story.storyId) ? "fa-solid" : "fa-regular";
    return `
      <a href="#"><i class="${star} fa-star"></i></a>
      <a href="#"><i class="fa-regular fa-trash-can"></i></a>
      `;
  }
};

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story, typeof story);

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
        ${userMarkup(story)}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $allStoriesList.empty();

  if (currentUser.favorites.length === 0) {
    $allStoriesList.append(`<p>No stories favorited by this user yet!`);
  } else {
    currentUser.favorites = currentUser.favorites.map((fav) => new Story(fav));

    // loop through all of our stories and generate HTML for them
    for (let favorite of currentUser.favorites) {
      const $favorite = generateStoryMarkup(favorite);
      $allStoriesList.append($favorite);
    }
  }
  $allStoriesList.show();
}

function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");

  $allStoriesList.empty();

  if (currentUser.ownStories.length === 0) {
    $allStoriesList.append(`<p>No stories saved by this user yet!`);
  } else {
    currentUser.ownStories = currentUser.ownStories.map(
      (story) => new Story(story)
    );

    // loop through all of our stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story);
      $allStoriesList.append($story);
    }
  }
  $allStoriesList.show();
}

/** Submit story */
async function submitStory(evt) {
  console.debug("submit story");
  evt.preventDefault();

  const title = $("#story-title").val();
  const author = $("#author-name").val();
  const storyUrl = $("#story-url").val();

  const args = [currentUser, title, author, storyUrl];

  const newStory = await storyList.addStory(...args);
  updateUIOnStorySubmit();

  $storyForm.trigger("reset");
}

$storyForm.on("submit", submitStory);

function updateUIOnStorySubmit() {
  console.debug("updateUIOnStorySubmit");
  $storyForm.hide();
  getAndShowStoriesOnStart();
}
