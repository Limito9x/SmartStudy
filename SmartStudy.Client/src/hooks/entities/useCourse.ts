import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourseByIdOptions,
  getCoursesQueryKey,
  getCoursesOptions,
  updateCourseMutation,
  createCourseMutation,
  deleteCourseMutation
} from "@/services/api/@tanstack/react-query.gen";

interface UseCourseOptions {
  studyPlanId?: number;
}

export const useCourse = ({ studyPlanId }: UseCourseOptions) => {
  const queryClient = useQueryClient();

  const getCoursesByStudyPlan = useQuery({
    ...getCoursesOptions({
      query: { studyPlanId: studyPlanId },
    }),
    enabled: !!studyPlanId,
  });

  const getCourseById = (courseId: number) => useQuery({
    ...getCourseByIdOptions({
      path: { courseId: courseId! },
    }),
    enabled: !!courseId,
  });

  const createCourse = useMutation({
    ...createCourseMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getCoursesQueryKey({
          query: { studyPlanId: studyPlanId },
        }),
      });
    },
  });

  const updateCourse = useMutation({
    ...updateCourseMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getCoursesQueryKey({
          query: { studyPlanId: studyPlanId },
        }),
      });
    },
  });

  const deleteCourse = useMutation({
    ...deleteCourseMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getCoursesQueryKey({
          query: { studyPlanId: studyPlanId },
        }),
      });
    },
  });


  return {
    getCoursesByStudyPlan,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
  };
};
