// ---- Recommendation engine (pure functions, no DOM) ----
const Engine = {
  ALL_GENRES(movies){ return [...new Set(movies.flatMap(m=>m.g))].sort(); },

  filter(movies, {genres=new Set(), moodTags=null, query=""} = {}){
    return movies.filter(m=>{
      if(genres.size && !m.g.some(g=>genres.has(g))) return false;
      if(moodTags && !m.tags.some(t=>moodTags.includes(t))) return false;
      if(query){
        const q = query.toLowerCase();
        if(!(m.t.toLowerCase().includes(q) || m.dir.toLowerCase().includes(q) || m.tags.some(t=>t.includes(q)))) return false;
      }
      return true;
    });
  },

  // similarity score between a candidate movie and a liked-movie set
  scoreAgainst(candidate, likedMovies){
    let score = 0;
    likedMovies.forEach(lm=>{
      if(lm.t === candidate.t) return;
      candidate.g.forEach(g=>{ if(lm.g.includes(g)) score += 2; });
      candidate.tags.forEach(tag=>{ if(lm.tags.includes(tag)) score += 3; });
    });
    return score;
  },

  recommendFor(movies, likedTitles, limit=4){
    const likedMovies = movies.filter(m=>likedTitles.has(m.t));
    if(!likedMovies.length) return [];
    return movies
      .filter(m=>!likedTitles.has(m.t))
      .map(m=>({movie:m, score:this.scoreAgainst(m, likedMovies)}))
      .filter(x=>x.score>0)
      .sort((a,b)=> b.score-a.score || b.movie.r-a.movie.r)
      .slice(0, limit)
      .map(x=>x.movie);
  },

  similarTo(movies, target, limit=5){
    return movies
      .filter(m=>m.t!==target.t)
      .map(m=>({movie:m, score:this.scoreAgainst(m, [target])}))
      .filter(x=>x.score>0)
      .sort((a,b)=> b.score-a.score || b.movie.r-a.movie.r)
      .slice(0, limit)
      .map(x=>x.movie);
  }
};
