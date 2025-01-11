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
import User from "./User";
import CartItem from "./CartItem";

@Table({
  tableName: "carts",
  timestamps: true,
})
export default class Cart extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  user_id!: number;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => CartItem)
  items!: CartItem[];

  // Helper methods
  async addItem(productId: number, quantity: number = 1): Promise<void> {
    // First load cart items if not loaded
    const cartItems = await CartItem.findAll({
      where: { cart_id: this.id },
    });

    const existingItem = cartItems.find(
      (item) => item.product_id === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      await CartItem.create({
        cart_id: this.id,
        product_id: productId,
        quantity,
      });
    }
  }

  async removeItem(productId: number): Promise<void> {
    await CartItem.destroy({
      where: { cart_id: this.id, product_id: productId },
    });
    await this.save();
  }
}
