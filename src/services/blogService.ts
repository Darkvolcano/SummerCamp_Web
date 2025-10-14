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

/**
 * Backend blog response interface
 * Backend returns "blogId" instead of "id"
 */
interface BackendBlogDto {
  blogId?: number;
  id?: number;
  title: string;
  content: string;
  authorId: number;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: number;
  Author?: {
    id: number;
    fullName: string;
    email: string;
  };
  author?: {
    id: number;
    fullName: string;
    email: string;
  };
}

/**
 * Maps backend blog response to frontend BlogDto interface
 * Handles field name discrepancies (blogId -> id)
 */
const mapBlogResponse = (blog: BackendBlogDto): BlogDto => ({
  id: blog.blogId || blog.id || 0,
  title: blog.title,
  content: blog.content,
  authorId: blog.authorId,
  image: blog.image || "",
  isActive: blog.isActive,
  createdAt: blog.createdAt,
  updatedAt: blog.updatedAt,
  Author: (blog.Author || blog.author) as BlogDto["Author"]
});

/**
 * Fetches all blog posts from the API
 * @returns Array of blog posts
 */
const fetchBlogs = async (): Promise<BlogDto[]> => {
  const response = await axiosInstance.get("blog");
  const blogs = response.data;

  if (Array.isArray(blogs)) {
    return blogs.map(mapBlogResponse);
  }

  // Fallback: check if it's wrapped in BlogApiResponse format
  const wrappedData = response.data as BlogApiResponse;
  if (wrappedData.blogs && Array.isArray(wrappedData.blogs)) {
    return wrappedData.blogs.map(mapBlogResponse);
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
  const response = await axiosInstance.get("blog/active");
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
    queryKey: ["blog"],
    queryFn: fetchBlogsActive,
  });
};

/**
 * React Query hook for creating a new blog post
 */
export const useCreateBlogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newBlog: CreateBlog) => {
      try {
        const response = await axiosInstance.post(`blog`, newBlog);
        return response.data as BlogDetailApiResponse;
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

/**
 * React Query hook for fetching a single blog post by ID
 */
export const useGetBlogById = (id: number) => {
  return useQuery<BlogDto, Error>({
    queryKey: ["blog", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`blog/${id}`);
      const {
        status,
        message: responseMessage,
        blog,
      } = response.data as BlogDetailApiResponse;

      if (status >= 200 && status < 300 && blog) {
        return blog;
      }
      throw new Error(responseMessage || "Failed to load blog details");
    },
    enabled: !!id,
  });
};

/**
 * React Query hook for updating an existing blog post
 */
export const useUpdateBlogs = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, MutationVariables>({
    mutationFn: async ({ id, blog }: MutationVariables): Promise<void> => {
      await axiosInstance.put(`blog/${id}`, blog);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
  });
};

/**
 * React Query hook for deleting a blog post
 */
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
