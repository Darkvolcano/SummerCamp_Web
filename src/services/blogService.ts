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
  Author?: {
    id: number;
    fullName: string;
    email: string;
  } | null;
}

interface MutationVariables {
  id: number;
  blog: CreateBlog;
}

export interface CreateBlog {
  title: string;
  content: string;
  imageUrl?: File; 
  authorId?: number;
}

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
  } | null;
  author?: {
    id: number;
    fullName: string;
    email: string;
  } | null;
}

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

const fetchBlogs = async (): Promise<BlogDto[]> => {
  const response = await axiosInstance.get("blog");
  const blogs = response.data;

  if (Array.isArray(blogs)) {
    return blogs.map(mapBlogResponse);
  }

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

export const useCreateBlogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
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

export const useUpdateBlogs = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, MutationVariables>({
    mutationFn: async ({ id, blog }: MutationVariables): Promise<void> => {
      const formData = new FormData();
      formData.append("title", blog.title);
      formData.append("content", blog.content);
      if (blog.imageUrl) {
        formData.append("imageUrl", blog.imageUrl);
      }

      await axiosInstance.put(`blog/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
