import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import  Cart  from "./Cart";
import Product from "./Product";

// CartItem.ts
@Table({ tableName: "cart_items", timestamps: true })
export default class CartItem extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Cart)
  @Column(DataType.INTEGER)
  cart_id!: number;

  @ForeignKey(() => Product)
  @Column(DataType.INTEGER)
  product_id!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  })
  quantity!: number;

  @BelongsTo(() => Cart)
  cart!: Cart;

  @BelongsTo(() => Product)  // Add this
  product!: Product;
}
