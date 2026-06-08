'use server';

import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import { getAuthedUser } from './auth';
import { revalidatePath } from 'next/cache';
export async function getFoods(categoryId?: string, search?: string) {
  try {
    const whereClause: Prisma.FoodWhereInput = { isAvailable: true };

    if (categoryId && categoryId !== 'all') {
      whereClause.categoryId = categoryId;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const foods = await db.food.findMany({
      where: whereClause,
      include: {
        category: true,
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    return foods.map(food => {
      const avgRating = food.reviews.length
        ? food.reviews.reduce((acc, curr) => acc + curr.rating, 0) / food.reviews.length
        : 4.5; 
      return {
        ...food,
        rating: Number(avgRating.toFixed(1)),
      };
    });
  } catch {
    console.error('getFoods error:');
    return [];
  }
}

// Fetch categories
export async function getCategories() {
  try {
    return await db.category.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (err) {
    console.error('getCategories error:', err);
    return [];
  }
}

// Fetch food details
export async function getFoodDetails(id: string) {
  try {
    const food = await db.food.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            student: {
              include: { user: { select: { name: true } } }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!food) return null;

    const avgRating = food.reviews.length
      ? food.reviews.reduce((acc, curr) => acc + curr.rating, 0) / food.reviews.length
      : 4.5;

    return {
      ...food,
      rating: Number(avgRating.toFixed(1)),
    };
  } catch (err) {
    console.error('getFoodDetails error:', err);
    return null;
  }
}

// Get AI/Trending recommendations
export async function getRecommendationsAction() {
  try {
    // Get popular foods based on price/availability for demo
    const foods = await db.food.findMany({
      where: { isAvailable: true },
      take: 4,
      orderBy: { price: 'desc' },
      include: {
        category: true,
        reviews: {
          select: { rating: true }
        }
      }
    });
    
    return foods.map(food => {
      const avgRating = food.reviews.length
        ? food.reviews.reduce((acc, curr) => acc + curr.rating, 0) / food.reviews.length
        : 4.8; // default recommended rating
      return {
        ...food,
        rating: Number(avgRating.toFixed(1)),
      };
    });
  } catch (err) {
    console.error('Recommendations error:', err);
    return [];
  }
}
export async function toggleFavoriteAction(foodId: string) {
  const user = await getAuthedUser();
  if (!user || !user.student) {
    return { error: 'Must be logged in as a student.' };
  }

  const studentId = user.student.id;

  try {
    const existing = await db.favorite.findUnique({
      where: {
        studentId_foodId: { studentId, foodId }
      }
    });

    if (existing) {
      await db.favorite.delete({
        where: { id: existing.id }
      });
      return { success: true, favorited: false };
    } else {
      await db.favorite.create({
        data: { studentId, foodId }
      });
      return { success: true, favorited: true };
    }
  } catch (err) {
    console.error('Toggle favorite error:', err);
    return { error: 'Could not update favorites.' };
  }
}

// Check if food is favorited by student
export async function isFoodFavorited(foodId: string) {
  const user = await getAuthedUser();
  if (!user || !user.student) return false;

  try {
    const fav = await db.favorite.findUnique({
      where: {
        studentId_foodId: {
          studentId: user.student.id,
          foodId
        }
      }
    });
    return !!fav;
  } catch {
    return false;
  }
}

// Add a review
export async function addReviewAction(foodId: string, rating: number, comment: string) {
  const user = await getAuthedUser();
  if (!user || !user.student) {
    return { error: 'Only logged-in students can leave reviews.' };
  }

  try {
    await db.review.create({
      data: {
        studentId: user.student.id,
        foodId,
        rating,
        comment
      }
    });
    revalidatePath(`/food/${foodId}`);
    return { success: true };
  } catch (err) {
    console.error('Add review error:', err);
    return { error: 'Could not submit review.' };
  }
}

// Admin: Add new food item
export async function addFoodAction(formData: FormData) {
  const user = await getAuthedUser();
  if (!user || user.role !== 'ADMIN') {
    return { error: 'Access denied.' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const imageUrl = formData.get('imageUrl') as string || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
  const preparationTime = parseInt(formData.get('preparationTime') as string) || 10;
  const categoryId = formData.get('categoryId') as string;

  if (!name || !description || isNaN(price) || !categoryId) {
    return { error: 'Invalid food data.' };
  }

  try {
    await db.food.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        preparationTime,
        categoryId
      }
    });
    revalidatePath('/menu');
    return { success: true };
  } catch (err) {
    console.error('Add food error:', err);
    return { error: 'Could not add food item.' };
  }
}

// Toggle food availability (Staff/Admin)
export async function updateFoodAvailabilityAction(foodId: string, isAvailable: boolean) {
  const user = await getAuthedUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return { error: 'Access denied.' };
  }

  try {
    await db.food.update({
      where: { id: foodId },
      data: { isAvailable }
    });
    revalidatePath('/menu');
    return { success: true };
  } catch (err) {
    console.error('Update food status error:', err);
    return { error: 'Could not update food status.' };
  }
}
