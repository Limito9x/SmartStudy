import json
from datetime import date, datetime, time, timedelta
import httpx
from langchain.tools import tool

from core.database_services import get_vector_store
from core.config import DOTNET_INTERNAL_API_BASE_URL, INTERNAL_SERVICE_KEY, logger
from services.graph_service import run_cypher


async def _vector_search(query: str, asset_ids: list[str]) -> str:
    """
    Tìm kiếm thông tin trong tài liệu học tập bằng semantic search.
    Dùng cho lý thuyết tĩnh (PDF/document), không dùng cho dữ liệu task động.
    """
    asset_ids = [str(asset_id) for asset_id in asset_ids if asset_id is not None]
    logger.debug("Vector search query=%s asset_ids=%s", query, asset_ids)
    vector_store = await get_vector_store()
    retriever = vector_store.as_retriever(
        search_kwargs={
            "k": 5,
            "filter": {"asset_id": {"$in": asset_ids}}
        }
    )
    docs = await retriever.ainvoke(query)
    if not docs:
        return "Không tìm thấy thông tin liên quan trong tài liệu."

    results = []
    for d in docs:
        page = d.metadata.get("page_number", "?")
        results.append(f"[Trang {page}]\n{d.page_content}")
    return "\n\n---\n\n".join(results)


def _format_tool_json(tool_name: str, summary: str, records: list[dict]) -> str:
    def _json_default(value):
        if isinstance(value, (datetime, date, time)):
            return value.isoformat()
        if isinstance(value, timedelta):
            return value.total_seconds()

        # Neo4j temporal objects provide iso_format().
        iso_format = getattr(value, "iso_format", None)
        if callable(iso_format):
            return iso_format()

        return str(value)

    return json.dumps(
        {
            "tool": tool_name,
            "summary": summary,
            "records": records,
        },
        ensure_ascii=False,
        default=_json_default,
    )


async def _get_course_progress_from_internal_api(user_id: int, course_id: int, include_inactive: bool = False) -> dict | None:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{DOTNET_INTERNAL_API_BASE_URL}/api/internal/progress/course",
                params={
                    "userId": user_id,
                    "courseId": course_id,
                    "includeInactive": str(include_inactive).lower(),
                },
                headers={"X-Internal-Service-Key": INTERNAL_SERVICE_KEY},
                timeout=5.0,
            )

            if response.status_code == 200:
                return response.json()

            if response.status_code == 404:
                return None

            logger.warning("Internal progress API returned non-success status: %s", response.status_code)
            return None
    except Exception as exc:
        logger.error("Failed to call internal progress API: %s", exc)
        return None


async def _get_calendar_context_from_internal_api(
    user_id: int,
    course_id: int | None,
    horizon_days: int = 14,
) -> dict | None:
    params: dict[str, str | int] = {
        "userId": user_id,
        "horizonDays": horizon_days,
    }
    if course_id is not None:
        params["courseId"] = course_id

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{DOTNET_INTERNAL_API_BASE_URL}/api/internal/calendar/context",
                params=params,
                headers={"X-Internal-Service-Key": INTERNAL_SERVICE_KEY},
                timeout=8.0,
            )

            if response.status_code == 200:
                return response.json()

            if response.status_code == 404:
                return None

            logger.warning("Internal calendar context API returned non-success status: %s", response.status_code)
            return None
    except Exception as exc:
        logger.error("Failed to call internal calendar context API: %s", exc)
        return None


async def _get_phase_preview_from_internal_api(
    user_id: int,
    course_id: int,
    horizon_days: int = 14,
    learning_goal: str | None = None,
) -> dict | None:
    payload: dict[str, int | str] = {
        "userId": user_id,
        "courseId": course_id,
        "horizonDays": horizon_days,
    }
    if learning_goal and learning_goal.strip():
        payload["learningGoal"] = learning_goal.strip()

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{DOTNET_INTERNAL_API_BASE_URL}/api/internal/phase/preview",
                json=payload,
                headers={"X-Internal-Service-Key": INTERNAL_SERVICE_KEY},
                timeout=10.0,
            )

            if response.status_code == 200:
                return response.json()

            if response.status_code == 404:
                return None

            logger.warning("Internal phase preview API returned non-success status: %s", response.status_code)
            return None
    except Exception as exc:
        logger.error("Failed to call internal phase preview API: %s", exc)
        return None


def build_tools(asset_ids: list[str] | None, user_id: int, course_id: int | None) -> list:
    asset_ids = asset_ids or []

    @tool
    async def get_upcoming_tasks(user_id: int = user_id, course_id: int | None = course_id) -> str:
        """
        Lấy danh sách task sắp tới của user theo đồ thị học tập.
        Dùng khi user hỏi việc cần làm, deadline, hoặc lịch học sắp tới.
        """
        query = """
        MATCH (u:User {pg_id: $user_pg_id})-[:OWNS_PLAN]->(sp:StudyPlan)-[:HAS_COURSE]->(c:Course)-[:HAS_PHASE]->(:Phase)-[:CONTAINS]->(t:Task)
        WHERE sp.status = 'Active'
          AND c.status = 'Enrolled'
          AND ($course_pg_id IS NULL OR c.pg_id = $course_pg_id)
          AND coalesce(t.status, '') <> 'Completed'
        RETURN t.pg_id AS task_id,
               t.name AS task_name,
               t.status AS status,
               t.type AS task_type,
               t.start_datetime AS start_datetime,
               t.end_datetime AS end_datetime,
               c.pg_id AS course_id,
               c.name AS course_name
        ORDER BY coalesce(t.start_datetime, datetime('9999-12-31T00:00:00Z')) ASC
        LIMIT 20
        """

        records = run_cypher(query, {"user_pg_id": str(user_id), "course_pg_id": str(course_id) if course_id is not None else None})
        summary = (
            f"Tìm thấy {len(records)} task chưa hoàn thành gần nhất."
            if records
            else "Không có task pending nào trong graph."
        )
        return _format_tool_json("get_upcoming_tasks", summary, records)

    @tool
    async def get_learning_progress(user_id: int = user_id, course_id: int | None = course_id) -> str:
        """
        Tổng hợp tiến độ học tập của user trong một course cụ thể.
        Dùng khi user hỏi % hoàn thành, số task xong/chưa xong trong môn.
        """
        if course_id is None:
            return _format_tool_json(
                "get_learning_progress",
                "Thiếu course_id để tính tiến độ học tập.",
                [],
            )

        internal_progress = await _get_course_progress_from_internal_api(user_id, course_id, include_inactive=False)
        if internal_progress:
            total_tasks = int(internal_progress.get("totalExpectations") or 0)
            completed_tasks = int(internal_progress.get("totalCompletions") or 0)
            progress_percent = float(internal_progress.get("progress") or 0.0)
            total_logged_duration = float(internal_progress.get("totalLoggedDuration") or 0.0)

            record = {
                "course_id": internal_progress.get("courseId"),
                "course_name": internal_progress.get("courseName"),
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "progress_percent": progress_percent,
                "total_logged_duration": total_logged_duration,
                "source": "internal_api",
            }

            summary = (
                f"Tiến độ hiện tại {progress_percent}% ({completed_tasks}/{total_tasks} task hoàn thành), "
                f"tổng thời lượng log {total_logged_duration}."
            )
            return _format_tool_json("get_learning_progress", summary, [record])

        task_progress_query = """
        MATCH (u:User {pg_id: $user_pg_id})-[:OWNS_PLAN]->(sp:StudyPlan {status: 'Active'})-[:HAS_COURSE]->(c:Course {pg_id: $course_pg_id, status: 'Enrolled'})
        OPTIONAL MATCH (c)-[:HAS_PHASE]->(:Phase)-[:CONTAINS]->(t:Task)
        RETURN c.pg_id AS course_id,
               c.name AS course_name,
               count(t) AS total_tasks,
               count(CASE WHEN t.status = 'Completed' THEN 1 END) AS completed_tasks
        """

        duration_query = """
    MATCH (u:User {pg_id: $user_pg_id})-[:OWNS_PLAN]->(sp:StudyPlan {status: 'Active'})-[:HAS_COURSE]->(c:Course {pg_id: $course_pg_id, status: 'Enrolled'})
        OPTIONAL MATCH (c)-[:HAS_PHASE]->(:Phase)-[:CONTAINS]->(:Task)-[:HAS_LOG]->(l:Log)
        RETURN round(coalesce(sum(toFloat(l.actual_duration)), 0.0), 2) AS total_logged_duration
        """

        params = {"user_pg_id": str(user_id), "course_pg_id": str(course_id)}
        progress_rows = run_cypher(task_progress_query, params)
        duration_rows = run_cypher(duration_query, params)

        if not progress_rows:
            return _format_tool_json(
                "get_learning_progress",
                "Không tìm thấy course trong phạm vi user hoặc chưa có dữ liệu graph.",
                [],
            )

        row = progress_rows[0]
        total_tasks = int(row.get("total_tasks") or 0)
        completed_tasks = int(row.get("completed_tasks") or 0)
        progress_percent = round((completed_tasks / total_tasks) * 100, 2) if total_tasks > 0 else 0.0
        total_logged_duration = float((duration_rows[0] if duration_rows else {}).get("total_logged_duration") or 0.0)

        record = {
            "course_id": row.get("course_id"),
            "course_name": row.get("course_name"),
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "progress_percent": progress_percent,
            "total_logged_duration": total_logged_duration,
            "source": "neo4j_fallback",
        }

        summary = (
            f"Tiến độ hiện tại {progress_percent}% ({completed_tasks}/{total_tasks} task hoàn thành), "
            f"tổng thời lượng log {total_logged_duration}."
        )
        return _format_tool_json("get_learning_progress", summary, [record])

    @tool
    async def analyze_study_behavior(user_id: int = user_id) -> str:
        """
        Phân tích hành vi học tập tổng quan dựa trên task và log thực tế của user.
        Dùng khi user hỏi thói quen học, mức ổn định, hoặc xu hướng học tập.
        """
        query = """
        MATCH (u:User {pg_id: $user_pg_id})-[:OWNS_PLAN]->(sp:StudyPlan {status: 'Active'})-[:HAS_COURSE]->(c:Course {status: 'Enrolled'})
        WHERE ($course_pg_id IS NULL OR c.pg_id = $course_pg_id)
        OPTIONAL MATCH (c)-[:HAS_PHASE]->(:Phase)-[:CONTAINS]->(t:Task)
        WITH collect(DISTINCT t) AS tasks
        WITH tasks,
             size(tasks) AS total_tasks,
             size([x IN tasks WHERE x.status = 'Completed']) AS completed_tasks
        UNWIND CASE WHEN size(tasks) = 0 THEN [NULL] ELSE tasks END AS task
        OPTIONAL MATCH (task)-[:HAS_LOG]->(l:Log)
        RETURN total_tasks,
               completed_tasks,
               count(l) AS total_logs,
               count(DISTINCT date(l.completed_at)) AS active_days,
               round(coalesce(avg(toFloat(l.actual_duration)), 0.0), 2) AS avg_session_duration
        """

        rows = run_cypher(query, {"user_pg_id": str(user_id), "course_pg_id": str(course_id) if course_id is not None else None})
        if not rows:
            return _format_tool_json(
                "analyze_study_behavior",
                "Không có dữ liệu hành vi học tập trong graph.",
                [],
            )

        row = rows[0]
        total_tasks = int(row.get("total_tasks") or 0)
        completed_tasks = int(row.get("completed_tasks") or 0)
        total_logs = int(row.get("total_logs") or 0)
        active_days = int(row.get("active_days") or 0)
        avg_session_duration = float(row.get("avg_session_duration") or 0.0)
        completion_rate = round((completed_tasks / total_tasks) * 100, 2) if total_tasks > 0 else 0.0

        if active_days >= 5 and completion_rate >= 70:
            pattern = "Consistent"
        elif active_days >= 3 or completion_rate >= 40:
            pattern = "Moderate"
        else:
            pattern = "Irregular"

        record = {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": completion_rate,
            "total_logs": total_logs,
            "active_days": active_days,
            "avg_session_duration": avg_session_duration,
            "pattern": pattern,
        }

        summary = (
            f"Mức độ học tập: {pattern}. "
            f"Tần suất học {active_days} ngày có log, tỷ lệ hoàn thành {completion_rate}%."
        )

        return _format_tool_json("analyze_study_behavior", summary, [record])

    @tool
    async def get_calendar_context(
        user_id: int = user_id,
        course_id: int | None = course_id,
        horizon_days: int = 14,
    ) -> str:
        """
        Lấy ngữ cảnh lịch học sắp tới theo dữ liệu calendar thực tế.
        Dùng để AI biết khung giờ đã bận/rảnh trước khi gợi ý cải thiện.
        """
        context = await _get_calendar_context_from_internal_api(user_id, course_id, horizon_days)
        if not context:
            return _format_tool_json(
                "get_calendar_context",
                "Không lấy được calendar context từ internal API.",
                [],
            )

        events = context.get("events") or []
        summary = (
            f"Tìm thấy {len(events)} sự kiện trong {context.get('horizonDays', horizon_days)} ngày tới."
        )
        return _format_tool_json("get_calendar_context", summary, [context])

    @tool
    async def get_graph_insights(user_id: int = user_id, course_id: int | None = course_id) -> str:
        """
        Trích xuất insight học tập từ GraphDB: phase nghẽn, milestone gần hạn và task hiểu chưa tốt.
        Dùng làm tín hiệu bổ sung để AI khuyến nghị hành động cải thiện.
        """
        params = {
            "user_pg_id": str(user_id),
            "course_pg_id": str(course_id) if course_id is not None else None,
        }

        bottleneck_query = """
        MATCH (u:User {pg_id: $user_pg_id})-[:OWNS_PLAN]->(sp:StudyPlan {status: 'Active'})-[:HAS_COURSE]->(c:Course {status: 'Enrolled'})-[:HAS_PHASE]->(p:Phase)-[:CONTAINS]->(t:Task)
        WHERE ($course_pg_id IS NULL OR c.pg_id = $course_pg_id)
          AND coalesce(t.status, '') <> 'Completed'
        RETURN c.pg_id AS course_id,
               c.name AS course_name,
               p.pg_id AS phase_id,
               p.title AS phase_title,
               count(t) AS pending_tasks
        ORDER BY pending_tasks DESC
        LIMIT 5
        """

        milestone_query = """
        MATCH (u:User {pg_id: $user_pg_id})-[:OWNS_PLAN]->(sp:StudyPlan {status: 'Active'})-[:HAS_COURSE]->(c:Course {status: 'Enrolled'})-[:HAS_PHASE]->(:Phase)-[:CONTAINS]->(t:Task)
        WHERE ($course_pg_id IS NULL OR c.pg_id = $course_pg_id)
          AND t.type = 'Milestone'
          AND coalesce(t.status, '') <> 'Completed'
          AND t.end_datetime IS NOT NULL
        RETURN t.pg_id AS task_id,
               t.name AS task_name,
               t.end_datetime AS end_datetime,
               c.pg_id AS course_id,
               c.name AS course_name
        ORDER BY t.end_datetime ASC
        LIMIT 5
        """

        comprehension_query = """
        MATCH (u:User {pg_id: $user_pg_id})-[:OWNS_PLAN]->(sp:StudyPlan {status: 'Active'})-[:HAS_COURSE]->(c:Course {status: 'Enrolled'})-[:HAS_PHASE]->(:Phase)-[:CONTAINS]->(t:Task)-[:HAS_LOG]->(l:Log)
        WHERE ($course_pg_id IS NULL OR c.pg_id = $course_pg_id)
        WITH t,
             count(l) AS log_count,
             avg(CASE
                 WHEN l.comprehension_level = 'Advanced' THEN 1.0
                 WHEN l.comprehension_level = 'Intermediate' THEN 0.75
                 WHEN l.comprehension_level = 'Basic' THEN 0.4
                 ELSE 0.2
             END) AS comprehension_score
        WHERE log_count >= 2 AND comprehension_score < 0.6
        RETURN t.pg_id AS task_id,
               t.name AS task_name,
               round(comprehension_score, 2) AS comprehension_score,
               log_count
        ORDER BY comprehension_score ASC
        LIMIT 5
        """

        bottlenecks = []
        milestones = []
        low_comprehension_tasks = []

        try:
            bottlenecks = run_cypher(bottleneck_query, params)
        except Exception as exc:
            logger.warning("get_graph_insights bottleneck query failed: %s", exc)

        try:
            milestones = run_cypher(milestone_query, params)
        except Exception as exc:
            logger.warning("get_graph_insights milestone query failed: %s", exc)

        try:
            low_comprehension_tasks = run_cypher(comprehension_query, params)
        except Exception as exc:
            logger.warning("get_graph_insights comprehension query failed: %s", exc)

        record = {
            "bottleneck_phases": bottlenecks,
            "upcoming_milestones": milestones,
            "low_comprehension_tasks": low_comprehension_tasks,
        }

        summary = (
            f"Graph insights: {len(bottlenecks)} phase nghẽn, "
            f"{len(milestones)} milestone gần hạn, "
            f"{len(low_comprehension_tasks)} task cần củng cố hiểu bài."
        )

        return _format_tool_json("get_graph_insights", summary, [record])

    @tool
    async def suggest_phase_preview(
        user_id: int = user_id,
        course_id: int | None = course_id,
        horizon_days: int = 14,
        learning_goal: str | None = None,
    ) -> str:
        """
        Tạo preview phase gợi ý từ lịch, tiến độ và graph insights.
        Chỉ preview để người dùng xem, chưa ghi dữ liệu vào DB.
        """
        if course_id is None:
            return _format_tool_json(
                "suggest_phase_preview",
                "Thiếu course_id để đề xuất phase preview.",
                [],
            )

        preview = await _get_phase_preview_from_internal_api(
            user_id=user_id,
            course_id=course_id,
            horizon_days=horizon_days,
            learning_goal=learning_goal,
        )

        if not preview:
            return _format_tool_json(
                "suggest_phase_preview",
                "Không tạo được phase preview từ internal API.",
                [],
            )

        phase = preview.get("phase") or {}
        tasks = preview.get("suggestedTasks") or []
        windows = preview.get("suggestedStudyWindows") or []
        summary = (
            f"Da tao preview phase '{phase.get('title', '')}' voi "
            f"{len(tasks)} task goi y va {len(windows)} khung gio trong."
        )

        return _format_tool_json("suggest_phase_preview", summary, [preview])

    @tool
    async def search_document(query: str) -> str:
        """
        Tìm kiếm lý thuyết, khái niệm, định nghĩa trong giáo trình PDF đã ingest.
        Không dùng cho thống kê tiến độ hoặc task cá nhân.
        """
        return await _vector_search(query, asset_ids)

    tools = [
        get_upcoming_tasks,
        get_learning_progress,
        analyze_study_behavior,
        get_calendar_context,
        get_graph_insights,
        suggest_phase_preview,
    ]
    if asset_ids:
        tools.append(search_document)
    return tools
