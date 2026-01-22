// TypeScript types matching backend Pydantic schemas

export enum UserRole {
    STUDENT = "STUDENT",
    CREATOR = "CREATOR",
    ADMIN = "ADMIN",
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    created_at: string;
    profile_picture_url?: string | null;
}

export interface UserCreate {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
}

export interface Token {
    access_token: string;
    token_type: string;
}

export interface LoginCredentials {
    username: string; // email
    password: string;
}

export interface SignupResponse {
    message: string;
    email: string;
    requires_verification: boolean;
}

export interface VerifyEmailRequest {
    email: string;
    otp: string;
}

export interface ResendOTPResponse {
    message: string;
    cooldown_seconds: number | null;
}

export interface GoogleAuthRequest {
    id_token: string;
}

// Course related types
export type PlaylistType = "PLAYLIST" | "SINGLE_VIDEO";

export interface Playlist {
    id: string;
    youtube_id: string;
    Youtubelist_id?: string;  // YouTube playlist/video ID from backend
    type?: PlaylistType;  // PLAYLIST or SINGLE_VIDEO
    title: string;
    description: string;
    thumbnail_url: string;
    creator_id: string;
    is_published: boolean;
    created_at: string;
    video_count?: number;
}

export interface Video {
    id: string;
    playlist_id: string;
    youtube_id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    duration_seconds: number;
    position: number;
    transcript?: string;
    quiz_data?: QuizData;
}

export interface QuizData {
    questions: QuizQuestion[];
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correct_answer: number;
}

// Progress related types
export interface Enrollment {
    id: string;
    user_id: string;
    playlist_id: string;
    is_completed: boolean;
    certificate_url?: string;
    enrolled_at: string;
    playlist?: Playlist;
}

export interface VideoProgress {
    id: string;
    enrollment_id: string;
    video_id: string;
    watch_time_seconds: number;
    watch_status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    quiz_score?: number;
    quiz_passed: boolean;
}

// Analytics types (for creators)
export interface CourseAnalytics {
    total_enrollments: number;
    completion_rate: number;
    average_quiz_score: number;
    enrollments: EnrollmentDetail[];
}

export interface EnrollmentDetail {
    user_email: string;
    enrolled_at: string;
    completion_percentage: number;
    average_quiz_score: number;
}

// Certificate types
export interface Certificate {
    id: string;
    user_id: string;
    playlist_id: string;
    pdf_url: string;
    issued_at: string;
    playlist?: Playlist;
    user?: User;
}

// API Response types
export interface ApiError {
    detail: string;
}
