'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { DEMO_STUDENTS } from '@/lib/demo-students';
import { normalizeTrackedStudents } from '@/lib/student-tracking';
import { TeacherProfile, User, ChildData } from '@/types';

type BackendUser = User & { _id?: string };
type BackendChild = ChildData & { _id?: string };

interface TeacherDashboardState {
  teacherProfile: TeacherProfile | null;
  currentUser: User | null;
  students: ChildData[];
  isLoading: boolean;
  error: string | null;
}

export function useTeacherDashboard() {
  const [state, setState] = useState<TeacherDashboardState>({
    teacherProfile: null,
    currentUser: null,
    students: [],
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Fetch teacher profile and all users in parallel
      const [profileRes, usersRes, childrenRes] = await Promise.all([
        apiClient.get('/teachers/me'),
        apiClient.get('/users'),
        apiClient.get('/children'),
      ]);

      const teacherProfile: TeacherProfile = profileRes.data;
      const allUsers: BackendUser[] = usersRes.data;
      const allChildren: BackendChild[] = childrenRes.data;

      // Find current user linked to this teacher profile
      const currentUser =
        allUsers.find(u => u._id === teacherProfile.user_id) ?? null;

      // Show all children from the database and ensure unique IDs for keys
      const myStudents: ChildData[] = allChildren.map(child => ({
        ...child,
        id: child.id || child._id || child.user_id,
        user: allUsers.find(u => u._id === child.user_id || u.id === child.user_id),
      }));

      const seededStudents =
        myStudents.length >= 4
          ? myStudents
          : [...myStudents, ...DEMO_STUDENTS.slice(0, Math.max(0, 4 - myStudents.length))];

      const trackedStudents = normalizeTrackedStudents(seededStudents);

      setState({
        teacherProfile,
        currentUser,
        students: trackedStudents,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load dashboard data';
      console.error('[useTeacherDashboard]', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
