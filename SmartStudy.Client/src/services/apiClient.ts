import axiosInstance from "./axios/axiosConfig";
import { Configuration, SemesterApi, AuthApi, UserApi, CourseApi } from "./api/";

const config = new Configuration(); // Để trống vì đã cấu hình axiosInstance

export const authService = new AuthApi(config, "", axiosInstance);
export const semesterService = new SemesterApi(config, "", axiosInstance);
export const courseService = new CourseApi(config, "", axiosInstance);
export const userService = new UserApi(config, "", axiosInstance);