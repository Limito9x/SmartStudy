import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourseByIdOptions,
  getCoursesByStudyPlanQueryKey,
  getCoursesByStudyPlanOptions,
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
    ...getCoursesByStudyPlanOptions({
      path: { studyPlanId: studyPlanId! },
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
        queryKey: getCoursesByStudyPlanQueryKey({
          path: { studyPlanId: studyPlanId! },
        }),
      });
      alert("Tạo khóa học thành công");
    },
  });

  const updateCourse = useMutation({
    ...updateCourseMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getCoursesByStudyPlanQueryKey({
          path: { studyPlanId: studyPlanId! },
        }),
      });
      alert("Cập nhật khóa học thành công");
    },
  });

  const deleteCourse = useMutation({
    ...deleteCourseMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getCoursesByStudyPlanQueryKey({
          path: { studyPlanId: studyPlanId! },
        }),
      });
      alert("Xóa khóa học thành công");
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
