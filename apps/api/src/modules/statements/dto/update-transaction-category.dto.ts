import {
  CategorySchema,
  type Category
} from "@meudim/shared";
import { IsIn } from "class-validator";

export class UpdateTransactionCategoryDto {
  @IsIn(CategorySchema.options)
  category!: Category;
}
