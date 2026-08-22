# Score Keeper Pro

A responsive score/game platform for multi-player games where the **lowest total score wins** and a configured maximum score ends the game.

## Features
- Add/remove players before a game starts
- Quick multi-player setup
- Maximum-score configuration
- Round-by-round score entry mapped to the correct player name
- Automatic totals and ranking
- Automatic game end when a player reaches the maximum score
- Winner/tie calculation using the lowest score
- Undo last round
- End game, reset and start a new game
- Save/update games in Supabase
- Load saved games
- Delete saved games with child records cleaned up first
- Paginated game history
- LocalStorage persistence across browser refreshes
- Local history backup when Supabase is unavailable
- Responsive desktop/tablet/mobile UI
- Email/password registration and login with Supabase Auth

## Supabase
1. Open Supabase SQL Editor.
2. Run `supabase_schema.sql`.
3. Put your URL and anon key in `config.js`.
4. In Supabase Authentication settings, configure email confirmation and your site URL as needed.
5. Run the updated `supabase_schema.sql` to add user-owned games and RLS policies. Existing games without an owner will no longer be visible after the migration.

The migration is safe for an existing database and specifically adds `members.created_at` if an older installation is missing it. The application itself does not depend on `members.created_at` for history ordering.

The app uses Supabase Auth for email/password accounts. Games are scoped to the signed-in user through RLS; localStorage remains available only when Supabase is not configured.
