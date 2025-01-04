import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import  User  from "./User";
import  CartItem  from "./CartItem";

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
    const existingItem = this.items.find(
      (item) => item.product_id === productId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      await CartItem.create({
        cart_id: this.id,
        product_id: productId,
        quantity,
      });
    }
    await this.save();
  }

  async removeItem(productId: number): Promise<void> {
    await CartItem.destroy({
      where: { cart_id: this.id, product_id: productId },
    });
    await this.save();
  }
}
