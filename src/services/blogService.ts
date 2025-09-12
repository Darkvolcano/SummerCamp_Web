/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axios";
import axios from "axios";

interface BlogApiResponse {
  status: number;
  message: string;
  blogs?: BlogDto[];
}

interface BlogDetailApiResponse {
  status: number;
  message: string;
  blog?: BlogDto;
}

export interface BlogDto {
  id: number;
  title: string;
  content: string;
  authorId: number;
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: number;
  Author: {
    id: number;
    fullName: string;
    email: string;
  };
}

interface MutationVariables {
  id: number;
  blog: CreateBlog;
}

export interface CreateBlog {
  title: string;
  content: string;
  image: string;
}

const fetchBlogs = async (): Promise<BlogDto[]> => {
  const response = await axiosInstance.get("blogs");
  const {
    status,
    message: responseMessage,
    blogs,
  } = response.data as BlogApiResponse;
  if (status >= 200 && status < 300 && blogs) {
    return Array.isArray(blogs) ? blogs : [];
  }
  throw new Error(responseMessage || "Không thể tải danh sách blog");
};

export const useBlogs = () => {
  return useQuery<BlogDto[], Error>({
    queryKey: ["blogs"],
    queryFn: fetchBlogs,
  });
};

const fetchBlogsActive = async (): Promise<BlogDto[]> => {
  const response = await axiosInstance.get("blogs/active");
  const {
    status,
    message: responseMessage,
    blogs,
  } = response.data as BlogApiResponse;
  if (status >= 200 && status < 300 && blogs) {
    return Array.isArray(blogs) ? blogs : [];
  }
  throw new Error(responseMessage || "Không thể tải danh sách blog");
};

export const useBlogActive = () => {
  return useQuery<BlogDto[], Error>({
    queryKey: ["blogs"],
    queryFn: fetchBlogsActive,
  });
};

export const useCreateBlogs = () => {
  return useMutation({
    mutationFn: async (newBlog: CreateBlog) => {
      try {
        const response = await axiosInstance.post(`blogs`, newBlog);
        return response.data as BlogDetailApiResponse;
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
          const errorData = error.response.data;
          throw new Error(errorData.message || "Lỗi không xác định");
        }
        throw error;
      }
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data;
        throw new Error(errorMessage);
      } else {
        throw new Error("An unexpected error occurred");
      }
    },
  });
};

export const useGetBlogById = (id: number) => {
  return useQuery<BlogDto, Error>({
    queryKey: ["blogs", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`blogs/${id}`);
      const {
        status,
        message: responseMessage,
        blog,
      } = response.data as BlogDetailApiResponse;

      if (status >= 200 && status < 300 && blog) {
        return blog;
      }
      throw new Error(responseMessage || "Không thể tải chi tiết blog");
    },
    enabled: !!id,
  });
};

export const useUpdateBlogs = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, MutationVariables>({
    mutationFn: async ({ id, blog }: MutationVariables): Promise<void> => {
      await axiosInstance.put(`blogs/${id}`, blog);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};

export const useDeleteBlogs = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id: number): Promise<void> => {
      await axiosInstance.delete(`blogs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};
