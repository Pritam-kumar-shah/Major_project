import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';


export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.status(200).json(categories);
});


export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, applicableFields } = req.body;
  
  const categoryExists = await Category.findOne({ slug });
  if (categoryExists) {
    res.status(400);
    throw new Error('Category with this slug already exists');
  }

  const category = await Category.create({ name, slug, applicableFields });
  res.status(201).json(category);
});