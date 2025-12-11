import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axios";
import axios from "axios";

// Helper function to convert plain text to safe HTML
const convertContentToSafeHTML = (content: string): string => {
  if (!content) return "";

  // If content already contains HTML tags, return as is
  if (/<[^>]*>/g.test(content)) {
    return content;
  }

  // Convert plain text to HTML paragraphs
  return content
    .split(/\n\n+/) // Split by double newlines
    .filter(line => line.trim()) // Remove empty lines
    .map(line => `<p>${line.trim().replace(/\n/g, '<br>')}</p>`)
    .join("");
};

export interface BlogDto {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  authorId: number;
  authorName?: string;
  createdAt?: string;
}

interface MutationVariables {
  id: number;
  blog: CreateBlog;
}

export interface CreateBlog {
  title: string;
  content: string;
  imageUrl: File; // Corrected type to File
  authorId: number;
}

const fetchBlogs = async (): Promise<BlogDto[]> => {
  const response = await axiosInstance.get("blog");
  const blogs = response.data;

  console.log("Raw blog API response:", blogs);

  if (Array.isArray(blogs)) {
    return blogs.map(blog => ({
      ...blog,
      content: convertContentToSafeHTML(blog.content)
    })) as BlogDto[];
  }

  return [];
};

export const useBlogs = () => {
  return useQuery<BlogDto[], Error>({
    queryKey: ["blog"],
    queryFn: fetchBlogs,
  });
};

const fetchBlogsActive = async (): Promise<BlogDto[]> => {
  const response = await axiosInstance.get("blog");
  const blogs = response.data;

  if (Array.isArray(blogs)) {
    return blogs.map(blog => ({
      ...blog,
      content: convertContentToSafeHTML(blog.content)
    })) as BlogDto[];
  }

  return [];
};

export const useBlogActive = () => {
  return useQuery<BlogDto[], Error>({
    queryKey: ["blog"],
    queryFn: fetchBlogsActive,
  });
};

export const useCreateBlogs = () => {
  const queryClient = useQueryClient();

  return useMutation<BlogDto, Error, CreateBlog>({
    mutationFn: async (newBlog: CreateBlog) => {
      try {
        const formData = new FormData();
        formData.append("title", newBlog.title);
        formData.append("content", newBlog.content);
        if (newBlog.imageUrl) {
          formData.append("imageUrl", newBlog.imageUrl);
        }

        const response = await axiosInstance.post(`blog`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data as BlogDto;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorData = error.response.data;
          throw new Error(errorData.message || "Failed to create blog post");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
  });
};

export const useGetBlogById = (id: number) => {
  return useQuery<BlogDto, Error>({
    queryKey: ["blog", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`blog/${id}`);
      const blog = response.data as BlogDto;
      console.log(`Blog detail API response for ID ${id}:`, blog);
      return {
        ...blog,
        content: convertContentToSafeHTML(blog.content)
      };
    },
    enabled: !!id,
  });
};

export const useUpdateBlogs = () => {
  const queryClient = useQueryClient();

  return useMutation<BlogDto, Error, MutationVariables>({
    mutationFn: async ({ id, blog }: MutationVariables): Promise<BlogDto> => {
      const formData = new FormData();
      formData.append("title", blog.title);
      formData.append("content", blog.content);
      if (blog.imageUrl) {
        formData.append("imageUrl", blog.imageUrl);
      }

      const response = await axiosInstance.put(`blog/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data as BlogDto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
  });
};

export const useDeleteBlogs = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id: number): Promise<void> => {
      await axiosInstance.delete(`blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
  });
};
