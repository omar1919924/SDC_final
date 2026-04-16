import { User, StudentProfile, TeacherProfile } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetcher<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  getUsers: () => fetcher<User[]>('/users'),
  getTeachers: () => fetcher<TeacherProfile[]>('/teachers'),
  getParents: () => fetcher<unknown[]>('/parents'),
  getChildren: () => fetcher<StudentProfile[]>('/children'),
  getMe: () => fetcher<User>('/users/me'),
};
