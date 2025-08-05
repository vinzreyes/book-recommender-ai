const { createApp } = Vue;

createApp({
  data() {
    return {
      type: 'movie', // 'book' or 'movie'
      tab: 'genre',
      topic: '',
      results: [],
      loading: false,
      error: null,
      searched: false,
      displayedGenreTags: [],
      tabs: [
        { key: 'similar', label: '🔁 Similar To' },
        { key: 'genre', label: '📚 Genre Preferences' },
        { key: 'mood', label: '🎭 Current Mood' },
        { key: 'explore', label: '🧭 Explore' }
      ],
      allGenreTags: [
        "Epic fantasy with political intrigue",
        "Psychological thrillers with twists",
        "Historical fiction with strong heroines",
        "Techno-thrillers involving AI and ethics",
        "Feel-good romance in small towns",
        "Science fiction with alien civilizations",
        "Memoirs by thought leaders",
        "Satirical comedy with serious undertones",
        "Literary fiction exploring grief and healing",
        "Adventure novels in forgotten worlds",
        "Mythological retellings from fresh perspectives",
        "Dystopian futures with rebellious protagonists",
        "Dark academia with secrets and symbolism",
        "Queer romance in speculative settings",
        "Cultural identity and generational conflict",
        "Time travel stories with paradoxes",
        "Noir crime in retro-futuristic cities",
        "Stories with morally gray characters",
        "Eco-fiction with climate activism",
        "Mysteries set in rural landscapes",
        "Fantasy with animal protagonists",
        "Post-colonial narratives and resistance",
        "Stories with unreliable narrators",
        "Magical realism in everyday life",
        "Cyberpunk with philosophical depth",
        "Gothic horror in modern settings",
        "Coming-of-age tales with supernatural twists",
        "Sci-fi political thrillers",
        "Alternate history with real-world changes",
        "Blending poetry and prose in storytelling"
      ],
      allRandomTopics: [
        "Cyberpunk societies in digital dystopias",
        "Deep sea adventures uncovering lost civilizations",
        "Parallel universes and interdimensional travel",
        "Post-apocalyptic survival with found families",
        "Ancient mythology retold through feminist lenses",
        "Corporate espionage thrillers in big tech",
        "Virtual reality that blurs reality",
        "Steampunk inventions in Victorian London",
        "Philosophical space operas",
        "Alien first contact scenarios",
        "Time loop mysteries in suburban towns",
        "Witchcraft in modern city life",
        "Dreams within dreams",
        "Underdog sports teams and emotional victories",
        "Ghost stories from non-Western cultures",
        "Political satire in near-future democracies",
        "AI developing emotions and identity",
        "Lost libraries and bookish mysteries",
        "Explorers discovering dangerous relics",
        "Roguelike stories with repeating lives",
        "Psychic detectives solving mind crimes",
        "Road trip stories with existential questions",
        "Teen rebels fighting media control",
        "Secret societies guarding magical knowledge",
        "Fourth wall-breaking narratives",
        "Stories set entirely in one room",
        "Folklore-inspired fantasy",
        "Eco-thrillers in melting Arctic zones",
        "Technomancers in AI-run dystopias",
        "Cozy mysteries in bookstores or cafes"
      ],
      omdbApiKey: "77f625fd" // Replace with your OMDb key
    };
  },
  mounted() {
    this.displayedGenreTags = this.shuffleArray(this.allGenreTags).slice(0, 5);
  },
  methods: {
    switchTab(newTab) {
      this.tab = newTab;
      this.topic = '';
      this.results = [];
      this.error = null;
      this.searched = false;
      if (newTab === 'genre') {
        this.displayedGenreTags = this.shuffleArray(this.allGenreTags).slice(0, 5);
      }
    },
    generateRandomTopic() {
      this.topic = this.shuffleArray(this.allRandomTopics)[0];
    },
    shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    async getRecommendations() {
      this.results = [];
      this.error = null;
      this.loading = true;
      this.searched = true;

      if (!this.topic.trim()) {
        this.error = "Please enter or select a topic.";
        this.loading = false;
        return;
      }

      try {
        if (this.type === 'book') {
          await this.fetchBooks();
        } else {
          await this.fetchMovies();
        }
      } catch (err) {
        console.error(err);
        this.error = "Something went wrong. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    async fetchBooks() {
      const startIndex = Math.floor(Math.random() * 30);
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(this.topic)}&maxResults=10&startIndex=${startIndex}`
      );
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        this.results = [];
      } else {
        this.results = this.shuffleArray(
          data.items.map(item => ({
            id: item.id,
            title: item.volumeInfo.title || "Untitled",
            creators: item.volumeInfo.authors ? item.volumeInfo.authors.join(", ") : "Unknown author",
            year: item.volumeInfo.publishedDate || "",
            plot: item.volumeInfo.description || "",
            poster: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : null,
            link: item.volumeInfo.infoLink || "#"
          }))
        ).slice(0, 5);
      }
    },
    async fetchMovies() {
      // Convert long preference to keywords
      let keywords = this.topic
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(" ")
        .filter(word => word.length > 3);

      if (keywords.length === 0) {
        keywords = [this.topic];
      }

      // Try with first keyword
      let searchTerm = keywords[0];
      let searchResponse = await fetch(
        `https://www.omdbapi.com/?apikey=${this.omdbApiKey}&s=${encodeURIComponent(searchTerm)}&type=movie`
      );
      let searchData = await searchResponse.json();

      // Fallback to genre keyword if no results
      if (!searchData.Search || searchData.Search.length === 0) {
        const fallbackGenres = ["mystery", "thriller", "drama", "adventure", "romance", "fantasy", "sci-fi"];
        const fallbackTerm = fallbackGenres.find(g => this.topic.toLowerCase().includes(g)) || "drama";
        searchResponse = await fetch(
          `https://www.omdbapi.com/?apikey=${this.omdbApiKey}&s=${encodeURIComponent(fallbackTerm)}&type=movie`
        );
        searchData = await searchResponse.json();
      }

      if (!searchData.Search || searchData.Search.length === 0) {
        this.results = [];
        return;
      }

      // Fetch details for top 5 results
      const detailedResults = await Promise.all(
        searchData.Search.slice(0, 5).map(async (movie) => {
          const detailResponse = await fetch(
            `https://www.omdbapi.com/?apikey=${this.omdbApiKey}&i=${movie.imdbID}&plot=short`
          );
          const detailData = await detailResponse.json();
          return {
            id: movie.imdbID,
            title: detailData.Title || "Untitled",
            creators: `Cast: ${detailData.Actors || "Unknown"}`,
            year: detailData.Year || "",
            plot: detailData.Plot || "",
            poster: detailData.Poster !== "N/A" ? detailData.Poster : null,
            link: `https://www.imdb.com/title/${movie.imdbID}`
          };
        })
      );

      this.results = detailedResults;
    }
  }
}).mount("#app");
