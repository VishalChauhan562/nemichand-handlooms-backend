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
import  WishlistItem  from "./WishListItem";


@Table({ tableName: "wishlists", timestamps: true })
export default class Wishlist extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  user_id!: number;

  @HasMany(() => WishlistItem)
  items!: WishlistItem[];

  @BelongsTo(() => User)
  user!: User;

  // Helper method to add a product
  async addProduct(productId: number): Promise<void> {
    const existingItem = this.items.find(item => item.product_id === productId);
    if (!existingItem) {
      await WishlistItem.create({ wishlist_id: this.id, product_id: productId });
    }
    await this.save();
  }

  // Helper method to remove a product
  async removeProduct(productId: number): Promise<void> {
    await WishlistItem.destroy({ where: { wishlist_id: this.id, product_id: productId } });
    await this.save();
  }
}
