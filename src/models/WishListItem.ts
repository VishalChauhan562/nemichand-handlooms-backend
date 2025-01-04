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
import  Wishlist  from "./WishList";

@Table({ tableName: "wishlist_items", timestamps: true })
export default class WishlistItem extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  wishlist_item_id!: number;

  @ForeignKey(() => Wishlist)
  @Column(DataType.INTEGER)
  wishlist_id!: number;

  @Column(DataType.INTEGER)
  product_id!: number;

  @BelongsTo(() => Wishlist)
  wishlist!: Wishlist;
}