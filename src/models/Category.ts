import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasMany,
  BeforeCreate,
  BeforeUpdate,
} from "sequelize-typescript";
import Product from "./Product";

@Table({
  tableName: "categories",
  timestamps: true,
})
export default class Category extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  description!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  desktopImage!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  mobileImage!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_featured!: boolean;

  @HasMany(() => Product)
  products!: Product[];

  @BeforeCreate
  @BeforeUpdate
  static async validateFeaturedLimit(instance: Category) {
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
