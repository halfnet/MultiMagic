# Database Schema - Math Game Application

[users]
+---------------+---------+----------+
| Column | Type | Notes |
+---------------+---------+----------+
| id | integer | PK |
| username | text | UNIQUE |
| last_login_at| text | NOT NULL |
| theme_color | text | DEFAULT |
+---------------+---------+----------+
^
|
| 1:N
|
[game_results]
+-------------------+---------+----------+
| Column | Type | Notes |
+-------------------+---------+----------+
| id | integer | PK |
| game_id | text | UNIQUE |
| user_id | integer | FK->users|
| difficulty | text | NOT NULL |
| mode | text | NOT NULL |
| practice_digit | integer | NULL OK |
| questions_count | integer | NOT NULL |
| correct_answers | integer | NOT NULL |
| time_taken_in_ms | integer | NOT NULL |
| best_streak | integer | NOT NULL |
| incorrect_attempts| integer | NOT NULL |
| created_at | text | NOT NULL |
+-------------------+---------+----------+
^
|
| 1:N
|
[game_question_results]
+----------------+---------+---------------+
| Column | Type | Notes |
+----------------+---------+---------------+
| id | integer | PK |
| game_id | text | FK->game_res |
| user_id | integer | FK->users |
| question_number| integer | NOT NULL |
| num1 | integer | NOT NULL |
| num2 | integer | NOT NULL |
| attempts | integer | NOT NULL |
| time_to_solve_ms| integer| NOT NULL |
| created_at | text | NOT NULL |
+----------------+---------+---------------+

## Relationships

1. One user can have many game_results (1:N)

   - `users.id` -> `game_results.user_id`

2. One game_result can have many game_question_results (1:N)

   - `game_results.game_id` -> `game_question_results.game_id`

3. Each game_question_result is also associated with a user (1:N)
   - `users.id` -> `game_question_results.user_id`

## Notes

- All timestamp fields (`created_at`, `last_login_at`) are stored as text with `CURRENT_TIMESTAMP` default
- `game_id` is used as the unique identifier for linking game results with their question results
- User relationships are maintained throughout for data integrity and querying flexibility
- `theme_color` has a default value of '#7c3aed'
