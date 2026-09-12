import { Model } from "mongoose";

interface PaginateOptions {
  page?: number;
  limit?: number;
}

export const paginate = async <T>(
  model: Model<T>,
  queryObj: Record<string, any>,
  options: PaginateOptions,
  populateFields?: { path: string; select: string }[]
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  let query = model.find(queryObj).skip(skip).limit(limit).sort({ createdAt: -1 });

  if (populateFields) {
    populateFields.forEach((field) => {
      query = query.populate(field.path, field.select) as typeof query;
    });
  }

  const [data, totalCount] = await Promise.all([
    query,
    model.countDocuments(queryObj),
  ]);

  return {
    data,
    count: data.length,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
};