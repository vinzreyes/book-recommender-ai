const { createApp } = Vue;

createApp({
  data() {
    return {
      tab: 'genre',
      topic: '',
      books: [],
      loading: false,
      error: null,
      searched: false,
      displayedGenreTags: [],
      tabs: [
        { key: 'similar', label: '🔁 Similar Books' },
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
        "Books with morally gray characters",
        "Eco-fiction with climate activism",
        "Mysteries set in rural landscapes",
        "Fantasy with animal protagonists",
        "Post-colonial narratives and resistance",
        "Books with unreliable narrators",
        "Magical realism in everyday life",
        "Cyberpunk with philosophical depth",
        "Gothic horror in modern settings",
        "Coming-of-age tales with supernatural twists",
        "Sci-fi political thrillers",
        "Alternate history with real-world changes",
        "Books that blend poetry and prose"
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
        "Books about dreams within dreams",
        "Underdog sports teams and emotional victories",
        "Ghost stories from non-Western cultures",
        "Political satire in near-future democracies",
        "AI developing emotions and identity",
        "Lost libraries and bookish mysteries",
        "Explorers discovering dangerous relics",
        "Roguelike stories with repeating lives",
        "Psychic detectives solving mind crimes",
        "Road trip novels with existential questions",
        "Teen rebels fighting media control",
        "Secret societies guarding magical knowledge",
        "Books with fourth wall-breaking narrators",
        "Stories set entirely in one room",
        "Fantasy inspired by folklore and oral tradition",
        "Eco-thrillers set in melting Arctic zones",
        "Technomancers in AI-run dystopias",
        "Cozy mysteries set in bookstores or cafes"
      ]
    };
  },
  mounted() {
    this.displayedGenreTags = this.shuffleArray(this.allGenreTags).slice(0, 5);
  },
  methods: {
    switchTab(newTab) {
      this.tab = newTab;
      this.topic = '';
      this.books = [];
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
    async getBooks() {
      this.books = [];
      this.error = null;
      this.loading = true;
      this.searched = true;

      if (!this.topic.trim()) {
        this.error = "Please enter or select a topic.";
        this.loading = false;
        return;
      }

      try {
        const startIndex = Math.floor(Math.random() * 30);
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(this.topic)}&maxResults=10&startIndex=${startIndex}`
        );
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
          this.books = [];
        } else {
          this.books = this.shuffleArray(
            data.items.map(item => ({
              id: item.id,
              title: item.volumeInfo.title || "Untitled",
              authors: item.volumeInfo.authors ? item.volumeInfo.authors.join(", ") : "Unknown author",
              link: item.volumeInfo.infoLink || "#"
            }))
          ).slice(0, 5);
        }
      } catch (err) {
        this.error = "Something went wrong. Please try again.";
      } finally {
        this.loading = false;
      }
    }
  }
}).mount("#app");
