# vue-music

> Meowsic: a Web music player on mobile devices, developed by one of the most popular javaScript framework, [Vue.js](https://vuejs.org/).



<strong>Declaration</strong>: This is a course project. All the APIs used are obtained from open resources. It should be noted that project is only for learning purpose,  <strong>and can never be used or distributed for commercial or profitable purposes</strong>.



## 1. Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## 2. Preview

Online website: 👉 [MeowSic](http://lionust.tech/music)



## 3.  Technology Stack

- **Vue2.5**: To display the front webpages.
- **Vuex**:  To Share states between different components
- **vue-router**: For router switching.
- **axios**: A HTTP package based on `Promise`,  to send HTTP requests.
- **better-scroll**: A powerful package to defined pages that need scroll in mobile devices, such as smart phones.
- **vue-lazyload**: To load images in a "lazyload" way.
- **ES6**: Using the `es6` syntax like arrow function and Promise.
- **localStroage**: To locally store users' information, such as favorite songs and search history.
- **Stylus**: To preprocess CSS syntax in an easier and more efficient way.



## 4. Process Flow

- Design the basic style and functions.
- Configure routers and map those functions to **4** tabs: **recommend**, **Singers**, **rank lists**, and **search**, and each tab corresponds to one or more pages.


- Develop the **Recommend** page:
  - Develop `base-scroll` and `lazy-load` components that can be reused in other pages.
- Develop the **Singer** page:
  - Using `vuex` for states sharing.
  - Develop `player` and `playlist` components  with features  from `html5`. 
  - The music-player has functions such as playing/pausing music showing both straight and circle progress bars, fast forward/backward, switching songs, choosing random or sequential play mode, marking favorite songs, add songs to a playlist. 
  
  
- Develop the **Rank list** page.
- Develop the **Search** page:
  - Develop common components such as `search-box` (searching), `switch` (switching between different tabs) components.
  - Develop functional components such as `suggest-list` and `add-song` (adding songs to playlist).
  - Using **localStorage** to locally store the search histories.
  
  
- Other functions:
  - Develop the `user` components for displaying user's information like **favorite** and **recently**.
  
  
- Optimization:
  - Using **mixins** to store some common operations that can simplify codes.
  
  
- Build, pack and debug.
