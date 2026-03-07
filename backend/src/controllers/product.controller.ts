import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { Product } from "../models/Product.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Get all products
 */
export async function getAllProducts(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter: optionally restrict by targetAudience
    const filter: Record<string, unknown> = {};
    if (req.query.targetAudience === "clients" || req.query.targetAudience === "pro") {
      filter.targetAudience = req.query.targetAudience;
    }

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(limit).sort({ displayOrder: 1, createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    throw new AppError("Failed to get products", 500);
  }
}

/**
 * Get product by ID
 */
export async function getProductById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const product = await Product.findOne({ id: parseInt(idStr) });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to get product", 500);
  }
}

/**
 * Create a new product
 */
export async function createProduct(req: AuthRequest, res: Response) {
  try {
    const {
      name,
      category,
      price,
      discountPercentage,
      available,
      minOrderQuantity,
      maxOrderQuantity,
      description,
      image,
      images,
      preparationTimeHours,
      availableDays,
      hasTaxes,
      allergens,
      customOptions,
      productionType,
      targetAudience,
      recommendations,
    } = req.body;

    // Get the next ID
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const nextId = lastProduct ? lastProduct.id + 1 : 1;

    const product = new Product({
      id: nextId,
      name,
      category,
      price,
      discountPercentage: discountPercentage ?? 0,
      available: available ?? true,
      minOrderQuantity: minOrderQuantity ?? 1,
      maxOrderQuantity: maxOrderQuantity ?? 10,
      description,
      image,
      images,
      preparationTimeHours,
      availableDays,
      hasTaxes,
      allergens,
      customOptions,
      productionType,
      targetAudience,
      recommendations,
    });

    await product.save();

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to create product", 500);
  }
}

/**
 * Update product by ID
 */
export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const updateData = req.body;

    const product = await Product.findOneAndUpdate(
      { id: parseInt(idStr) },
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json({
      success: true,
      data: product,
      message: "Product updated successfully",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update product", 500);
  }
}

/**
 * Delete product by ID
 */
export async function deleteProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const product = await Product.findOneAndDelete({ id: parseInt(idStr) });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to delete product", 500);
  }
}

/**
 * Toggle product availability
 */
export async function toggleProductAvailability(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const product = await Product.findOne({ id: parseInt(idStr) });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    product.available = !product.available;
    product.updatedAt = new Date();
    await product.save();

    res.json({
      success: true,
      data: product,
      message: `Product ${product.available ? 'enabled' : 'disabled'} successfully`,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to toggle product availability", 500);
  }
}

/**
 * Reorder products (bulk update displayOrder)
 */
export async function reorderProducts(req: AuthRequest, res: Response) {
  try {
    const { orders } = req.body as { orders: { id: number; displayOrder: number }[] };

    await Promise.all(
      orders.map(({ id, displayOrder }) =>
        Product.findOneAndUpdate({ id }, { displayOrder, updatedAt: new Date() })
      )
    );

    res.json({
      success: true,
      message: "Products reordered successfully",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to reorder products", 500);
  }
}
