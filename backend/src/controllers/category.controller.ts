import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { Category, ICategory } from "../models/Category.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Build category hierarchy
 */
function buildCategoryHierarchy(categories: ICategory[]): any[] {
  const categoryMap = new Map<number, any>();
  const parentById = new Map<number, number | undefined>();

  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      description: cat.description,
      image: cat.image,
      parentId: cat.parentId,
      displayOrder: cat.displayOrder,
      active: cat.active,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      children: [] as any[],
    });
    parentById.set(cat.id, cat.parentId);
  });

  const rootCategories: any[] = [];

  const sortTree = (nodes: any[]) => {
    nodes.sort((a, b) => a.displayOrder - b.displayOrder || String(a.name).localeCompare(String(b.name)));
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortTree(node.children);
      }
    });
  };

  const createsCycle = (childId: number, parentId: number) => {
    let current: number | undefined = parentId;
    const visited = new Set<number>();

    while (current !== undefined) {
      if (current === childId) return true;
      if (visited.has(current)) return true;
      visited.add(current);
      current = parentById.get(current);
    }

    return false;
  };

  categories.forEach((category) => {
    const categoryWithChildren = categoryMap.get(category.id);
    if (!categoryWithChildren) return;
    
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent && !createsCycle(category.id, category.parentId)) {
        parent.children.push(categoryWithChildren);
      } else {
        rootCategories.push(categoryWithChildren);
      }
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });

  sortTree(rootCategories);

  return rootCategories;
}

/**
 * Get all categories
 */
export async function getAllCategories(req: AuthRequest, res: Response) {
  try {
    const categories = await Category.find({ active: true })
      .sort({ displayOrder: 1, name: 1 });

    const hierarchyCategories = buildCategoryHierarchy(categories);

    res.json({
      success: true,
      data: {
        categories: hierarchyCategories,
      },
    });
  } catch (error) {
    throw new AppError("Failed to get categories", 500);
  }
}

/**
 * Get all categories (including inactive)
 */
export async function getAllCategoriesAdmin(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      Category.find()
        .skip(skip)
        .limit(limit)
        .sort({ displayOrder: 1, name: 1 }),
      Category.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    throw new AppError("Failed to get categories", 500);
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const category = await Category.findOne({ id: parseInt(idStr) });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to get category", 500);
  }
}

/**
 * Create a new category
 */
export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const {
      name,
      description,
      image,
      parentId,
      displayOrder,
    } = req.body;

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw new AppError("Category with this name already exists", 400);
    }

    // Validate parent category exists if parentId is provided
    if (parentId) {
      const parentCategory = await Category.findOne({ id: parentId });
      if (!parentCategory) {
        throw new AppError("Parent category not found", 404);
      }
    }

    // Get the next ID
    const lastCategory = await Category.findOne().sort({ id: -1 });
    const nextId = lastCategory ? lastCategory.id + 1 : 1;

    const category = new Category({
      id: nextId,
      name,
      description,
      image,
      parentId: parentId || undefined,
      displayOrder: displayOrder ?? 0,
      active: true,
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to create category", 500);
  }
}

/**
 * Update category by ID
 */
export async function updateCategory(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const updateData = req.body;
    const categoryId = parseInt(idStr);

    // Check if new name conflicts with existing category
    if (updateData.name) {
      const existingCategory = await Category.findOne({
        name: updateData.name,
        id: { $ne: categoryId },
      });
      if (existingCategory) {
        throw new AppError("Category with this name already exists", 400);
      }
    }

    // Validate parent category exists if parentId is provided
    if (updateData.parentId !== undefined) {
      // Don't allow a category to be its own parent
      if (updateData.parentId === categoryId) {
        throw new AppError("A category cannot be its own parent", 400);
      }
      
      if (updateData.parentId) {
        const parentCategory = await Category.findOne({ id: updateData.parentId });
        if (!parentCategory) {
          throw new AppError("Parent category not found", 404);
        }
      }
    }

    const category = await Category.findOneAndUpdate(
      { id: categoryId },
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    res.json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update category", 500);
  }
}

/**
 * Delete category by ID
 */
export async function deleteCategory(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const category = await Category.findOneAndDelete({
      id: parseInt(idStr),
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    res.json({
      success: true,
      data: category,
      message: "Category deleted successfully",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to delete category", 500);
  }
}

/**
 * Toggle category active status
 */
export async function toggleCategoryStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const category = await Category.findOne({ id: parseInt(idStr) });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    category.active = !category.active;
    await category.save();

    res.json({
      success: true,
      data: category,
      message: `Category ${category.active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to toggle category status", 500);
  }
}
