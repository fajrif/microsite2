import { Metadata } from "next";

export const createMetadata = (
  title: string,
  description: string
  ): Metadata => ({
    title,
    description,
  });
