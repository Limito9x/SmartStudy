// One-time cleanup after migrating from scope-based sync + graph embedding.
DROP INDEX task_vector_idx IF EXISTS;

MATCH (t:Task)
REMOVE t.embedding, t.course_pg_id, t.routine_pg_id;

MATCH (r:Routine)
REMOVE r.course_pg_id;

MATCH (c:Course)
REMOVE c.study_plan_pg_id, c.color;

MATCH (l:Log)
REMOVE l.task_pg_id;

MATCH (u:User)
REMOVE u.email;
