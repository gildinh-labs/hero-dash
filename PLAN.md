# Hero Dash Roadmap
1. **MVP (done):** endless runner, procedural platforms/obstacles, jump/double jump/dash, 3 wishes with slow-mo, score + combo, localStorage best score, gems/gold gems, game over/restart, responsive + touch.
2. **Heroes (done, v1):** 6 heroes (Blaze Rush, Volt Step, Featherfall, Ironclad, Echo, Prism) with powers, XP/levels (+2% power per level, max +30%). Next: tune powers after beta, unlock costs, and ultimate abilities.
3. **Polish:** sound/music (with a mute toggle), sprite art and animations, parallax layers, pause menu, tutorial prompts, haptics, PWA/offline support, and accessibility options (reduced shake).
4. **Leaderboard:** Supabase (Postgres + RLS) or Firebase (Firestore) free tier. Add anonymous auth and a scores table (name, hero, score, ts). Validate scores server-side with an edge function and rate limiting, and add daily/all-time boards.
5. **Live ops:** daily challenges, cosmetics, analytics.
