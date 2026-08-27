-- Custom SQL migration file, put your code below! --
UPDATE users
SET
    unbanned_by = NULL,
    unbanned_at = NULL,
    unbanned_reason = NULL
WHERE unbanned_by = 'unbanned_by'
  AND unbanned_at = 'unbanned_at'
  AND unbanned_reason = 'unbanned_reason';