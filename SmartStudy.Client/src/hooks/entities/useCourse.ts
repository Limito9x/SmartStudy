import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourseByIdOptions,
  getCoursesQueryKey,
  getCourseByIdQueryKey,
  getCoursesOptions,
  updateCourseMutation,
  updateCourseStatusMutation,
  updateCourseTargetScoreMutation,
  updateCourseFinalScoreMutation,
  updateCourseGoalMutation,
  createCourseMutation,
  deleteCourseMutation,
  getSummaryPlanProgressQueryKey,
} from "@/services/api/@tanstack/react-query.gen";

interface UseCourseOptions {
  studyPlanId?: number | string;
}

export const useCourse = ({ studyPlanId }: UseCourseOptions) => {
  const queryClient = useQueryClient();

  const invalidateCourseList = () => {
    queryClient.invalidateQueries({
      queryKey: getCoursesQueryKey({
        query: { studyPlanId: studyPlanId },
      }),
    });
    queryClient.invalidateQueries({
      queryKey: getSummaryPlanProgressQueryKey(),
    });
  };

  const invalidateCourseById = (courseId?: number | string | null) => {
    const parsedCourseId = Number(courseId);
    if (!Number.isFinite(parsedCourseId) || parsedCourseId <= 0) {
      return;
    }

    queryClient.invalidateQueries({
      queryKey: getCourseByIdQueryKey({
        path: { courseId: parsedCourseId },
      }),
    });
  };

  const getCourses = useQuery({
    ...getCoursesOptions({
      query: { studyPlanId: studyPlanId },
    }),
  });

  const useCourseById = (courseId: number) =>
    useQuery({
      ...getCourseByIdOptions({
        path: { courseId: courseId! },
      }),
      enabled: !!courseId,
    });

  const createCourse = useMutation({
    ...createCourseMutation(),
    onSuccess: () => {
      invalidateCourseList();
    },
  });

  const updateCourse = useMutation({
    ...updateCourseMutation(),
    onSuccess: (data) => {
      invalidateCourseList();
      invalidateCourseById(data.id);
    },
  });

  const updateCourseStatus = useMutation({
    ...updateCourseStatusMutation(),
    onSuccess: (_data, variables) => {
      invalidateCourseList();
      invalidateCourseById(variables.path.courseId);
    },
  });

  const updateCourseTargetScore = useMutation({
    ...updateCourseTargetScoreMutation(),
    onSuccess: (_data, variables) => {
      invalidateCourseList();
      invalidateCourseById(variables.path.courseId);
    },
  });

  const updateCourseFinalScore = useMutation({
    ...updateCourseFinalScoreMutation(),
    onSuccess: (_data, variables) => {
      invalidateCourseList();
      invalidateCourseById(variables.path.courseId);
    },
  });

  const updateCourseGoal = useMutation({
    ...updateCourseGoalMutation(),
    onSuccess: (_data, variables) => {
      invalidateCourseList();
      invalidateCourseById(variables.path.courseId);
    },
  });

  const deleteCourse = useMutation({
    ...deleteCourseMutation(),
    onSuccess: () => {
      invalidateCourseList();
    },
  });

  return {
    getCourses,
    getCourseById: useCourseById,
    updateCourseStatus,
    updateCourseTargetScore,
    updateCourseFinalScore,
    updateCourseGoal,
    createCourse,
    updateCourse,
    deleteCourse,
  };
};
