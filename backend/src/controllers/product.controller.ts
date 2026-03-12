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

    const product = await Product.findOne({ id: parseInt(idStr) });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Apply updates field by field so Mongoose tracks changes properly
    const allowedFields = [
      "name", "category", "price", "discountPercentage", "available",
      "minOrderQuantity", "maxOrderQuantity", "description", "image", "images",
      "preparationTimeHours", "availableDays", "hasTaxes", "allergens",
      "productionType", "targetAudience", "customOptions", "recommendations",
      "displayOrder",
    ] as const;

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        (product as any)[field] = updateData[field];
      }
    }
    product.updatedAt = new Date();

    await product.save();

    res.json({
      success: true,
      data: product,
      message: "Product updated successfully",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Failed to update product:", error);
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

/**
 * Bulk update allergens for all products
 */
export async function updateAllProductsAllergens(req: AuthRequest, res: Response) {
  try {
    const { allergens } = req.body as { allergens?: string };

    if (typeof allergens !== "string") {
      throw new AppError("Le champ allergènes est requis", 400);
    }

    const normalizedAllergens = allergens.trim();

    const result = await Product.updateMany(
      {},
      {
        $set: {
          allergens: normalizedAllergens,
          updatedAt: new Date(),
        },
      },
    );

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
      },
      message: `Allergènes mis à jour pour ${result.modifiedCount} produit(s).`,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update allergens for all products", 500);
  }
}

/**
 * Bulk-enable client allergy text field on all products
 */
export async function enableClientAllergyTextField(req: AuthRequest, res: Response) {
  try {
    const OPTION_NAME = "Allergies / note client";
    let modifiedCount = 0;

    const products = await Product.find({});

    for (const product of products) {
      const options = Array.isArray(product.customOptions)
        ? [...product.customOptions]
        : [];

      const alreadyExists = options.some((opt) =>
        String(opt.name || "").toLowerCase().includes("allerg"),
      );

      if (!alreadyExists) {
        options.push({
          name: OPTION_NAME,
          type: "text",
          choices: [],
        });
        product.customOptions = options as any;
        product.updatedAt = new Date();
        await product.save();
        modifiedCount += 1;
      }
    }

    res.json({
      success: true,
      data: {
        modifiedCount,
      },
      message: `Zone allergènes client activée sur ${modifiedCount} produit(s).`,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to enable client allergy text field", 500);
  }
}
