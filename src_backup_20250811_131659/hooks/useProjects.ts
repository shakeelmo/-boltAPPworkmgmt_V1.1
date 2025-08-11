import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Project } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { projects } = await api.getProjects();
      setProjects(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addProject = async (projectData: any) => {
    try {
      await api.createProject(projectData);
      await fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  // Optionally, add updateProject, deleteProject, etc. here

  return { projects, isLoading, addProject, refetch: fetchProjects };
}