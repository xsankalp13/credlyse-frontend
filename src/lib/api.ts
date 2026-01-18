/**
 * API Client for CredLyse Backend
 * 
 * Handles all HTTP requests with JWT authentication
 */

import type { Token, User, UserCreate, LoginCredentials, Playlist, Enrollment, CourseAnalytics, Certificate, SignupResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
    private getToken(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("access_token");
    }

    private getHeaders(includeAuth: boolean = true): HeadersInit {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: "An error occurred" }));
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    // ==================== Auth Endpoints ====================

    async signup(userData: UserCreate): Promise<SignupResponse> {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
            method: "POST",
            headers: this.getHeaders(false),
            body: JSON.stringify(userData),
        });
        return this.handleResponse<SignupResponse>(response);
    }

    async login(credentials: LoginCredentials): Promise<Token> {
        const formData = new URLSearchParams();
        formData.append("username", credentials.username);
        formData.append("password", credentials.password);

        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
        });
        return this.handleResponse<Token>(response);
    }

    async verifyEmail(email: string, otp: string): Promise<Token> {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-email`, {
            method: "POST",
            headers: this.getHeaders(false),
            body: JSON.stringify({ email, otp }),
        });
        return this.handleResponse<Token>(response);
    }

    async resendOtp(email: string): Promise<{ message: string; cooldown_seconds: number | null }> {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/resend-otp`, {
            method: "POST",
            headers: this.getHeaders(false),
            body: JSON.stringify({ email }),
        });
        return this.handleResponse<{ message: string; cooldown_seconds: number | null }>(response);
    }

    async googleAuth(idToken: string): Promise<Token> {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
            method: "POST",
            headers: this.getHeaders(false),
            body: JSON.stringify({ id_token: idToken }),
        });
        return this.handleResponse<Token>(response);
    }

    async forgotPassword(email: string): Promise<{ message: string; email: string }> {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
            method: "POST",
            headers: this.getHeaders(false),
            body: JSON.stringify({ email }),
        });
        return this.handleResponse<{ message: string; email: string }>(response);
    }

    async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
            method: "POST",
            headers: this.getHeaders(false),
            body: JSON.stringify({ email, otp, new_password: newPassword }),
        });
        return this.handleResponse<{ message: string }>(response);
    }

    // ==================== User Endpoints ====================

    async getCurrentUser(): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
            method: "GET",
            headers: this.getHeaders(),
        });
        return this.handleResponse<User>(response);
    }

    // ==================== Course Endpoints ====================

    async getCourses(): Promise<Playlist[]> {
        const response = await fetch(`${API_BASE_URL}/api/v1/courses`, {
            method: "GET",
            headers: this.getHeaders(),
        });
        return this.handleResponse<Playlist[]>(response);
    }

    async getCourse(courseId: string): Promise<Playlist> {
        const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}`, {
            method: "GET",
            headers: this.getHeaders(),
        });
        return this.handleResponse<Playlist>(response);
    }

    async importPlaylist(url: string): Promise<Playlist> {
        const response = await fetch(`${API_BASE_URL}/api/v1/courses/`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ youtube_url: url }),
        });
        return this.handleResponse<Playlist>(response);
    }

    async analyzeCourse(courseId: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/analyze`, {
            method: "POST",
            headers: this.getHeaders(),
        });
        return this.handleResponse<{ message: string }>(response);
    }

    async publishCourse(courseId: string): Promise<Playlist> {
        const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/publish`, {
            method: "POST",
            headers: this.getHeaders(),
        });
        return this.handleResponse<Playlist>(response);
    }

    // ==================== Creator Analytics ====================

    async getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
        const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/analytics`, {
            method: "GET",
            headers: this.getHeaders(),
        });
        return this.handleResponse<CourseAnalytics>(response);
    }

    async getCreatorCourses(): Promise<Playlist[]> {
        const response = await fetch(`${API_BASE_URL}/api/v1/courses/my-created`, {
            method: "GET",
            headers: this.getHeaders(),
        });
        return this.handleResponse<Playlist[]>(response);
    }

    async getPublishedCourses(page: number = 1, size: number = 20, search?: string): Promise<{ items: Playlist[]; total: number; page: number; pages: number }> {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (search) params.append("search", search);
        const response = await fetch(`${API_BASE_URL}/api/v1/courses/?${params}`, {
            method: "GET",
            headers: this.getHeaders(),
        });
        return this.handleResponse<{ items: Playlist[]; total: number; page: number; pages: number }>(response);
    }

    async enrollInCourse(videoId: string): Promise<{ message: string }> {
        // Uses startWatching endpoint which auto-enrolls the user
        const response = await fetch(`${API_BASE_URL}/api/v1/progress/start`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ video_id: videoId }),
        });
        return this.handleResponse<{ message: string }>(response);
    }

    // ==================== Student Enrollments ====================

    async getEnrollments(): Promise<Enrollment[]> {
        const response = await fetch(`${API_BASE_URL}/api/v1/progress/enrollments`, {
            method: "GET",
            headers: this.getHeaders(),
        });
        return this.handleResponse<Enrollment[]>(response);
    }

    async startWatching(videoId: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/api/v1/progress/start`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ video_id: videoId }),
        });
        return this.handleResponse<{ message: string }>(response);
    }

    // ==================== Certificates ====================

    async getCertificates(): Promise<Certificate[]> {
        const response = await fetch(`${API_BASE_URL}/api/v1/certificates`, {
            method: "GET",
            headers: this.getHeaders(),
        });
        return this.handleResponse<Certificate[]>(response);
    }

    async claimCertificate(courseId: string): Promise<Certificate> {
        const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/claim-certificate`, {
            method: "POST",
            headers: this.getHeaders(),
        });
        return this.handleResponse<Certificate>(response);
    }

    async downloadCertificate(playlistId: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${playlistId}/download`, {
            method: "GET",
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: "Download failed" }));
            throw new Error(error.detail || "Download failed");
        }

        // Create blob and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = response.headers.get("content-disposition")?.split("filename=")[1]?.replace(/"/g, "") || "certificate.jpg";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }
}

export const api = new ApiClient();
