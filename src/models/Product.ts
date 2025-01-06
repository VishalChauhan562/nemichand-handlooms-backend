// src/models/Product.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  BeforeCreate,
  BeforeUpdate,
} from "sequelize-typescript";
import Category from "./Category";
import OrderItem from "./OrderItem";

@Table({ tableName: "products", timestamps: true })
export default class Product extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  sku!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  stock!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_featured!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  image_url!: string;

  @ForeignKey(() => Category)
  @Column(DataType.INTEGER)
  category_id!: number;

  @BelongsTo(() => Category)
  category!: Category;

  @BeforeCreate
  @BeforeUpdate
  static async validateFeaturedLimit(instance: Product) {
    if (instance.is_featured) {
      const featuredCount = await Product.count({
        where: { is_featured: true },
      });
      if (featuredCount >= 10) {
        throw new Error("The number of featured products cannot exceed 10.");
      }
    }
  }
}
