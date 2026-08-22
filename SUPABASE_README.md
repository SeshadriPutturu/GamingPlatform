# Supabase setup

Run `supabase_schema.sql` in the Supabase SQL Editor. It creates or upgrades `games`, `members`, and `rounds`, including INSERT/SELECT/UPDATE/DELETE policies required by Save, Load, Undo, and Delete.

The application uses only these member columns for loading: `id`, `name`, `total`, `eliminated`. It does **not** query `members.created_at`, so an old schema will not cause the previous `column members.created_at does not exist` history error.
