import axios from "axios";
import { API_BASE_URL, COURSE_DETAIL, LESSON_DETAIL, STUDENT_OVERVIEW, STUDENT_RECOMMENDATION, SUBMIT_ATTEMPT } from "./endpoints";

export const getStudentOverview = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}${STUDENT_OVERVIEW}`);
        return response.data;
    }catch (error) {
        console.error("Error fetching student overview:", error);
        throw error;
    }
}

export const getStudentRecommendation = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}${STUDENT_RECOMMENDATION}`);
        return response.data;
    }catch (error) {
        console.error("Error fetching student recommendation:", error);
        throw error;
    }
}



export const submitCodeForAnalysis = async (code: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}api/analyze_code/`, { code });
        return response.data;
    }catch (error) {
        console.error("Error submitting code for analysis:", error);
        throw error;
    }
}

export const getAttempts = async (lessonId: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}api/attempts/?lesson_id=${lessonId}`);
        return response.data;
    }catch (error) {
        console.error("Error fetching attempts:", error);
        throw error;
    }
}       

export const getCourseDetail = async (courseId: number | string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}${COURSE_DETAIL}${courseId}/`);
        return response.data;
    }catch (error) {
        console.error("Error fetching course detail:", error);
        throw error;
    }
}   

export const getLessonDetail = async (lessonId: number | string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}${LESSON_DETAIL}${lessonId}/`, {
            params: { student_id: 1}
        });
        return response.data;
    }  catch (error) {
        console.error("Error fetching lesson detail:", error);
        throw error;
    }
}

export const submitAttempt = async (data: {
    student: string;
    lesson: string;
    correctness: number;
    hints_used: number;
    duration_sec: number;
    timestamp: string | Date;

}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}${SUBMIT_ATTEMPT}`, data);
        return response.data;
    } catch (error) {
        console.error("Error submitting attempt:", error);
        throw error;
    }
}